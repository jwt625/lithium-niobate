"""Data-layer tests: schemas, dispersion spot values, 3m symmetry, provenance, routing of unverified rows, JSON-LD."""

import json
import math
from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]
V1 = ROOT / "static" / "api" / "v1"


def load(p):
    return json.loads((ROOT / p).read_text(encoding="utf-8"))


# ---------------------------------------------------------------- schemas


def test_schemas_are_valid_2020_12(bd):
    schemas, _ = bd.load_schemas()
    assert {"common", "source", "variant", "scalar", "tensor", "dispersion", "event", "publication", "record", "glossary"} <= set(schemas)
    for s in schemas.values():
        assert s["$schema"] == "https://json-schema.org/draft/2020-12/schema"
        Draft202012Validator.check_schema(s)


def test_canonical_yaml_validates(bd):
    schemas, reg = bd.load_schemas()
    d = bd.load_all()
    assert bd.validate_all(d, schemas, reg) == []
    assert bd.check_refs(d) == []


def test_published_payloads_validate(bd):
    schemas, reg = bd.load_schemas()
    checks = [
        ("static/api/v1/properties.json", "records", "scalar"),
        ("static/api/v1/tensors.json", "records", "tensor"),
        ("static/api/v1/events/history.json", "events", "event"),
        ("static/api/v1/events/industry.json", "events", "event"),
        ("static/api/v1/publications.json", "publications", "publication"),
        ("static/api/v1/records.json", "records", "record"),
        ("static/api/v1/glossary.json", "terms", "glossary"),
        ("static/api/v1/sources.json", "sources", "source"),
        ("static/api/v1/variants.json", "variants", "variant"),
    ]
    for path, key, name in checks:
        v = Draft202012Validator(schemas[name], registry=reg)
        items = load(path)[key]
        assert items, path
        for it in items:
            errs = list(v.iter_errors(it))
            assert not errs, f"{path} {it.get('id')}: {errs[0].message}"
    v = Draft202012Validator(schemas["dispersion"], registry=reg)
    for m in load("static/api/v1/dispersion.json")["models"]:
        assert not list(v.iter_errors(load("static" + m["url"])["model"]))


def test_static_output_is_current_and_deterministic(build):
    """The files on disk equal a fresh in-memory build (byte for byte)."""
    for path, content in build["writer"].files.items():
        assert path.exists(), f"missing {path}; run uv run scripts/build_data.py"
        assert path.read_text(encoding="utf-8") == content, f"stale or nondeterministic: {path}"


def test_counts_in_range(build):
    c = build["index"]["counts"]
    assert 300 <= c["glossary_terms"] <= 500  # canonical terms merged with the chapter glossaries (INT 2026-10-25)
    assert c["sources"] >= 50
    assert c["history_events"] >= 50
    assert c["dispersion_models"] >= 4


# ---------------------------------------------------------------- dispersion


R06_SPOT = {  # R06 sec. 2.4 (Zelmon CLN, 21 C)
    ("zelmon1997-cln-o", 632.8): 2.2865, ("zelmon1997-cln-e", 632.8): 2.2022,
    ("zelmon1997-cln-o", 1064): 2.2321, ("zelmon1997-cln-e", 1064): 2.1555,
    ("zelmon1997-cln-o", 1550): 2.2111, ("zelmon1997-cln-e", 1550): 2.1376,
    ("zelmon1997-mgo5-o", 1550): 2.2082, ("zelmon1997-mgo5-e", 1550): 2.1299,
}


@pytest.mark.parametrize("key", sorted(R06_SPOT, key=str))
def test_dispersion_spot_values(bd, data, key):
    m = {x["id"]: x for x in data["dispersion"]}[key[0]]
    assert abs(bd.n_model(m, key[1] / 1000) - R06_SPOT[key]) < 6e-5


def test_dispersion_check_values(bd, data):
    for m in data["dispersion"]:
        for cv in m["check_values"]:
            n = bd.n_model(m, cv["lambda_nm"] / 1000, cv["T_C"] if m.get("temperature_dependent") else None)
            assert abs(n - cv["n"]) <= cv["tolerance"], (m["id"], cv)


def test_negative_uniaxial_over_validity(bd, data):
    models = {(m["provenance"]["source_id"], m["variant"], m["axis"]): m for m in data["dispersion"]}
    pairs = [(k[0], k[1]) for k in models if k[2] == "o" and (k[0], k[1], "e") in models]
    assert len(pairs) >= 3
    for src, var in pairs:
        mo, me = models[(src, var, "o")], models[(src, var, "e")]
        lo = max(mo["valid_lambda_um"][0], me["valid_lambda_um"][0])
        hi = min(mo["valid_lambda_um"][1], me["valid_lambda_um"][1])
        nm = int(math.ceil(lo * 1000))
        while nm <= hi * 1000:
            assert bd.n_model(me, nm / 1000) < bd.n_model(mo, nm / 1000), (src, var, nm)
            nm += 1


def test_mgo5_erratum_applied(data):
    m = {x["id"]: x for x in data["dispersion"]}
    for axis in "oe":
        er = m[f"zelmon1997-mgo5-{axis}"]["errata"]
        assert any(e.get("doi") == "10.1364/JOSAB.616304" and e["applied"] for e in er)


def test_grids_cover_validity_at_1nm(data):
    for m in data["dispersion"]:
        lo, hi = m["valid_lambda_um"]
        path = V1 / "grids" / "index" / m["id"] / f"T{m['reference_T_C']:g}C.csv"
        rows = path.read_text().strip().splitlines()
        assert rows[0] == "lambda_nm,n"
        nms = [int(r.split(",")[0]) for r in rows[1:]]
        assert nms[0] == round(lo * 1000) and nms[-1] == round(hi * 1000)
        assert all(b - a == 1 for a, b in zip(nms, nms[1:]))


# ---------------------------------------------------------------- tensors


def _rot_z(deg):
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    return [[c, -s, 0], [s, c, 0], [0, 0, 1]]


MIRROR_X = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]


def _transform(T, R, rank):
    import itertools

    idx = list(itertools.product(range(3), repeat=rank))

    def get(t, ix):
        for i in ix:
            t = t[i]
        return t

    out = {}
    for ix in idx:
        acc = 0.0
        for jx in idx:
            f = 1.0
            for a, b in zip(ix, jx):
                f *= R[a][b]
                if f == 0:
                    break
            if f:
                acc += f * get(T, jx)
        out[ix] = acc
    return out, {ix: get(T, ix) for ix in idx}


def test_tensors_have_3m_symmetry(data):
    assert data["tensors"]
    for t in data["tensors"]:
        full = t["full"]
        scale = max(abs(v["value"]) for v in t["independent"].values())
        for R in (_rot_z(120), MIRROR_X):
            new, old = _transform(full, R, t["rank"])
            for ix in old:
                assert abs(new[ix] - old[ix]) <= 1e-9 * scale, (t["id"], ix, new[ix], old[ix])


def test_full_tensor_index_symmetries(data):
    for t in data["tensors"]:
        f = t["full"]
        if t["tensor"] in ("elastic-stiffness-cE", "elastic-compliance-sE"):
            for i in range(3):
                for j in range(3):
                    for k in range(3):
                        for l in range(3):
                            assert f[i][j][k][l] == f[j][i][k][l] == f[i][j][l][k] == f[k][l][i][j]
        if t["tensor"] in ("piezo-stress-e", "piezo-strain-d", "nlo-d"):
            for i in range(3):
                for j in range(3):
                    for k in range(3):
                        assert f[i][j][k] == f[i][k][j]
        if t["tensor"] in ("eo-rT", "eo-rS"):
            for i in range(3):
                for j in range(3):
                    for k in range(3):
                        assert f[i][j][k] == f[j][i][k]


def test_voigt_conventions_engineering(data):
    T = {t["id"]: t for t in data["tensors"]}
    s = T["elastic-compliance-sE/cln/kushibiki1999"]
    v, f = s["voigt"], s["full"]
    assert math.isclose(v[5][5], 2 * (v[0][0] - v[0][1]), rel_tol=1e-9)
    assert math.isclose(f[0][1][0][1], v[5][5] / 4, rel_tol=1e-9)
    d = T["piezo-strain-d/cln/kushibiki1999"]
    assert math.isclose(d["voigt"][0][5], -2 * d["independent"]["d22"]["value"], rel_tol=1e-9)
    assert math.isclose(d["full"][0][0][1], d["voigt"][0][5] / 2, rel_tol=1e-9)
    c = T["elastic-stiffness-cE/cln/kushibiki1999"]
    assert math.isclose(c["voigt"][5][5], 72.095, abs_tol=1e-9)


def test_derived_kushibiki_values_match_r06(data, build):
    T = {t["id"]: t for t in data["tensors"]}
    s = {k: v["value"] for k, v in T["elastic-compliance-sE/cln/kushibiki1999"]["independent"].items()}
    for k, ref in {"s11": 5.854, "s12": -1.182, "s13": -1.356, "s14": -0.920, "s33": 5.058, "s44": 16.949}.items():
        assert abs(s[k] - ref) < 1.5e-3, k
    d = {k: v["value"] for k, v in T["piezo-strain-d/cln/kushibiki1999"]["independent"].items()}
    for k, ref in {"d15": 66.4, "d22": 20.3, "d31": -1.04, "d33": 8.7}.items():
        assert abs(d[k] - ref) < 0.06, k
    c = data["_consistency"]
    assert abs(c["eps11T"] - 83.3) < 0.2 and abs(c["eps33T"] - 28.5) < 0.2
    assert abs(c["v_stiff"] - 7328.6) < 0.5 and abs(c["v_plain"] - 7102.1) < 0.5
    assert T["elastic-compliance-sE/cln/kushibiki1999"]["provenance"]["status"] == "C"


def test_r51_clamped_spread_not_blended(build):
    p = load("static/api/v1/tensors/eo-rS.json")
    assert p["spread"]["r51"]["min"] == 18.2 and p["spread"]["r51"]["max"] == 28
    for v in ("cln", "unspecified"):
        assert load(f"static/api/v1/tensors/eo-rS/{v}.json")["recommended"] is None


# ---------------------------------------------------------------- provenance


def test_every_public_value_resolves_to_a_source(data):
    src = {s["id"]: s for s in data["sources"]}
    for r in data["scalars"] + data["tensors"] + data["dispersion"]:
        if not r["public"]:
            continue
        s = src[r["provenance"]["source_id"]]
        assert s.get("doi") or s.get("url") or s.get("arxiv") or s.get("isbn") or s["type"] in ("thesis", "datasheet", "report", "article-journal"), r["id"]
        if r["provenance"].get("via"):
            assert r["provenance"]["via"] in src
        assert r["provenance"]["status"] in ("P", "P(abs)", "P-comp", "P-db", "S", "V", "C")
    for g in data["glossary"]:
        assert g["sources"] and all(s["source_id"] in src for s in g["sources"])
    for e in data["history"] + data["industry"]:
        assert e["citations"] and all(c.get("text") for c in e["citations"])
        if e["kind"] == "industry":
            assert all(c.get("url") or c.get("doi") for c in e["citations"]) and e.get("access_date")
    for r in data["records"]:
        assert r.get("doi") or r.get("arxiv") or r.get("url")
    for p in data["publications"]:
        assert p.get("doi") or p.get("arxiv") or p.get("url")


def test_status_c_records_state_derivation(data):
    for r in data["scalars"] + data["tensors"]:
        if r["provenance"]["status"] == "C":
            assert r["provenance"].get("derivation"), r["id"]


def test_no_local_paths_or_emoji_in_outputs(build):
    import re

    bad = re.compile(r"(?<![\w.])/(Users|private|home)/|~/Documents|[\U0001F300-\U0001FAFF☀-➿]")
    for path, content in build["writer"].files.items():
        assert not bad.search(content), path


# ---------------------------------------------------------------- unverified routing


def test_no_unverified_rows_in_default_endpoints():
    for path in ("static/api/v1/properties.json", "static/api/v1/tensors.json"):
        assert all(r["provenance"]["status"] != "U" for r in load(path)["records"])
    assert all(e["status"] != "U" for e in load("static/api/v1/events/history.json")["events"])
    assert all(e["verified"] for e in load("static/api/v1/events/industry.json")["events"])
    assert all(r["verification"] not in ("unverified", "simulation") for r in load("static/api/v1/records.json")["records"])
    for p in V1.glob("properties/**/*.json"):
        txt = p.read_text()
        assert '"status": "U"' not in txt, p
    assert '"status": "U"' not in (ROOT / "static" / "llms-full.txt").read_text()


def test_unverified_endpoint_holds_excluded_rows(data):
    u = load("static/api/v1/unverified.json")
    n_u = sum(1 for r in data["scalars"] + data["tensors"] if r["provenance"]["status"] == "U")
    assert len(u["scalars"]) + len(u["tensors"]) == n_u >= 1
    assert all(r["provenance"]["status"] == "U" for r in u["scalars"])
    assert any(e["kind"] == "history" and e["status"] == "U" for e in u["events"])
    assert all(r["verification"] in ("unverified", "simulation") for r in u["records"])


def test_vendor_values_never_default(data):
    for r in data["scalars"] + data["tensors"]:
        if r["provenance"]["status"] == "V":
            assert not r.get("default"), r["id"]


# ---------------------------------------------------------------- JSON-LD, llms.txt, datapackage, openapi


def test_jsonld_helper_output_valid(bd, build):
    jl = build["jsonld"]
    assert jl
    for prop, ds in jl.items():
        json.dumps(ds)
        assert ds["@context"] == "https://schema.org" and ds["@type"] == "Dataset"
        assert ds["name"] and 50 <= len(ds["description"]) <= 5000
        assert ds["license"] == "https://creativecommons.org/licenses/by/4.0/"
        assert ds["creator"]["name"] and ds["isAccessibleForFree"] is True
        assert ds["about"]["chemicalComposition"] in ("LiNbO3", "LiTaO3")
        assert ds["about"]["chemicalComposition"] == "LiNbO3" or prop in ("elastic-c14", "eo-r33")
        assert ds["variableMeasured"] and all(v["@type"] == "PropertyValue" and v["unitText"] for v in ds["variableMeasured"])
        assert all(dl["@type"] == "DataDownload" and dl["contentUrl"].startswith("https://") for dl in ds["distribution"])
        assert all(c.startswith("https://") for c in ds["citation"])


def test_llms_txt_format():
    txt = (ROOT / "static" / "llms.txt").read_text()
    lines = txt.splitlines()
    assert lines[0].startswith("# ") and lines[2].startswith("> ")
    assert "CC BY 4.0" in txt and "## API" in txt
    assert "](https://lithium-niobate.com/api/v1/index.json)" in txt


def test_license_stated():
    assert load("static/api/v1/index.json")["license"]["id"] == "CC-BY-4.0"
    dp = load("static/api/v1/datapackage.json")
    assert dp["licenses"][0]["name"] == "CC-BY-4.0"
    assert dp["$schema"].startswith("https://datapackage.org/profiles/2.0/")
    for res in dp["resources"]:
        assert (V1 / res["path"]).exists(), res["path"]
        for f in res["schema"]["fields"]:
            if f["type"] in ("number", "integer") and f["name"] not in ("uncertainty",):
                assert "unit_ucum" in f, (res["name"], f["name"])


def test_openapi_paths_resolve():
    oa = load("static/api/openapi.json")
    assert oa["openapi"].startswith("3.1")
    for p, op in oa["paths"].items():
        assert "get" in op and "200" in op["get"]["responses"]
        if "{" not in p:
            assert (ROOT / "static" / p.lstrip("/")).exists(), p
        else:
            for prm in op["get"].get("parameters", []):
                assert prm["in"] == "path"


def test_citation_cff():
    cff = yaml.safe_load((ROOT / "CITATION.cff").read_text())
    assert cff["cff-version"] == "1.2.0"
    assert cff["authors"][0]["family-names"] == "Jiang"
    assert "CC-BY-4.0" in json.dumps(cff) and "GPL-3.0" in json.dumps(cff)
