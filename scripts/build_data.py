# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6", "jsonschema>=4.18"]
# ///
"""Build the lithium-niobate.com static data API from canonical YAML in data/.

Validates every record against data/schema/*.schema.json, checks references (sources,
variants, glossary links), generates tensor representations (Voigt, full, symmetry form),
derived records (status C), dispersion grids and exports, and writes:

  static/api/openapi.json, static/api/v1/**      static JSON/CSV/YAML API (path-parameterized)
  static/llms.txt, static/llms-full.txt          agent index (llmstxt.org format)
  src/lib/generated/*.json                       copies for the app

Output is deterministic (sorted keys, stable ordering, no timestamps).

usage: uv run scripts/build_data.py [--check]   (--check: validate only, write nothing)
"""

from __future__ import annotations

import copy
import csv
import datetime as _dt
import io
import json
import math
import re
import shutil
import sys
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SCHEMA_DIR = DATA / "schema"
STATIC = ROOT / "static"
API = STATIC / "api"
V1 = API / "v1"
GENERATED = ROOT / "src" / "lib" / "generated"

SITE = "https://lithium-niobate.com"
API_VERSION = "v1"
DATA_VERSION = "0.1.0"
DATA_LICENSE = {"id": "CC-BY-4.0", "name": "Creative Commons Attribution 4.0 International", "url": "https://creativecommons.org/licenses/by/4.0/"}
CODE_LICENSE = {"id": "GPL-3.0", "url": "https://www.gnu.org/licenses/gpl-3.0.html"}
AUTHOR = "Wentao Jiang"
EPS0 = 8.8541878128e-12  # F/m (CODATA 2018)

SPOT_WAVELENGTHS_NM = (632.8, 1064.0, 1550.0)

# ---------------------------------------------------------------- helpers


class BuildError(Exception):
    pass


def _iso(obj: Any) -> Any:
    """Convert YAML-parsed dates to ISO strings recursively."""
    if isinstance(obj, (_dt.date, _dt.datetime)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _iso(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_iso(v) for v in obj]
    return obj


def load_yaml(path: Path) -> Any:
    return _iso(yaml.safe_load(path.read_text(encoding="utf-8")))


def load_list(path: Path) -> list[dict]:
    items = load_yaml(path)
    if not isinstance(items, list):
        raise BuildError(f"{path.relative_to(ROOT)}: top level must be a list")
    return [it for it in items if not (isinstance(it, dict) and it.get("_anchor_only"))]


def sig(x: float, n: int = 6) -> float:
    """Round to n significant digits (stable float output for derived values)."""
    if x == 0 or not math.isfinite(x):
        return 0.0 if x == 0 else x
    r = round(x, -int(math.floor(math.log10(abs(x)))) + (n - 1))
    return 0.0 if r == 0 else r


def dumps(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, indent=2, ensure_ascii=False) + "\n"


def slug_t(t: float) -> str:
    return f"{t:g}"


# ---------------------------------------------------------------- schemas


def load_schemas() -> tuple[dict[str, dict], Registry]:
    schemas: dict[str, dict] = {}
    reg = Registry()
    for p in sorted(SCHEMA_DIR.glob("*.schema.json")):
        s = json.loads(p.read_text(encoding="utf-8"))
        schemas[p.name.removesuffix(".schema.json")] = s
        reg = reg.with_resource(s["$id"], Resource.from_contents(s))
    return schemas, reg


def validator(schemas: dict, reg: Registry, name: str) -> Draft202012Validator:
    return Draft202012Validator(schemas[name], registry=reg)


# ---------------------------------------------------------------- tensor forms (point group 3m, x perpendicular to a mirror)

VOIGT = {(0, 0): 0, (1, 1): 1, (2, 2): 2, (1, 2): 3, (2, 1): 3, (0, 2): 4, (2, 0): 4, (0, 1): 5, (1, 0): 5}
VOIGT_ORDER = ["xx", "yy", "zz", "yz", "xz", "xy"]

FORMS: dict[str, dict[str, Any]] = {
    "permittivity": {
        "shape": "3x3",
        "keys": ["eps11", "eps33"],
        "form": [["eps11", "0", "0"], ["0", "eps11", "0"], ["0", "0", "eps33"]],
        "relations": ["eps22 = eps11", "off-diagonal = 0"],
    },
    "elastic-stiffness-cE": {
        "shape": "6x6",
        "keys": ["c11", "c12", "c13", "c14", "c33", "c44"],
        "form": [
            ["c11", "c12", "c13", "c14", "0", "0"],
            ["c12", "c11", "c13", "-c14", "0", "0"],
            ["c13", "c13", "c33", "0", "0", "0"],
            ["c14", "-c14", "0", "c44", "0", "0"],
            ["0", "0", "0", "0", "c44", "c14"],
            ["0", "0", "0", "0", "c14", "(c11-c12)/2"],
        ],
        "relations": ["c22 = c11", "c23 = c13", "c24 = -c14", "c55 = c44", "c56 = c14", "c66 = (c11 - c12)/2"],
    },
    "elastic-compliance-sE": {
        "shape": "6x6",
        "keys": ["s11", "s12", "s13", "s14", "s33", "s44"],
        "form": [
            ["s11", "s12", "s13", "s14", "0", "0"],
            ["s12", "s11", "s13", "-s14", "0", "0"],
            ["s13", "s13", "s33", "0", "0", "0"],
            ["s14", "-s14", "0", "s44", "0", "0"],
            ["0", "0", "0", "0", "s44", "2*s14"],
            ["0", "0", "0", "0", "2*s14", "2*(s11-s12)"],
        ],
        "relations": ["s22 = s11", "s23 = s13", "s24 = -s14", "s55 = s44", "s56 = 2 s14", "s66 = 2 (s11 - s12)"],
    },
    "piezo-stress-e": {
        "shape": "3x6",
        "keys": ["e15", "e22", "e31", "e33"],
        "form": [["0", "0", "0", "0", "e15", "-e22"], ["-e22", "e22", "0", "e15", "0", "0"], ["e31", "e31", "e33", "0", "0", "0"]],
        "relations": ["e16 = -e22", "e21 = -e22", "e24 = e15", "e32 = e31"],
    },
    "piezo-strain-d": {
        "shape": "3x6",
        "keys": ["d15", "d22", "d31", "d33"],
        "form": [["0", "0", "0", "0", "d15", "-2*d22"], ["-d22", "d22", "0", "d15", "0", "0"], ["d31", "d31", "d33", "0", "0", "0"]],
        "relations": ["d16 = -2 d22", "d21 = -d22", "d24 = d15", "d32 = d31"],
    },
    "eo-r": {
        "shape": "6x3",
        "keys": ["r13", "r22", "r33", "r51"],
        "form": [["0", "-r22", "r13"], ["0", "r22", "r13"], ["0", "0", "r33"], ["0", "r51", "0"], ["r51", "0", "0"], ["-r22", "0", "0"]],
        "relations": ["r12 = -r22", "r23 = r13", "r42 = r51", "r61 = -r22"],
    },
    "photoelastic-p": {
        "shape": "6x6",
        "keys": ["p11", "p12", "p13", "p14", "p31", "p33", "p41", "p44"],
        "form": [
            ["p11", "p12", "p13", "p14", "0", "0"],
            ["p12", "p11", "p13", "-p14", "0", "0"],
            ["p31", "p31", "p33", "0", "0", "0"],
            ["p41", "-p41", "0", "p44", "0", "0"],
            ["0", "0", "0", "0", "p44", "p41"],
            ["0", "0", "0", "0", "p14", "(p11-p12)/2"],
        ],
        "relations": ["p22 = p11", "p23 = p13", "p24 = -p14", "p32 = p31", "p42 = -p41", "p55 = p44", "p56 = p41", "p65 = p14", "p66 = (p11 - p12)/2", "p_IJ is not symmetric (p14 != p41)"],
    },
    "nlo-d": {
        "shape": "3x6",
        "keys": ["d22", "d31", "d33"],
        "form": [["0", "0", "0", "0", "d31", "-d22"], ["-d22", "d22", "0", "d31", "0", "0"], ["d31", "d31", "d33", "0", "0", "0"]],
        "relations": ["Kleinman symmetry: d15 = d24 = d31", "d16 = d21 = -d22", "d32 = d31"],
    },
}

TENSOR_FORM = {
    "permittivity-T": "permittivity",
    "permittivity-S": "permittivity",
    "elastic-stiffness-cE": "elastic-stiffness-cE",
    "elastic-compliance-sE": "elastic-compliance-sE",
    "piezo-stress-e": "piezo-stress-e",
    "piezo-strain-d": "piezo-strain-d",
    "eo-rT": "eo-r",
    "eo-rS": "eo-r",
    "photoelastic-p": "photoelastic-p",
    "nlo-d": "nlo-d",
}

FULL_RULE = {
    "permittivity": "full[i][j] = M[i][j]",
    "elastic-stiffness-cE": "C_ijkl = c_IJ, I = V(ij), J = V(kl)",
    "elastic-compliance-sE": "s_ijkl = s_IJ x (1 if I<=3 else 1/2) x (1 if J<=3 else 1/2) (engineering shear strain)",
    "piezo-stress-e": "e_ijk = e_iJ, J = V(jk)",
    "piezo-strain-d": "d_ijk = d_iJ x (1 if J<=3 else 1/2) (engineering shear strain)",
    "eo-r": "r_ijk = r_Ik, I = V(ij) (impermeability change d(eta)_ij = r_ijk E_k)",
    "photoelastic-p": "p_ijkl = p_IJ, I = V(ij), J = V(kl) (d(eta)_I = p_IJ S_J with engineering S_4..S_6)",
    "nlo-d": "d_ijk = d_iJ, J = V(jk) (contracted SHG convention)",
}


def eval_form(form: list[list[str]], vals: dict[str, float]) -> list[list[float]]:
    env = {"__builtins__": {}}
    return [[float(eval(expr, env, dict(vals))) if expr != "0" else 0.0 for expr in row] for row in form]  # noqa: S307 (fixed internal expressions)


def full_from_voigt(form_name: str, M: list[list[float]]) -> list:
    r3 = range(3)
    if form_name == "permittivity":
        return [[M[i][j] for j in r3] for i in r3]
    if form_name in ("elastic-stiffness-cE", "photoelastic-p"):
        return [[[[M[VOIGT[i, j]][VOIGT[k, l]] for l in r3] for k in r3] for j in r3] for i in r3]
    if form_name == "elastic-compliance-sE":
        f = lambda a: 1.0 if a < 3 else 0.5  # noqa: E731
        return [[[[M[VOIGT[i, j]][VOIGT[k, l]] * f(VOIGT[i, j]) * f(VOIGT[k, l]) for l in r3] for k in r3] for j in r3] for i in r3]
    if form_name in ("piezo-stress-e", "nlo-d"):
        return [[[M[i][VOIGT[j, k]] for k in r3] for j in r3] for i in r3]
    if form_name == "piezo-strain-d":
        return [[[M[i][VOIGT[j, k]] * (1.0 if VOIGT[j, k] < 3 else 0.5) for k in r3] for j in r3] for i in r3]
    if form_name == "eo-r":
        return [[[M[VOIGT[i, j]][k] for k in r3] for j in r3] for i in r3]
    raise BuildError(f"no full rule for {form_name}")


def clean(x: Any) -> Any:
    if isinstance(x, float):
        return sig(x, 10)
    if isinstance(x, list):
        return [clean(v) for v in x]
    return x


def matinv(A: list[list[float]]) -> list[list[float]]:
    n = len(A)
    M = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(A)]
    for c in range(n):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        if abs(M[p][c]) < 1e-15:
            raise BuildError("singular matrix")
        M[c], M[p] = M[p], M[c]
        piv = M[c][c]
        M[c] = [v / piv for v in M[c]]
        for r in range(n):
            if r != c and M[r][c] != 0:
                f = M[r][c]
                M[r] = [a - f * b for a, b in zip(M[r], M[c])]
    return [row[n:] for row in M]


def matmul(A: list[list[float]], B: list[list[float]]) -> list[list[float]]:
    return [[sum(A[i][k] * B[k][j] for k in range(len(B))) for j in range(len(B[0]))] for i in range(len(A))]


def complete_tensor(rec: dict) -> dict:
    form_name = TENSOR_FORM[rec["tensor"]]
    F = FORMS[form_name]
    ind = rec["independent"]
    missing = [k for k in F["keys"] if k not in ind]
    extra = [k for k in ind if k not in F["keys"]]
    if missing or extra:
        raise BuildError(f"{rec['id']}: independent components missing {missing} / unexpected {extra}")
    vals = {k: float(ind[k]["value"]) for k in F["keys"]}
    M = eval_form(F["form"], vals)
    rec["voigt"] = clean(M)
    rec["full"] = clean(full_from_voigt(form_name, M))
    rec["symmetry_form"] = {
        "point_group": "3m",
        "mirror": "x = 0 plane (x perpendicular to the mirror, z polar)",
        "relations": F["relations"],
        "form": F["form"],
    }
    if form_name != "permittivity":
        rec["voigt_convention"] = {"order": VOIGT_ORDER, "shear_strain": "engineering", "full_from_voigt": FULL_RULE[form_name]}
    else:
        rec["voigt_convention"] = {"order": ["x", "y", "z"], "full_from_voigt": FULL_RULE[form_name]}
    rec.setdefault("scale", 1)
    return rec


# ---------------------------------------------------------------- dispersion


def n_model(model: dict, lam_um: float, T_C: float | None = None) -> float:
    c = model["coefficients"]
    form = model["formula"]["form"]
    L2 = lam_um * lam_um
    if form == "sellmeier-3term":
        n2 = 1 + sum(c[f"B{i}"] * L2 / (L2 - c[f"C{i}"]) for i in (1, 2, 3))
    elif form == "gayer-2008":
        T = model["reference_T_C"] if T_C is None else T_C
        f = (T - 24.5) * (T + 570.82)
        n2 = c["a1"] + c["b1"] * f + (c["a2"] + c["b2"] * f) / (L2 - (c["a3"] + c["b3"] * f) ** 2) + (c["a4"] + c["b4"] * f) / (L2 - c["a5"] ** 2) - c["a6"] * L2
    else:
        raise BuildError(f"unknown formula {form}")
    return math.sqrt(n2)


def grid_rows(model: dict) -> list[tuple[int, float]]:
    lo, hi = model["valid_lambda_um"]
    start, stop = int(math.ceil(lo * 1000 - 1e-9)), int(math.floor(hi * 1000 + 1e-9))
    return [(nm, round(n_model(model, nm / 1000.0), 6)) for nm in range(start, stop + 1)]


def rii_yaml(model: dict, src: dict) -> str:
    lines = [
        "# refractiveindex.info-compatible export generated by lithium-niobate.com (data: CC BY 4.0)",
        "REFERENCES: |",
        f"    {cite_text(src)}",
        "COMMENTS: |",
        f"    {model['name']}. Axis {model['axis']}. Reference temperature {slug_t(model['reference_T_C'])} C. Status {model['provenance']['status']}.",
    ]
    for e in model.get("errata", []):
        lines.append(f"    Erratum: {e['citation']} (applied: {str(e['applied']).lower()}).")
    lines += ["CONDITIONS:", f"    temperature: {model['reference_T_C'] + 273.15:.2f}", f"    direction: {model['axis']}", "DATA:"]
    lo, hi = model["valid_lambda_um"]
    if model["formula"]["form"] == "sellmeier-3term":
        c = model["coefficients"]
        coeffs = " ".join(f"{v:g}" for v in (0, c["B1"], c["C1"], c["B2"], c["C2"], c["B3"], c["C3"]))
        lines += ["  - type: formula 2", f"    wavelength_range: {lo:g} {hi:g}", f"    coefficients: {coeffs}"]
    else:
        lines += ["  - type: tabulated n", "    data: |"]
        nm = int(math.ceil(lo * 1000))
        while nm <= hi * 1000 + 1e-9:
            lines.append(f"        {nm / 1000:.3f} {n_model(model, nm / 1000):.6f}")
            nm += 10
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------- citations


def cite_text(s: dict) -> str:
    au = s.get("author") or s.get("editor") or []
    names = []
    for a in au[:3]:
        if "literal" in a:
            names.append(a["literal"])
        else:
            names.append(" ".join(x for x in (a.get("given"), a.get("family")) if x))
    if len(au) > 3:
        names.append("et al.")
    parts = [", ".join(names)] if names else []
    parts.append(f'"{s["title"]}"')
    venue = " ".join(x for x in (s.get("container_title"), s.get("volume")) if x)
    loc = s.get("page") or s.get("article_number")
    if venue:
        parts.append(venue + (f", {loc}" if loc else ""))
    parts.append(f"({s['issued'][:4]})")
    if s.get("doi"):
        parts.append(f"doi:{s['doi']}")
    elif s.get("arxiv"):
        parts.append(f"arXiv:{s['arxiv']}")
    elif s.get("url"):
        parts.append(s["url"])
    return ", ".join(parts[:-1]) + " " + parts[-1] if len(parts) > 1 else parts[0]


def source_link(s: dict) -> str | None:
    if s.get("doi"):
        return f"https://doi.org/{s['doi']}"
    if s.get("arxiv"):
        return f"https://arxiv.org/abs/{s['arxiv']}"
    return s.get("url")


# ---------------------------------------------------------------- load + validate


def load_all() -> dict[str, Any]:
    d: dict[str, Any] = {}
    d["sources"] = load_list(DATA / "sources.yaml")
    d["variants"] = load_list(DATA / "variants.yaml")
    props: list[dict] = []
    for p in sorted((DATA / "properties").glob("*.yaml")):
        props += load_list(p)
    d["scalars"] = [r for r in props if r.get("kind") == "scalar"]
    d["tensors"] = [r for r in props if r.get("kind") == "tensor"]
    stray = [r.get("id") for r in props if r.get("kind") not in ("scalar", "tensor")]
    if stray:
        raise BuildError(f"property records without kind: {stray}")
    disp: list[dict] = []
    for p in sorted((DATA / "dispersion").glob("*.yaml")):
        disp += load_list(p)
    d["dispersion"] = disp
    d["history"] = load_list(DATA / "events" / "history.yaml")
    d["industry"] = load_list(DATA / "events" / "industry.yaml")
    d["publications"] = load_list(DATA / "publications.yaml")
    d["records"] = load_list(DATA / "records.yaml")
    d["glossary"] = load_list(DATA / "glossary.yaml")
    return d


SCHEMA_OF = {
    "sources": "source",
    "variants": "variant",
    "scalars": "scalar",
    "tensors": "tensor",
    "dispersion": "dispersion",
    "history": "event",
    "industry": "event",
    "publications": "publication",
    "records": "record",
    "glossary": "glossary",
}


def validate_all(d: dict, schemas: dict, reg: Registry) -> list[str]:
    errs: list[str] = []
    for key, sname in SCHEMA_OF.items():
        v = validator(schemas, reg, sname)
        seen: set[str] = set()
        for it in d[key]:
            for e in v.iter_errors(it):
                errs.append(f"{key}:{it.get('id')}: {'/'.join(map(str, e.path))}: {e.message[:240]}")
            if it.get("id") in seen:
                errs.append(f"{key}: duplicate id {it.get('id')}")
            seen.add(it.get("id"))
    # cross-file uniqueness of property-record ids
    ids = [r["id"] for r in d["scalars"] + d["tensors"]]
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        errs.append(f"duplicate property ids across files: {dup}")
    return errs


def check_refs(d: dict) -> list[str]:
    errs: list[str] = []
    src = {s["id"] for s in d["sources"]}
    var = {v["id"] for v in d["variants"]}
    gl = {g["id"] for g in d["glossary"]}
    for r in d["scalars"] + d["tensors"] + d["dispersion"]:
        pv = r["provenance"]
        for k in ("source_id", "via"):
            if pv.get(k) and pv[k] not in src:
                errs.append(f"{r['id']}: provenance.{k} '{pv[k]}' not in sources")
        if r["variant"] not in var:
            errs.append(f"{r['id']}: variant '{r['variant']}' not in variants")
        parts = r["id"].split("/")
        if "kind" in r and (len(parts) != 3 or parts[1] != r["variant"] or parts[0] != (r.get("property") or r.get("tensor"))):
            errs.append(f"{r['id']}: id must be <property|tensor>/<variant>/<source>")
    for g in d["glossary"]:
        for s in g["sources"]:
            if s["source_id"] not in src:
                errs.append(f"glossary {g['id']}: source '{s['source_id']}' not in sources")
        for rel in g.get("related", []):
            if rel not in gl:
                errs.append(f"glossary {g['id']}: related '{rel}' not a glossary id")
    for e in d["history"] + d["industry"]:
        if not any(c.get("doi") or c.get("url") or c.get("text") for c in e["citations"]):
            errs.append(f"event {e['id']}: no citation")
    if sum(1 for v in d["variants"] if v.get("default")) != 1:
        errs.append("exactly one default variant required")
    return errs


# ---------------------------------------------------------------- derived records


def by_id(items: list[dict]) -> dict[str, dict]:
    return {it["id"]: it for it in items}


def derive(d: dict) -> None:
    """Add derived (status C) tensor and scalar records and consistency checks."""
    T = by_id(d["tensors"])
    cE = T["elastic-stiffness-cE/cln/kushibiki1999"]
    eK = T["piezo-stress-e/cln/kushibiki1999"]
    epsS = T["permittivity-S/cln/kushibiki1999"]
    epsT = T["permittivity-T/cln/kushibiki1999"]
    rho = by_id(d["scalars"])["density/cln/kushibiki1999"]["value"]
    for r in (cE, eK, epsS, epsT):
        complete_tensor(r)

    # s^E = inverse of c^E (Voigt, engineering shear strain); GPa^-1 -> 1e-12 m^2/N
    S = [[v * 1000.0 for v in row] for row in matinv(cE["voigt"])]
    s_rec = {
        "id": "elastic-compliance-sE/cln/kushibiki1999",
        "kind": "tensor",
        "tensor": "elastic-compliance-sE",
        "name": "Elastic compliance at constant electric field",
        "symbol": "s^E",
        "rank": 4,
        "unit": {"ucum": "10*-12.m2/N", "display": "1e-12 m^2/N"},
        "variant": "cln",
        "variant_note": cE.get("variant_note", ""),
        "conditions": {"electrical_boundary": "E"},
        "frame": copy.deepcopy(cE["frame"]),
        "independent": {k: {"value": sig(S[i][j], 6)} for k, (i, j) in {"s11": (0, 0), "s12": (0, 1), "s13": (0, 2), "s14": (0, 3), "s33": (2, 2), "s44": (3, 3)}.items()},
        "provenance": {"source_id": "kushibiki1999", "status": "C", "derivation": "inverse of the kushibiki1999 c^E Voigt matrix (engineering shear strain), computed by scripts/build_data.py", "research_note": "R06 sec. 2.9", "transcribed": "2026-10-25"},
        "default": True,
        "notes": "Derived, not a published number. R06 sec. 2.9 lists the same inversion: s11 5.854, s12 -1.182, s13 -1.356, s14 -0.920, s33 5.058, s44 16.949, s66 14.071.",
    }
    complete_tensor(s_rec)
    # d = e s^E  (C/m^2 x 1e-12 m^2/N = pC/N)
    Dm = matmul(eK["voigt"], s_rec["voigt"])
    d_rec = {
        "id": "piezo-strain-d/cln/kushibiki1999",
        "kind": "tensor",
        "tensor": "piezo-strain-d",
        "name": "Piezoelectric strain constants",
        "symbol": "d",
        "rank": 3,
        "unit": {"ucum": "pC/N", "display": "pC/N"},
        "variant": "cln",
        "variant_note": eK.get("variant_note", ""),
        "frame": copy.deepcopy(eK["frame"]),
        "independent": {k: {"value": sig(Dm[i][j], 6)} for k, (i, j) in {"d15": (0, 4), "d22": (1, 1), "d31": (2, 0), "d33": (2, 2)}.items()},
        "provenance": {"source_id": "kushibiki1999", "status": "C", "derivation": "d = e s^E from the kushibiki1999 e and c^E sets, computed by scripts/build_data.py", "research_note": "R06 sec. 2.10; R14 row 60a", "transcribed": "2026-10-25"},
        "default": True,
        "notes": "Derived, not a published number. R06 sec. 2.10: d15 66.4, d22 20.3, d31 -1.04, d33 8.7 pC/N. The hydrostatic d_h = 2 d31 + d33 from this set (about 6.6 pC/N) is within 5% of the measured 6.31 pC/N (R14 row 60a).",
    }
    complete_tensor(d_rec)
    # consistency: eps^T = eps^S + d e^T / eps0
    De = matmul(d_rec["voigt"], [list(col) for col in zip(*eK["voigt"])])
    eT11 = epsS["voigt"][0][0] + De[0][0] * 1e-12 / EPS0
    eT33 = epsS["voigt"][2][2] + De[2][2] * 1e-12 / EPS0
    epsT["consistency"] = [
        {"check": "eps^T = eps^S + d e^T / eps0 from the kushibiki1999 eps^S, e and derived d", "result": f"eps11^T = {eT11:.1f}, eps33^T = {eT33:.1f} (measured {epsT['voigt'][0][0]:g}, {epsT['voigt'][2][2]:g})", "status": "C"}
    ]
    # consistency: piezo-stiffened longitudinal velocity along Z
    c33 = cE["voigt"][2][2] * 1e9
    e33 = eK["voigt"][2][2]
    v_stiff = math.sqrt((c33 + e33**2 / (epsS["voigt"][2][2] * EPS0)) / rho)
    v_plain = math.sqrt(c33 / rho)
    cE["consistency"] = [
        {"check": "piezo-stiffened longitudinal velocity along Z, sqrt((c33 + e33^2/eps33^S)/rho), kushibiki1999 constants and density", "result": f"{v_stiff:.1f} m/s (unstiffened {v_plain:.1f} m/s); measured 7328.20 m/s (kushibiki1999 Table II)", "status": "C"}
    ]
    d["tensors"] += [s_rec, d_rec]
    d["_consistency"] = {"eps11T": eT11, "eps33T": eT33, "v_stiff": v_stiff, "v_plain": v_plain}

    # index spot values from default dispersion models (status C)
    gen: list[dict] = []
    models = {m["id"]: m for m in d["dispersion"]}
    for variant, mo, me in (("cln", "zelmon1997-cln-o", "zelmon1997-cln-e"), ("mgo5-cln", "zelmon1997-mgo5-o", "zelmon1997-mgo5-e")):
        for lam in SPOT_WAVELENGTHS_NM:
            no = n_model(models[mo], lam / 1000)
            ne = n_model(models[me], lam / 1000)
            tag = f"zelmon1997-{lam:g}nm"
            common = {
                "kind": "scalar",
                "category": "optical",
                "unit": {"ucum": "1", "qudt": "http://qudt.org/vocab/unit/UNITLESS", "display": "-"},
                "variant": variant,
                "conditions": {"temperature_C": 21, "wavelength_nm": lam},
                "default": True,
            }
            for prop, name, sym, val, deriv in (
                ("refractive-index-o", "Ordinary refractive index", "n_o", no, f"{mo} at {lam:g} nm, 21 C"),
                ("refractive-index-e", "Extraordinary refractive index", "n_e", ne, f"{me} at {lam:g} nm, 21 C"),
                ("birefringence", "Birefringence n_e - n_o", "n_e - n_o", ne - no, f"{me} minus {mo} at {lam:g} nm, 21 C"),
            ):
                rec = dict(copy.deepcopy(common), id=f"{prop}/{variant}/{tag}", property=prop, name=name, symbol=sym, value=round(val, 4))
                rec["provenance"] = {"source_id": "zelmon1997", "status": "C", "derivation": f"evaluated from dispersion model {deriv} by scripts/build_data.py (rounded to 1e-4)", "research_note": "R06 sec. 2.4", "transcribed": "2026-10-25"}
                if prop == "birefringence":
                    rec["notes"] = "Negative: LiNbO3 is negative uniaxial (n_e < n_o)."
                gen.append(rec)
    d["scalars"] += gen


# ---------------------------------------------------------------- public / unverified routing


def is_public_prop(r: dict) -> bool:
    return r["provenance"]["status"] != "U"


def event_verified(e: dict) -> bool:
    if e["kind"] == "history":
        return e["status"] != "U"
    grades = {re.sub(r"\s*\(.*\)", "", g).strip() for g in e["grade"].split("/")}
    # F or T: a primary or trade-press page was read. V alone: a vendor page was read. C: snippet only.
    return bool(grades & {"F", "T"}) or ("V" in grades and "C" not in grades)


def record_public(r: dict) -> bool:
    return r["verification"] not in ("unverified", "simulation")


# ---------------------------------------------------------------- aggregation


def numeric_span(r: dict) -> tuple[float, float] | None:
    if "value" in r:
        return (r["value"], r["value"])
    if "min" in r and "max" in r:
        return (r["min"], r["max"])
    return None


def spread_scalars(recs: list[dict]) -> dict | None:
    spans = [(numeric_span(r), r) for r in recs]
    spans = [(s, r) for s, r in spans if s is not None]
    units = {r["unit"]["ucum"] for _, r in spans}
    if len(spans) < 2 or len(units) != 1:
        return None
    return {"min": min(s[0] for s, _ in spans), "max": max(s[1] for s, _ in spans), "n_records": len(spans), "unit": units.pop(), "note": "Range over all public records regardless of conditions; compare conditions before use."}


def spread_tensors(recs: list[dict]) -> dict:
    out: dict[str, dict] = {}
    for k in sorted({k for r in recs for k in r["independent"]}):
        vals = [r["independent"][k]["value"] for r in recs if k in r["independent"]]
        out[k] = {"min": min(vals), "max": max(vals), "n_records": len(vals)}
    return out


def meta(**extra: Any) -> dict:
    m = {
        "api_version": API_VERSION,
        "data_version": DATA_VERSION,
        "license": DATA_LICENSE,
        "attribution": f"lithium-niobate.com data compiled by {AUTHOR}; cite the original sources listed per value.",
        "documentation": f"{SITE}/api/openapi.json",
    }
    m.update(extra)
    return m


def scalar_csv(recs: list[dict], sources: dict[str, dict]) -> str:
    cols = ["id", "property", "name", "symbol", "variant", "value", "min", "max", "value_text", "uncertainty", "unit_ucum", "unit_display", "temperature_C", "temperature_text", "wavelength_nm", "mechanical_boundary", "electrical_boundary", "status", "source_id", "doi", "locator", "default", "notes"]
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(cols)
    for r in recs:
        c = r.get("conditions", {})
        p = r["provenance"]
        u = r.get("uncertainty", {})
        w.writerow([
            r["id"], r["property"], r["name"], r.get("symbol", ""), r["variant"], r.get("value", ""), r.get("min", ""), r.get("max", ""), r.get("value_text", ""),
            u.get("value", "") if u.get("type") == "stated" else u.get("type", ""), r["unit"]["ucum"], r["unit"]["display"],
            "" if c.get("temperature_C") is None else c["temperature_C"], c.get("temperature_text", ""), "" if c.get("wavelength_nm") is None else c["wavelength_nm"],
            c.get("mechanical_boundary") or "", c.get("electrical_boundary") or "", p["status"], p["source_id"], sources[p["source_id"]].get("doi", ""), p.get("locator", ""),
            str(bool(r.get("default", False))).lower(), r.get("notes", ""),
        ])
    return buf.getvalue()


def tensor_csv(recs: list[dict]) -> str:
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["record_id", "tensor", "variant", "component", "value", "uncertainty", "unit_ucum", "status", "source_id", "via", "frame_convention", "default"])
    for r in recs:
        for k in sorted(r["independent"]):
            comp = r["independent"][k]
            u = comp.get("uncertainty", {})
            w.writerow([r["id"], r["tensor"], r["variant"], k, comp["value"], u.get("value", ""), r["unit"]["ucum"], comp.get("status", r["provenance"]["status"]), r["provenance"]["source_id"], r["provenance"].get("via", ""), r["frame"]["convention"], str(bool(r.get("default", False))).lower()])
    return buf.getvalue()


def records_csv(recs: list[dict]) -> str:
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["id", "category", "metric", "platform", "quantity", "value", "unit_ucum", "qualifier", "date", "first_author", "venue", "doi", "arxiv", "url", "verification", "highest_found"])
    for r in recs:
        for v in r.get("values", []) or [{}]:
            w.writerow([r["id"], r["category"], r["metric"], r["platform"], v.get("quantity", ""), v.get("value", ""), v.get("unit", ""), v.get("qualifier", ""), r["date"], r.get("first_author", ""), r.get("venue", ""), r.get("doi", ""), r.get("arxiv", ""), r.get("url", ""), r["verification"], str(bool(r.get("highest_found", False))).lower()])
    return buf.getvalue()


# ---------------------------------------------------------------- JSON-LD helper


def dataset_jsonld(prop: str, recs: list[dict], sources: dict[str, dict], material_of: dict[str, str] | None = None) -> dict:
    """schema.org Dataset for one property page (Google Dataset Search fields).

    LiTaO3 comparison records are left out unless the property has no LiNbO3 record."""
    material_of = material_of or {}
    ln = [r for r in recs if material_of.get(r["variant"], "LiNbO3") == "LiNbO3"]
    material = "LiNbO3" if ln else "LiTaO3"
    recs = ln or recs
    chem = {"LiNbO3": "lithium niobate", "LiTaO3": "lithium tantalate"}[material]
    name = recs[0]["name"]
    srcs = sorted({r["provenance"]["source_id"] for r in recs})
    variants = sorted({r["variant"] for r in recs})
    desc = (
        f"{name} of {chem} ({material}): {len(recs)} provenance-tagged value(s) from {len(srcs)} source(s) "
        f"for variant(s) {', '.join(variants)}. Each value carries conditions, uncertainty, the source locator and a status code "
        "(P primary, P-comp compilation, P-db database, S secondary, V vendor, C computed)."
    )
    vm = []
    for r in recs:
        if not r.get("default"):
            continue
        pv: dict[str, Any] = {"@type": "PropertyValue", "name": f"{r.get('symbol') or name} ({r['variant']})", "unitText": r["unit"]["ucum"]}
        if "value" in r:
            pv["value"] = r["value"]
        elif "min" in r:
            pv["minValue"], pv["maxValue"] = r["min"], r["max"]
        else:
            pv["value"] = r.get("value_text", "")
        if r["unit"].get("qudt"):
            pv["unitCode"] = r["unit"]["qudt"]
        pv["measurementTechnique"] = (r.get("conditions") or {}).get("method", "see source")
        vm.append(pv)
    if not vm:
        vm = [{"@type": "PropertyValue", "name": name, "unitText": recs[0]["unit"]["ucum"]}]
    cites = [source_link(sources[s]) for s in srcs if source_link(sources[s])]
    return {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": f"{material} {name}",
        "description": desc,
        "url": f"{SITE}/api/v1/properties/{prop}.json",
        "identifier": f"{SITE}/api/v1/properties/{prop}.json",
        "license": DATA_LICENSE["url"],
        "isAccessibleForFree": True,
        "creator": {"@type": "Person", "name": AUTHOR},
        "version": DATA_VERSION,
        "keywords": [chem, material, name],
        "about": {"@type": "ChemicalSubstance", "name": chem, "chemicalComposition": material},
        "variableMeasured": vm,
        "citation": cites,
        "distribution": [
            {"@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": f"{SITE}/api/v1/properties/{prop}.json"},
            {"@type": "DataDownload", "encodingFormat": "text/csv", "contentUrl": f"{SITE}/api/v1/properties.csv"},
        ],
    }


# ---------------------------------------------------------------- writer


class Writer:
    def __init__(self) -> None:
        self.files: dict[Path, str] = {}

    def text(self, path: Path, content: str) -> None:
        if path in self.files:
            raise BuildError(f"path written twice: {path}")
        self.files[path] = content

    def json(self, path: Path, obj: Any) -> None:
        self.text(path, dumps(obj))

    def flush(self) -> None:
        for d in (V1, GENERATED):
            if d.exists():
                shutil.rmtree(d)
        for p in (API / "openapi.json", STATIC / "llms.txt", STATIC / "llms-full.txt"):
            if p.exists():
                p.unlink()
        for path, content in sorted(self.files.items()):
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")


def rel_url(path: Path) -> str:
    return "/" + path.relative_to(STATIC).as_posix()


# ---------------------------------------------------------------- public output: no build notes, no research-note ids

# Keys that carry build provenance only (research-note ids, lane source references); dropped from every public file.
INTERNAL_KEYS = {"research_note", "research_notes", "source_ref"}
_RID = r"R(?:0[1-9]|1[0-4])"
_TOK = r"[\w\-]+(?:\.[\w\-]+)*"
_RLOC = rf"(?:\s+pass\b|\s+(?:sec\.|secs\.|row|rows|N|S|item|items|table|Table|corrections?|C)\s*{_TOK}(?:\s*(?:-|to)\s*{_TOK})?)*"
_RREF = rf"(?:(?:per|via|see|in|from|during|cf\.)\s+)?(?:the\s+)?(?:research\s+notes?\s+)?(?:note-)?{_RID}{_RLOC}"
_RLIST = rf"{_RREF}(?:\s*(?:,|;|and|/)\s*{_RREF})*"
_LANE_RULES: list[tuple[str, str]] = [
    (r"\s*From lane C0\d refs\.yaml \(C0\d status [A-Z]+\)\.", ""),
    (r"[;,]?\s*added at the request of lane C0\d(?:\s*\([^)]*\))?", ""),
    (r"\blane C0\d read\b", "read"),
    (r",?\s*read in full by lane C0\d", ", read in full"),
    (r"\b(Read|read|Scan read|text read) by (?:the )?research lane\b", r"\1"),
    (r"\s*by (?:the )?research lane\b", ""),
    (r"\(research lane,\s*", "("),
    (r",?\s*research lane\b", ""),
    (r"\s*\(?\bC0\d (?:correction|open-questions?) C\d+\)?", ""),
    (r"\bC0\d stores\b", "stored as"),
    (rf"\b{_RID} gives no\b", "the cited sources give no"),
    (r"\b(release|item) S\d+\b", r"\1"),
]


def clean_text(s: str) -> str:
    """Remove lane/build notes and research-note references (R01-R14, note-rNN) from a public string."""
    if not re.search(rf"\b{_RID}\b|note-r\d\d|\blane\b|\bC0\d\b|research lane", s):
        return s
    t = s
    for pat, rep in _LANE_RULES:
        t = re.sub(pat, rep, t)
    t = re.sub(rf"\b{_RID}{_RLOC}\s*:\s*", "", t)  # "R14 row 36c: 2.65e-4 ..." -> "2.65e-4 ..."
    t = re.sub(rf"\s*\(\s*{_RLIST}\s*\)", "", t)  # "(R06 sec. 2.4; R14 row 1)"
    t = re.sub(rf"(?<![\w-]){_RLIST}(?![\w-])", "", t)
    # tidy what the removals leave behind
    for pat, rep in [(r"\(\s*[,;]\s*", "("), (r"\s*[,;]\s*\)", ")"), (r"\(\s*\)", ""), (r"\s+([,;.])", r"\1"), (r"([,;])\1+", r"\1"),
                     (r"^\s*[,;:]\s*", ""), (r"\s{2,}", " "), (r";\s*\.", "."), (r",\s*\.", "."), (r"\.\s*\.", ".")]:
        t = re.sub(pat, rep, t)
    clauses = [c for c in re.split(r";\s+", t.strip()) if c and not re.search(r"\b(?:per|via|in|from|see|by|of|the|content)$", c.strip(" ."))]
    t = "; ".join(clauses).strip() or t.strip()
    if t.startswith("(") and t.endswith(")") and t.count("(") == 1:
        t = t[1:-1]
    return t


def publicize(obj: Any) -> Any:
    """Public copy of an output object: build-provenance keys dropped, strings cleaned (ids, URLs and DOIs untouched)."""
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in INTERNAL_KEYS:
                continue
            pv = v if k in ("id", "doi", "url", "source_id", "via", "arxiv", "isbn", "$id", "$ref", "pattern") else publicize(v)
            if pv == "" and v != "":
                continue  # a field that held only a build note
            out[k] = pv
        return out
    if isinstance(obj, list):
        return [publicize(v) for v in obj]
    if isinstance(obj, str):
        return clean_text(obj)
    return obj


# ---------------------------------------------------------------- glossary merge (chapter glossaries)

CHAPTERS_DIR = ROOT / "content" / "chapters"
# Page-local popup key of a chapter term, per page lane (so pages can switch to "g:<id>" after the merge).
_SLUG = lambda t: re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", t.lower()))  # noqa: E731


def _making_key(t: str) -> str:
    base = re.split(r"\s*/\s*|,\s*", re.sub(r"\s*\(.*?\)\s*", " ", t).strip())[0].strip()
    return "gl:" + re.sub(r"[^a-z0-9]+", "-", base.lower())


PAGE_KEY = {
    "01-crystal": lambda t, it: "t:" + re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", t.lower().replace("^", "").replace("+", "plus-"))),
    "02-light": lambda t, it: "gl:" + str(it.get("id", _SLUG(t))),
    "03-sound": lambda t, it: "sg:" + _SLUG(t),
    "04-quirks": lambda t, it: "q:" + _SLUG(t),
    "05-making": lambda t, it: _making_key(t),
    "08-industry": lambda t, it: "g8:" + _SLUG(t),
}
_ABBR_DOT = re.compile(r"(\b(?:No|Fig|Figs|Eq|Eqs|Ref|Refs|Sec|vs|e\.g|i\.e|et al|approx|ca|cf|p|pp|Ch|Vol|St|Dr)\.|\b[A-Z]\.)$")


def first_sentence(text: str) -> str:
    """First sentence of a definition (skips abbreviations such as 'No.', 'e.g.', initials)."""
    pos = 0
    for m in re.finditer(r"[.!?](?=\s+[A-Z(\"])", text):
        if _ABBR_DOT.search(text[: m.end()]):
            continue
        pos = m.end()
        if pos >= 25:
            return text[:pos].strip()
    return text.strip()


def norm_term(t: str) -> str:
    t = t.lower().replace("‑", "-").replace("–", "-").replace("—", "-").replace("−", "-")
    t = t.replace("\u00b0", " deg ").replace("\u03c7", "chi").replace("\u03c0", "pi")
    t = re.sub(r"\(([^)]*)\)", r" \1 ", t)
    t = re.sub(r"[-_/,;:'\"]", " ", t)
    t = re.sub(r"[^a-z0-9+ ]", "", t)
    t = re.sub(r"^the ", "", re.sub(r"\s+", " ", t).strip())
    return " ".join({"eo": "electro optic", "ao": "acousto optic"}.get(w, w) for w in t.split())


def term_keys(*names: str | None) -> set[str]:
    out: set[str] = set()
    for n in names:
        if not n:
            continue
        forms = [n, re.sub(r"\s*\([^)]*\)", "", n)]  # with and without a parenthetical, e.g. "Curie temperature (Tc)"
        outer = forms[1].strip()
        forms += [m for m in re.findall(r"\(([^)]*)\)", n) if re.fullmatch(r"[A-Z0-9+:-]{2,8}", m) or re.fullmatch(r"[A-Za-z0-9_^]{1,6}", outer)]  # "x (TFLN)", "Q (quality factor)"
        for f in forms:
            k = norm_term(f)
            if k:
                out.add(k)
                out.add("~" + " ".join(sorted(k.split())))  # word-order-insensitive key
    return out


def chapter_refs(ch: str) -> dict[str, dict]:
    p = CHAPTERS_DIR / ch / "refs.yaml"
    if not p.exists():
        return {}
    raw = load_yaml(p)
    items: list = []
    if isinstance(raw, list):
        items = raw
    elif isinstance(raw, dict):
        for v in raw.values():
            if isinstance(v, list):
                items += v
    return {str(r["id"]): r for r in items if isinstance(r, dict) and r.get("id")}


def ref_citation(r: dict) -> str:
    """Display citation for a chapter refs.yaml entry (the chapter files use several layouts)."""
    if r.get("citation"):
        return str(r["citation"])
    au = r.get("authors")
    if isinstance(au, list):
        who = f"{au[0]} et al." if len(au) > 2 else " & ".join(map(str, au))
    elif au:
        who = str(au)
    elif r.get("first_author"):
        who = f"{r['first_author']} et al." if int(r.get("n_authors") or 1) > 2 else str(r["first_author"])
    else:
        who = str(r.get("publisher") or "")
    title = r.get("title")
    where = " ".join(str(x) for x in (r.get("container") or r.get("venue"), r.get("volume"), r.get("pages")) if x)
    year = str(r.get("issued") or r.get("year") or r.get("date") or "")[:4]
    parts = [p for p in (who, f'"{title}"' if title else "", where) if p]
    body = ", ".join(parts)
    return body + (f" ({year})" if year and year not in body else "")


def short_cite(src: dict) -> str:
    """Author-year short form of a sources-register record: "Kushibiki et al. 1999", "Weis & Gaylord 1985"."""
    names = [a.get("family") or a.get("literal") or "" for a in src.get("author", [])]
    names = [n for n in names if n] or ([src["publisher"]] if src.get("publisher") else [])
    who = f"{names[0]} et al." if len(names) > 2 else " & ".join(names)
    year = str(src.get("issued", ""))[:4]
    if who:
        return f"{who} {year}".strip()
    m = re.match(r"([a-z]+)(\d{4})", src["id"])  # no author on record: name and year from the id ("hatchett1802")
    return f"{m.group(1).capitalize()} {m.group(2)}" if m else (src.get("title") or src["id"])


_UNIT_RULES = [(r"uC/cm\^2", "\u00b5C/cm\u00b2"), (r"C/m\^2", "C/m\u00b2"), (r"kg/m\^3", "kg/m\u00b3"), (r"\+-", "\u00b1"),
               (r"(\d)\s?um\b", "\\1 \u00b5m"), (r"\^-1\b", "\u207b\u00b9"), (r"\^2\b", "\u00b2"), (r"\^3\b", "\u00b3")]


def humanize(text: str, by_src: dict[str, dict]) -> str:
    """Glossary prose for readers: citation keys -> author-year, ASCII units -> symbols (audit F S6, P01)."""
    t = re.sub(r"\b([a-z][a-z0-9-]*\d{4}[a-z0-9-]*)\b", lambda m: short_cite(by_src[m.group(1)]) if m.group(1) in by_src else m.group(1), text)
    for pat, rep in _UNIT_RULES:
        t = re.sub(pat, rep, t)
    return t


def ref_short(r: dict) -> str:
    """Author-year short form of a chapter refs.yaml entry (layouts as in ref_citation)."""
    fam = lambda n: str(n).split(",")[0].strip() if "," in str(n) else str(n).split()[-1]  # noqa: E731
    au = r.get("authors")
    if isinstance(au, list) and au:
        names = [fam(a) for a in au]
    elif isinstance(au, str) and au:
        names = [x.strip() for x in re.split(r",|;| and |&", au) if x.strip()]
    elif r.get("first_author"):
        names = [str(r["first_author"])] + (["", ""] if int(r.get("n_authors") or 1) > 2 else [])
    elif r.get("citation"):
        head = re.split(r"[\"\u201c]", str(r["citation"]))[0]
        names = [fam(x) for x in re.split(r",\s*", head) if re.fullmatch(r"(?:[A-Z][\w'.-]*\s+){0,3}[A-Z][\w'-]+", x.strip())][:3]
    else:
        names = [str(r["publisher"])] if r.get("publisher") else []
    who = f"{names[0]} et al." if len(names) > 2 else " & ".join(n for n in names if n)
    year = str(r.get("issued") or r.get("year") or r.get("date") or "")[:4]
    if who:
        return f"{who} {year}".strip()
    m = re.match(r"([a-z]+)(\d{4})", str(r.get("id", "")))
    return f"{m.group(1).capitalize()} {m.group(2)}" if m else str(r.get("title") or r.get("id"))


def merge_glossary(d: dict) -> tuple[list[dict], list[dict]]:
    """Merge content/chapters/*/glossary.yaml into the canonical glossary.

    Dedupes by normalized term (also aliases, abbreviations, expansions, word order); a matched term keeps its
    canonical (or first-seen) definition and gains the chapter, its sources and its spelling as an alias. New terms get
    an id from the slug of the term (suffix -<chapter no> on an id clash) and origin "chapter". Chapter source ids
    resolve to data/sources.yaml by DOI (C07 ids through data/events/c07-source-id-map.yaml), otherwise they are kept
    as a citation from the chapter refs.yaml. Returns (merged terms, id map rows)."""
    sources = d["sources"]
    by_doi = {str(s["doi"]).lower(): s["id"] for s in sources if s.get("doi")}
    src_ids = {s["id"] for s in sources}
    c07_map = load_yaml(DATA / "events" / "c07-source-id-map.yaml") or {}
    merged = [dict(copy.deepcopy(g), origin="canonical") for g in d["glossary"]]
    keymap: dict[str, dict] = {}
    for g in merged:
        for k in term_keys(g["term"], *g.get("aliases", [])):
            keymap.setdefault(k, g)
    ids = {g["id"] for g in merged}
    rows: list[dict] = []
    for chdir in sorted(p for p in CHAPTERS_DIR.iterdir() if (p / "glossary.yaml").exists()):
        ch = chdir.name
        raw = load_yaml(chdir / "glossary.yaml")
        terms = raw.get("terms", []) if isinstance(raw, dict) else (raw or [])
        refs = chapter_refs(ch)
        local: dict[str, str] = {}  # chapter-local term/id -> merged id (for 'see')

        def resolve(rid: str) -> dict | None:
            rid = str(rid).strip()
            if re.fullmatch(r"(?i)(note-)?R(0[1-9]|1[0-4])", rid):
                return None  # research notes are not public sources (audit F, S2)
            if ch == "07-history":  # C07 refs were merged into data/sources.yaml (same id, or mapped on a clash)
                rid2 = str(c07_map.get(rid, rid))
                if rid2 in src_ids and not rid2.startswith("note-"):
                    return {"source_id": rid2}
            r = refs.get(rid)
            if r and r.get("doi") and str(r["doi"]).lower() in by_doi:
                return {"source_id": by_doi[str(r["doi"]).lower()]}
            if r:
                out = {"ref": f"{ch}/{rid}", "citation": ref_citation(r)}
                if r.get("doi"):
                    out["doi"] = str(r["doi"])
                elif r.get("url") and str(r["url"]).startswith("http"):
                    out["url"] = str(r["url"])
                return out
            if rid in src_ids and not refs:
                return {"source_id": rid}
            return None

        pending_see: list[tuple[dict, list[str]]] = []
        for it in terms:
            term = str(it["term"]).strip()
            abbr = it.get("abbr")
            expansion = it.get("expansion")
            definition = str(it.get("def") or it.get("definition") or it.get("long") or it.get("short") or "").strip()
            short = str(it.get("short") or first_sentence(definition)).strip()
            long = str(it.get("long") or definition or short).strip()
            if it.get("detail"):
                long = f"{long} {str(it['detail']).strip()}"
            if it.get("unit"):
                long = f"{long} Unit: {it['unit']}."
            # citation keys of the chapter refs in the prose -> author-year (keys of the register are handled later)
            def keyname(k: str) -> str:
                mapped = str(c07_map.get(k, k)) if ch == "07-history" else k
                if mapped != k and mapped in src_ids:
                    return short_cite(next(x for x in sources if x["id"] == mapped))
                return ref_short(refs[k]) if k in refs and k not in src_ids else k
            keysub = lambda t: re.sub(r"\b([a-z][a-z0-9-]*\d{4}[a-z0-9-]*)\b", lambda m: keyname(m.group(1)), t)  # noqa: E731
            short, long = keysub(short), keysub(long)
            # sources: explicit fields, then source ids cited inline (chapters 05 and 07 cite in the text)
            rids: list[str] = []
            for f in ("source", "src"):
                if it.get(f):
                    rids.append(str(it[f]))
            if isinstance(it.get("refs"), list):
                rids += [str(x) for x in it["refs"]]
            if refs:
                for tok in re.findall(r"[a-z][a-z0-9_-]*\d{4}[a-z0-9_-]*", f"{it.get('detail') or ''} {definition}"):
                    if tok in refs and tok not in rids:
                        rids.append(tok)
            srcs = [s for s in (resolve(r) for r in rids) if s]
            names = [term] + [x for x in (abbr, expansion) if x]
            hit = next((keymap[k] for k in sorted(term_keys(*names)) if k in keymap), None)
            parts = [x for x in re.split(r",\s+|\s+/\s+", term) if x.strip()]
            if hit is None and len(parts) > 1:  # "CLN, congruent LN": merge only when every part names the same entry
                cands = [next((keymap[k] for k in sorted(term_keys(x)) if k in keymap), None) for x in parts]
                if cands[0] is not None and all(c is cands[0] for c in cands):
                    hit = cands[0]
            if hit is None and _SLUG(term) in ids:  # same slug as an existing id: same term spelled differently
                hit = next(g for g in merged if g["id"] == _SLUG(term))
            if hit is not None:
                match = "canonical" if hit["origin"] == "canonical" else "chapter"
                g = hit
                for n in names:
                    if norm_term(n) != norm_term(g["term"]) and n not in g.get("aliases", []):
                        g.setdefault("aliases", []).append(n)
                for s in srcs:
                    if s not in g["sources"]:
                        g["sources"].append(s)
                if ch not in g.setdefault("chapters", []):
                    g["chapters"].append(ch)
            else:
                match = "new"
                base = _SLUG(term) or "term"
                gid = base if base not in ids else f"{base}-{ch[:2]}"
                n = 2
                while gid in ids:
                    gid = f"{base}-{ch[:2]}-{n}"
                    n += 1
                ids.add(gid)
                g = {"id": gid, "term": term, "short": short, "long": long, "sources": srcs, "chapters": [ch], "origin": "chapter"}
                al = [x for x in (abbr, expansion) if x and norm_term(x) != norm_term(term)]
                if al:
                    g["aliases"] = al
                if it.get("symbol"):
                    g["symbol"] = str(it["symbol"])
                merged.append(g)
            for k in term_keys(*names):
                keymap.setdefault(k, g)
            local[norm_term(term)] = g["id"]
            if it.get("id"):
                local[norm_term(str(it["id"]))] = g["id"]
            if isinstance(it.get("see"), list):
                pending_see.append((g, [str(x) for x in it["see"]]))
            key_fn = PAGE_KEY.get(ch)
            rows.append({"chapter": ch, "term": term, "page_key": key_fn(term, it) if key_fn else None, "id": g["id"], "match": match})
        for g, see in pending_see:
            if g["origin"] != "chapter":
                continue
            rel = g.setdefault("related", [])
            for s in see:
                rid = local.get(norm_term(s))
                if rid and rid != g["id"] and rid not in rel:
                    rel.append(rid)
            if not rel:
                del g["related"]
    return merged, rows


# ---------------------------------------------------------------- build


def build(write: bool = True) -> dict[str, Any]:
    schemas, reg = load_schemas()
    d = load_all()
    errs = validate_all(d, schemas, reg) + check_refs(d)
    if errs:
        raise BuildError("validation failed:\n  " + "\n  ".join(errs))

    for t in d["tensors"]:
        complete_tensor(t)
    derive(d)
    for r in d["scalars"] + d["tensors"] + d["dispersion"]:
        r["public"] = is_public_prop(r)
    for r in d["records"]:
        r["public"] = record_public(r)
    for e in d["history"] + d["industry"]:
        e["verified"] = event_verified(e)

    # re-validate generated records
    out_errs = []
    for key in ("scalars", "tensors", "dispersion", "records", "history", "industry"):
        v = validator(schemas, reg, SCHEMA_OF[key])
        for it in d[key]:
            out_errs += [f"{key}:{it['id']}: {e.message[:200]}" for e in v.iter_errors(it)]
    # dispersion check values
    for m in d["dispersion"]:
        for cv in m["check_values"]:
            n = n_model(m, cv["lambda_nm"] / 1000, cv["T_C"] if m.get("temperature_dependent") else None)
            if abs(n - cv["n"]) > cv["tolerance"]:
                out_errs.append(f"dispersion {m['id']}: n({cv['lambda_nm']} nm) = {n:.6f}, check {cv['n']} +- {cv['tolerance']}")
    if out_errs:
        raise BuildError("generated output failed checks:\n  " + "\n  ".join(out_errs))

    sources = by_id(d["sources"])
    variants = sorted(d["variants"], key=lambda v: v["id"])
    scal = sorted(d["scalars"], key=lambda r: r["id"])
    tens = sorted(d["tensors"], key=lambda r: r["id"])
    disp = sorted(d["dispersion"], key=lambda r: r["id"])
    pub_s = [r for r in scal if r["public"]]
    pub_t = [r for r in tens if r["public"]]
    pub_d = [r for r in disp if r["public"]]
    hist = sorted(d["history"], key=lambda e: (e["date"], e["id"]))
    ind = sorted(d["industry"], key=lambda e: (e["date"], e["id"]))
    recs = sorted(d["records"], key=lambda r: (r["category"], r["date"], r["id"]))
    pubs = sorted(d["publications"], key=lambda p: (p["issued"], p["id"]))
    merged_gloss, gloss_map = merge_glossary(d)
    gv = validator(schemas, reg, "glossary")
    g_errs = [f"glossary {g['id']}: {e.message[:200]}" for g in merged_gloss for e in gv.iter_errors(g)]
    g_errs += [f"glossary {g['id']}: source '{s['source_id']}' not in sources" for g in merged_gloss for s in g["sources"] if s.get("source_id") and s["source_id"] not in sources]
    if g_errs:
        raise BuildError("merged glossary failed checks:\n  " + "\n  ".join(g_errs))
    for g in merged_gloss:
        for f in ("short", "long"):
            g[f] = humanize(g[f], sources)
    gloss = sorted(merged_gloss, key=lambda g: (g["term"].lower(), g["id"]))
    # History status V ("bibliographic record verified") is published as `rec` so it cannot be read as the site-wide
    # V (vendor datasheet). The YAML source keeps V (data/schema/event.schema.json). The app copy
    # src/lib/generated/events-history.json keeps V until the chapter 07 loader maps `rec` (DevLog-006a).
    hist_out = [dict(e, status="rec") if e["status"] == "V" else e for e in hist]

    W = Writer()
    files: list[str] = []

    def put(path: Path, obj: Any) -> None:
        W.json(path, publicize(obj))
        files.append(rel_url(path))

    def put_text(path: Path, s: str) -> None:
        W.text(path, s if path.suffix in (".csv", ".yml") and "grids" in path.parts else "\n".join(clean_text(x) for x in s.split("\n")))
        files.append(rel_url(path))

    # schemas
    for name, s in sorted(schemas.items()):
        put(V1 / "schema" / f"{name}.schema.json", s)

    # sources
    used = {r["provenance"]["source_id"] for r in pub_s + pub_t + pub_d} | {r["provenance"].get("via") for r in pub_s + pub_t + pub_d if r["provenance"].get("via")}
    used |= {s["source_id"] for g in gloss for s in g["sources"] if s.get("source_id")}
    # research-note sources (note-rNN) are published only while an output record still cites them (U rows)
    cited = {r["provenance"]["source_id"] for r in scal + tens + disp} | {r["provenance"].get("via") for r in scal + tens + disp}
    cited |= {s.get("source_id") for g in gloss for s in g["sources"]}
    src_list = sorted((s for s in d["sources"] if not s["id"].startswith("note-") or s["id"] in cited), key=lambda s: s["id"])
    for s in src_list:
        put(V1 / "sources" / f"{s['id']}.json", {"meta": meta(), "source": s, "citation": cite_text(s), "link": source_link(s)})
    put(V1 / "sources.json", {"meta": meta(count=len(src_list)), "sources": src_list})

    # variants
    put(V1 / "variants.json", {"meta": meta(count=len(variants)), "variants": variants})

    # properties
    put(V1 / "properties.json", {"meta": meta(count=len(pub_s), note="Public scalar records (status U excluded; see unverified.json)."), "records": pub_s})
    put_text(V1 / "properties.csv", scalar_csv(pub_s, sources))
    props = sorted({r["property"] for r in pub_s})
    jsonld: dict[str, Any] = {}
    prop_index = []
    for p in props:
        rs = [r for r in pub_s if r["property"] == p]
        jsonld[p] = dataset_jsonld(p, rs, sources, {v["id"]: v.get("material", "LiNbO3") for v in variants})
        put(V1 / "properties" / f"{p}.json", {"meta": meta(property=p, count=len(rs)), "records": rs, "jsonld": jsonld[p]})
        vs = sorted({r["variant"] for r in rs})
        for v in vs:
            rv = [r for r in rs if r["variant"] == v]
            rec = [r for r in rv if r.get("default")]
            put(V1 / "properties" / p / f"{v}.json", {
                "meta": meta(property=p, variant=v),
                "recommended": rec,
                "recommended_note": None if rec else "No single recommended record: sources disagree or none is primary; see alternatives and spread.",
                "alternatives": [r for r in rv if not r.get("default")],
                "spread": spread_scalars(rv),
            })
        prop_index.append({"property": p, "name": rs[0]["name"], "symbol": rs[0].get("symbol"), "category": rs[0].get("category"), "variants": vs, "n_records": len(rs), "url": f"/api/v1/properties/{p}.json"})

    # tensors
    put(V1 / "tensors.json", {"meta": meta(count=len(pub_t), note="Public tensor records (status U excluded)."), "records": pub_t})
    put_text(V1 / "tensors.csv", tensor_csv(pub_t))
    tensor_index = []
    for tname in sorted({t["tensor"] for t in pub_t}):
        ts = [t for t in pub_t if t["tensor"] == tname]
        put(V1 / "tensors" / f"{tname}.json", {
            "meta": meta(tensor=tname, note="All public records of this tensor across variants; spread is per component over all records (compare variant, conditions and frame before use)."),
            "records": [t["id"] for t in ts],
            "spread": spread_tensors(ts),
        })
        for v in sorted({t["variant"] for t in ts}):
            tv = [t for t in ts if t["variant"] == v]
            for t in tv:
                put(V1 / "tensors" / tname / v / f"{t['id'].split('/')[2]}.json", {"meta": meta(tensor=tname, variant=v), "record": t})
            rec = [t for t in tv if t.get("default")]
            put(V1 / "tensors" / tname / f"{v}.json", {
                "meta": meta(tensor=tname, variant=v),
                "recommended": rec[0] if rec else None,
                "recommended_note": None if rec else "No single recommended set: sources disagree (shown as a spread, not blended).",
                "alternatives": [t["id"] for t in tv if not t.get("default")],
                "spread": spread_tensors(tv),
            })
            tensor_index.append({"tensor": tname, "variant": v, "records": [t["id"] for t in tv], "default": rec[0]["id"] if rec else None, "url": f"/api/v1/tensors/{tname}/{v}.json"})

    # dispersion
    disp_index = []
    for m in pub_d:
        src = sources[m["provenance"]["source_id"]]
        put(V1 / "dispersion" / f"{m['id']}.json", {"meta": meta(model=m["id"]), "model": m, "python": python_snippet(m)})
        put_text(V1 / "dispersion" / f"{m['id']}.rii.yml", rii_yaml(m, src))
        T = m["reference_T_C"]
        rows = grid_rows(m)
        put_text(V1 / "grids" / "index" / m["id"] / f"T{slug_t(T)}C.csv", "lambda_nm,n\n" + "".join(f"{nm},{n:.6f}\n" for nm, n in rows))
        disp_index.append({"id": m["id"], "name": m["name"], "variant": m["variant"], "axis": m["axis"], "status": m["provenance"]["status"], "default": bool(m.get("default")), "valid_lambda_um": m["valid_lambda_um"], "reference_T_C": T,
                           "url": f"/api/v1/dispersion/{m['id']}.json", "rii": f"/api/v1/dispersion/{m['id']}.rii.yml", "grid": f"/api/v1/grids/index/{m['id']}/T{slug_t(T)}C.csv", "grid_rows": len(rows)})
    put(V1 / "dispersion.json", {"meta": meta(count=len(disp_index)), "models": disp_index})

    # events, publications, records, glossary
    put(V1 / "events" / "history.json", {"meta": meta(count=sum(e["verified"] for e in hist_out), note="History events with status rec (bibliographic record verified at the source; V in the YAML source), P or S; status U in unverified.json."), "events": [e for e in hist_out if e["verified"]]})
    put(V1 / "events" / "industry.json", {"meta": meta(count=sum(e["verified"] for e in ind), note="Industry events with an F or T grade, or a V grade without C (R09 sec. 0); snippet-based (C, C/V) and low-grade (LG) events are in unverified.json. Vendor claims (V) are claims, not facts."), "events": [e for e in ind if e["verified"]]})
    put(V1 / "publications.json", {"meta": meta(count=len(pubs), note=f"LN-relevant items from the public record of {AUTHOR}."), "publications": pubs})
    pub_recs = [r for r in recs if r["public"]]
    put(V1 / "records.json", {"meta": meta(count=len(pub_recs), as_of="2026-10-24", note="Provisional: 'highest found' means highest found in the cited research pass, not an absolute record. Definitions (e.g. Vpi*L) differ between papers. date is the first publication date (online first where available)."), "records": pub_recs})
    put_text(V1 / "records.csv", records_csv(pub_recs))
    put(V1 / "glossary.json", {"meta": meta(count=len(gloss), note="Canonical terms (data/glossary.yaml, origin canonical) merged with the chapter glossaries (content/chapters/*/glossary.yaml, origin chapter), deduplicated by normalized term."), "terms": gloss})
    unv = {
        "meta": meta(note="Rows that must not be presented as fact: property status U, history status U, industry events graded only C/LG/E/S, records flagged unverified or simulation."),
        "scalars": [r for r in scal if not r["public"]],
        "tensors": [r for r in tens if not r["public"]],
        "dispersion": [r for r in disp if not r["public"]],
        "events": [e for e in hist_out + ind if not e["verified"]],
        "records": [r for r in recs if not r["public"]],
    }
    put(V1 / "unverified.json", unv)

    # datapackage (Frictionless v2)
    dp_resources = [
        {"name": "properties", "path": "properties.csv", "format": "csv", "mediatype": "text/csv", "description": "Scalar property records, one row per value (long format; unit per row).",
         "schema": {"fields": [field(n, t, u) for n, t, u in (
             ("id", "string", None), ("property", "string", None), ("name", "string", None), ("symbol", "string", None), ("variant", "string", None),
             ("value", "number", "row:unit_ucum"), ("min", "number", "row:unit_ucum"), ("max", "number", "row:unit_ucum"), ("value_text", "string", None), ("uncertainty", "string", "row:unit_ucum"),
             ("unit_ucum", "string", None), ("unit_display", "string", None), ("temperature_C", "number", "Cel"), ("temperature_text", "string", None), ("wavelength_nm", "number", "nm"),
             ("mechanical_boundary", "string", None), ("electrical_boundary", "string", None), ("status", "string", None), ("source_id", "string", None), ("doi", "string", None), ("locator", "string", None), ("default", "boolean", None), ("notes", "string", None))],
             "primaryKey": ["id"]}},
        {"name": "tensor-components", "path": "tensors.csv", "format": "csv", "mediatype": "text/csv", "description": "Independent tensor components (point group 3m), one row per component.",
         "schema": {"fields": [field(n, t, u) for n, t, u in (
             ("record_id", "string", None), ("tensor", "string", None), ("variant", "string", None), ("component", "string", None), ("value", "number", "row:unit_ucum"), ("uncertainty", "number", "row:unit_ucum"),
             ("unit_ucum", "string", None), ("status", "string", None), ("source_id", "string", None), ("via", "string", None), ("frame_convention", "string", None), ("default", "boolean", None))]}},
        {"name": "records", "path": "records.csv", "format": "csv", "mediatype": "text/csv", "description": "Provisional device-performance records, one row per numeric value.",
         "schema": {"fields": [field(n, t, u) for n, t, u in (
             ("id", "string", None), ("category", "string", None), ("metric", "string", None), ("platform", "string", None), ("quantity", "string", None), ("value", "number", "row:unit_ucum"), ("unit_ucum", "string", None), ("qualifier", "string", None),
             ("date", "string", None), ("first_author", "string", None), ("venue", "string", None), ("doi", "string", None), ("arxiv", "string", None), ("url", "string", None), ("verification", "string", None), ("highest_found", "boolean", None))]}},
    ]
    for di in disp_index:
        dp_resources.append({"name": f"index-{di['id']}", "path": di["grid"].removeprefix("/api/v1/"), "format": "csv", "mediatype": "text/csv",
                             "description": f"n(lambda) at {slug_t(di['reference_T_C'])} C, 1 nm steps, from {di['id']}.",
                             "schema": {"fields": [field("lambda_nm", "integer", "nm"), field("n", "number", "1")]}})
    put(V1 / "datapackage.json", {
        "$schema": "https://datapackage.org/profiles/2.0/datapackage.json",
        "name": "lithium-niobate-properties",
        "title": "LiNbO3 material properties, dispersion grids and device records (lithium-niobate.com)",
        "version": DATA_VERSION,
        "homepage": SITE,
        "licenses": [{"name": "CC-BY-4.0", "path": DATA_LICENSE["url"], "title": DATA_LICENSE["name"]}],
        "contributors": [{"title": AUTHOR, "roles": ["creator"]}],
        "description": "Provenance-tagged LiNbO3 property values (one source per record), dispersion grids and provisional device records. Custom field property unit_ucum gives the UCUM unit of each field; 'row:unit_ucum' means the unit is given per row in the unit_ucum column.",
        "resources": dp_resources,
    })

    # OpenAPI 3.1
    put(API / "openapi.json", openapi(props, tensor_index, disp_index, src_list, files))

    # index
    status_counts: dict[str, int] = {}
    for r in scal + tens:
        status_counts[r["provenance"]["status"]] = status_counts.get(r["provenance"]["status"], 0) + 1
    index = {
        "meta": meta(),
        "title": "lithium-niobate.com data API",
        "description": "Static, path-parameterized JSON/CSV API for lithium niobate (LiNbO3): provenance-tagged property values, 3m tensors with frames and Voigt conventions, dispersion models with grids, history and industry events, the author's LN publications, device records and a glossary. Query strings are not used.",
        "license": DATA_LICENSE,
        "code_license": CODE_LICENSE,
        "status_codes": schemas["common"]["$defs"]["propertyStatus"]["description"],
        "default_variant": next(v["id"] for v in variants if v.get("default")),
        "variants": [v["id"] for v in variants],
        "counts": {
            "sources": len(src_list), "scalar_records_public": len(pub_s), "tensor_records_public": len(pub_t), "dispersion_models": len(pub_d),
            "history_events": sum(e["verified"] for e in hist), "industry_events": sum(e["verified"] for e in ind), "publications": len(pubs),
            "records": len(pub_recs), "glossary_terms": len(gloss), "unverified": sum(len(v) for k, v in unv.items() if k != "meta"), "status": dict(sorted(status_counts.items())),
        },
        "properties": prop_index,
        "tensors": tensor_index,
        "dispersion": disp_index,
        "endpoints": {
            "openapi": "/api/openapi.json", "schema": "/api/v1/schema/{type}.schema.json", "variants": "/api/v1/variants.json", "sources": "/api/v1/sources.json", "source": "/api/v1/sources/{source_id}.json",
            "properties": "/api/v1/properties.json", "properties_csv": "/api/v1/properties.csv", "property": "/api/v1/properties/{property}.json", "property_variant": "/api/v1/properties/{property}/{variant}.json",
            "tensors": "/api/v1/tensors.json", "tensors_csv": "/api/v1/tensors.csv", "tensor": "/api/v1/tensors/{tensor}.json", "tensor_variant": "/api/v1/tensors/{tensor}/{variant}.json", "tensor_record": "/api/v1/tensors/{tensor}/{variant}/{source_id}.json",
            "dispersion": "/api/v1/dispersion.json", "dispersion_model": "/api/v1/dispersion/{model_id}.json", "dispersion_rii": "/api/v1/dispersion/{model_id}.rii.yml", "index_grid": "/api/v1/grids/index/{model_id}/T{T_C}C.csv",
            "history": "/api/v1/events/history.json", "industry": "/api/v1/events/industry.json", "publications": "/api/v1/publications.json", "records": "/api/v1/records.json", "records_csv": "/api/v1/records.csv",
            "glossary": "/api/v1/glossary.json", "unverified": "/api/v1/unverified.json", "datapackage": "/api/v1/datapackage.json", "llms": "/llms.txt", "llms_full": "/llms-full.txt",
        },
    }
    put(V1 / "index.json", index)

    # llms.txt
    llms, llms_full = llms_txt(index, pub_s, pub_t, pub_d, gloss, sources, hist_out, recs)
    put_text(STATIC / "llms.txt", llms)
    put_text(STATIC / "llms-full.txt", llms_full)

    # app copies
    gen = {
        "index.json": index, "sources.json": src_list, "variants.json": variants, "properties.json": pub_s, "tensors.json": pub_t, "dispersion.json": pub_d,
        "events-history.json": [e for e in hist if e["verified"]], "events-industry.json": [e for e in ind if e["verified"]], "publications.json": pubs,
        "records.json": pub_recs, "glossary.json": gloss, "glossary-map.json": gloss_map, "jsonld.json": jsonld, "unverified.json": {k: v for k, v in unv.items() if k != "meta"},
    }
    for name, obj in gen.items():
        W.json(GENERATED / name, publicize(obj))

    if write:
        W.flush()
    return {"data": d, "index": index, "files": files, "writer": W, "jsonld": jsonld, "unverified": unv}


def field(name: str, typ: str, unit: str | None) -> dict:
    f: dict[str, Any] = {"name": name, "type": typ}
    if unit:
        f["unit_ucum"] = unit
    return f


def python_snippet(m: dict) -> str:
    c = m["coefficients"]
    if m["formula"]["form"] == "sellmeier-3term":
        return ("def n(L_um):\n"
                f"    B = ({c['B1']!r}, {c['B2']!r}, {c['B3']!r}); C = ({c['C1']!r}, {c['C2']!r}, {c['C3']!r})\n"
                "    L2 = L_um * L_um\n"
                "    return (1 + sum(b * L2 / (L2 - cc) for b, cc in zip(B, C))) ** 0.5\n")
    return ("def n(L_um, T_C=24.5):\n"
            f"    a1, a2, a3, a4, a5, a6 = {c['a1']!r}, {c['a2']!r}, {c['a3']!r}, {c['a4']!r}, {c['a5']!r}, {c['a6']!r}\n"
            f"    b1, b2, b3, b4 = {c['b1']!r}, {c['b2']!r}, {c['b3']!r}, {c['b4']!r}\n"
            "    f = (T_C - 24.5) * (T_C + 570.82); L2 = L_um * L_um\n"
            "    return (a1 + b1 * f + (a2 + b2 * f) / (L2 - (a3 + b3 * f) ** 2) + (a4 + b4 * f) / (L2 - a5 ** 2) - a6 * L2) ** 0.5\n")


def openapi(props: list[str], tensor_index: list[dict], disp_index: list[dict], src_list: list[dict], files: list[str]) -> dict:
    S = f"{SITE}/api/v1/schema/"

    def ok(desc: str, media: str = "application/json", schema: dict | None = None) -> dict:
        content: dict[str, Any] = {media: {}}
        if schema:
            content[media]["schema"] = schema
        return {"get": {"summary": desc, "responses": {"200": {"description": desc, "content": content}}}}

    def p_enum(name: str, values: list[str], desc: str) -> dict:
        return {"name": name, "in": "path", "required": True, "description": desc, "schema": {"type": "string", "enum": sorted(set(values))}}

    def with_params(op: dict, params: list[dict]) -> dict:
        op["get"]["parameters"] = params
        return op

    arr = lambda ref: {"type": "array", "items": {"$ref": S + ref}}  # noqa: E731
    paths: dict[str, Any] = {
        "/api/v1/index.json": ok("Catalog: properties, tensors, dispersion models, variants, counts, endpoints, license"),
        "/api/v1/variants.json": ok("Material variants", schema={"type": "object", "properties": {"variants": arr("variant.schema.json")}}),
        "/api/v1/sources.json": ok("All sources", schema={"type": "object", "properties": {"sources": arr("source.schema.json")}}),
        "/api/v1/sources/{source_id}.json": with_params(ok("One source with formatted citation"), [p_enum("source_id", [s["id"] for s in src_list], "Source id")]),
        "/api/v1/properties.json": ok("All public scalar records", schema={"type": "object", "properties": {"records": arr("scalar.schema.json")}}),
        "/api/v1/properties.csv": ok("All public scalar records as CSV", "text/csv"),
        "/api/v1/properties/{property}.json": with_params(ok("All public records for one property, with schema.org Dataset JSON-LD"), [p_enum("property", props, "Property id")]),
        "/api/v1/properties/{property}/{variant}.json": with_params(ok("Recommended record(s), alternatives and spread for one property and variant"), [p_enum("property", props, "Property id"), {"name": "variant", "in": "path", "required": True, "schema": {"type": "string"}, "description": "Variant id (see variants.json); only combinations listed in index.json exist"}]),
        "/api/v1/tensors.json": ok("All public tensor records", schema={"type": "object", "properties": {"records": arr("tensor.schema.json")}}),
        "/api/v1/tensors.csv": ok("Independent tensor components as CSV", "text/csv"),
        "/api/v1/tensors/{tensor}.json": with_params(ok("All records of one tensor across variants, with per-component spread"), [p_enum("tensor", [t["tensor"] for t in tensor_index], "Tensor id")]),
        "/api/v1/tensors/{tensor}/{variant}.json": with_params(ok("Recommended tensor, alternatives and per-component spread"), [p_enum("tensor", [t["tensor"] for t in tensor_index], "Tensor id"), {"name": "variant", "in": "path", "required": True, "schema": {"type": "string"}}]),
        "/api/v1/tensors/{tensor}/{variant}/{source_id}.json": with_params(ok("One tensor record with Voigt, full tensor, frame and symmetry form", schema={"type": "object", "properties": {"record": {"$ref": S + "tensor.schema.json"}}}), [p_enum("tensor", [t["tensor"] for t in tensor_index], "Tensor id"), {"name": "variant", "in": "path", "required": True, "schema": {"type": "string"}}, {"name": "source_id", "in": "path", "required": True, "schema": {"type": "string"}, "description": "Third segment of the record id"}]),
        "/api/v1/dispersion.json": ok("Dispersion model list"),
        "/api/v1/dispersion/{model_id}.json": with_params(ok("Dispersion model: formula, coefficients, validity, errata, check values", schema={"type": "object", "properties": {"model": {"$ref": S + "dispersion.schema.json"}}}), [p_enum("model_id", [m["id"] for m in disp_index], "Model id")]),
        "/api/v1/dispersion/{model_id}.rii.yml": with_params(ok("refractiveindex.info-compatible YAML export", "application/yaml"), [p_enum("model_id", [m["id"] for m in disp_index], "Model id")]),
        "/api/v1/grids/index/{model_id}/{temperature}.csv": with_params(ok("n(lambda) at 1 nm steps over the validity range, at the model reference temperature (file name T{T_C}C.csv)", "text/csv"), [p_enum("model_id", [m["id"] for m in disp_index], "Model id"), p_enum("temperature", [f"T{slug_t(m['reference_T_C'])}C" for m in disp_index], "Temperature tag")]),
        "/api/v1/events/history.json": ok("History events (status V/P/S)", schema={"type": "object", "properties": {"events": arr("event.schema.json")}}),
        "/api/v1/events/industry.json": ok("Industry events with evidence grades", schema={"type": "object", "properties": {"events": arr("event.schema.json")}}),
        "/api/v1/publications.json": ok("LN-relevant publications of the author", schema={"type": "object", "properties": {"publications": arr("publication.schema.json")}}),
        "/api/v1/records.json": ok("Provisional device-performance records", schema={"type": "object", "properties": {"records": arr("record.schema.json")}}),
        "/api/v1/records.csv": ok("Device-performance records as CSV", "text/csv"),
        "/api/v1/glossary.json": ok("Glossary terms", schema={"type": "object", "properties": {"terms": arr("glossary.schema.json")}}),
        "/api/v1/unverified.json": ok("Unverified rows, excluded from all default endpoints"),
        "/api/v1/datapackage.json": ok("Frictionless Data Package v2 descriptor"),
        "/api/v1/schema/{type}.schema.json": with_params(ok("JSON Schema 2020-12 for a payload type", "application/schema+json"), [p_enum("type", [f.split("/")[-1].removesuffix(".schema.json") for f in files if "/schema/" in f], "Schema name")]),
        "/llms.txt": ok("Agent index (llmstxt.org)", "text/plain"),
        "/llms-full.txt": ok("Concatenated markdown of property data", "text/plain"),
    }
    return {
        "openapi": "3.1.0",
        "info": {"title": "lithium-niobate.com data API", "version": DATA_VERSION, "description": "Static GET-only API. All parameters are path segments; query strings are ignored by the host.", "license": {"name": "CC BY 4.0 (data)", "identifier": "CC-BY-4.0"}},
        "servers": [{"url": SITE}],
        "jsonSchemaDialect": "https://json-schema.org/draft/2020-12/schema",
        "paths": paths,
    }


def fmt_val(r: dict) -> str:
    if "value" in r:
        v = f"{r['value']:g}"
    elif "min" in r:
        v = f"{r['min']:g}-{r['max']:g}"
    else:
        v = r.get("value_text", "")
    u = r.get("uncertainty", {})
    if u.get("type") == "stated":
        v += f" +- {u['value']:g}"
    elif u.get("type") == "approximate":
        v = "about " + v
    return f"{v} {r['unit']['display'] if r['unit']['display'] != '-' else ''}".strip()


def cond_text(r: dict) -> str:
    c = r.get("conditions") or {}
    bits = []
    if c.get("wavelength_nm") is not None:
        bits.append(f"{c['wavelength_nm']:g} nm")
    if c.get("temperature_C") is not None:
        bits.append(f"{c['temperature_C']:g} C")
    elif c.get("temperature_text"):
        bits.append(c["temperature_text"])
    if c.get("mechanical_boundary"):
        bits.append({"S": "clamped (S)", "T": "unclamped (T)"}[c["mechanical_boundary"]])
    return ", ".join(bits)


def llms_txt(index: dict, scal: list[dict], tens: list[dict], disp: list[dict], gloss: list[dict], sources: dict, hist: list[dict], recs: list[dict]) -> tuple[str, str]:
    L = [
        "# lithium-niobate.com",
        "",
        "> Lithium niobate (LiNbO3, LN): crystal, light, sound, quirks, fabrication, devices, history and industry. Machine-readable, provenance-tagged property data: every value carries its variant (CLN, SLN, MgO-doped), conditions, source with DOI and locator, and a status code (P primary, P-comp compilation, P-db database, S secondary, V vendor, C computed; U unverified rows are excluded from default endpoints). Data license: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Code license: GPL-3.0.",
        "",
        "The API is static and path-parameterized (no query strings). Defaults: congruent LN (CLN); kushibiki1999 for elastic, piezoelectric, dielectric constants and density; Zelmon 1997 Sellmeier (MgO5 with the 2026 erratum applied). Where sources disagree (e.g. clamped r51: 18.2 vs 28 pm/V) records are listed side by side as a spread, not blended.",
        "",
        "## API",
        "",
        f"- [Catalog]({SITE}/api/v1/index.json): properties, tensors, dispersion models, variants, counts, endpoint templates",
        f"- [OpenAPI 3.1]({SITE}/api/openapi.json): every GET path",
        f"- [Scalar properties (JSON)]({SITE}/api/v1/properties.json) and [CSV]({SITE}/api/v1/properties.csv)",
        f"- [Tensors (JSON)]({SITE}/api/v1/tensors.json): 3m tensors with independent components, Voigt matrix and convention, full Cartesian tensor, frame and sign convention",
        f"- [Dispersion models]({SITE}/api/v1/dispersion.json): formulas, coefficients, validity, errata, check values, 1 nm index grids, refractiveindex.info YAML",
        f"- [Sources]({SITE}/api/v1/sources.json): bibliographic register with DOIs and how each source was read",
        f"- [Variants]({SITE}/api/v1/variants.json)",
        f"- [Data package]({SITE}/api/v1/datapackage.json): Frictionless v2 with UCUM units per field",
        "",
        "## Timelines and records",
        "",
        f"- [History events]({SITE}/api/v1/events/history.json): dated milestones 1928 onward with status and DOI",
        f"- [Industry events]({SITE}/api/v1/events/industry.json): 2009 onward, with evidence grades and access dates",
        f"- [Device records]({SITE}/api/v1/records.json): provisional TFLN/TFLT performance records with DOI and verification flag",
        f"- [Publications]({SITE}/api/v1/publications.json): LN-relevant publications of the site author",
        "",
        "## Reference",
        "",
        f"- [Glossary]({SITE}/api/v1/glossary.json): {len(gloss)} terms with one-sentence definitions and sources",
        f"- [Full text for agents]({SITE}/llms-full.txt): recommended values, tensors, dispersion models and glossary as markdown",
        "",
        "## Optional",
        "",
        f"- [Unverified rows]({SITE}/api/v1/unverified.json): claims that must not be presented as fact",
        f"- [JSON Schemas]({SITE}/api/v1/schema/scalar.schema.json): one per payload type",
        "",
    ]
    F = [
        "# lithium-niobate.com: LiNbO3 property data (full text)",
        "",
        "> Recommended values with conditions, status and source for every property, followed by tensors, dispersion models and the glossary. Data license CC BY 4.0. Generated from the canonical data; the JSON API carries all alternatives.",
        "",
        "Status codes: " + index["status_codes"],
        "",
        "## Scalar properties",
        "",
    ]
    for p in index["properties"]:
        rs = [r for r in scal if r["property"] == p["property"]]
        F.append(f"### {p['name']} ({p['property']})")
        F.append("")
        for r in sorted(rs, key=lambda r: (not r.get("default"), r["variant"], r["id"])):
            s = sources[r["provenance"]["source_id"]]
            tag = "recommended" if r.get("default") else "alternative"
            ct = cond_text(r)
            lt = " [LiTaO3 comparison]" if r["variant"].startswith("lt-") else ""
            F.append(f"- {r['variant']}{lt}: {fmt_val(r)}{' (' + ct + ')' if ct else ''}; {r['provenance']['status']}; {tag}; source {s['id']}{' (' + r['provenance']['locator'] + ')' if r['provenance'].get('locator') else ''}{', ' + source_link(s) if source_link(s) else ''}")
        F.append("")
    F += ["## Tensors (point group 3m; x perpendicular to a mirror plane, z polar c axis)", ""]
    for t in tens:
        comps = ", ".join(f"{k} = {v['value']:g}" for k, v in sorted(t["independent"].items()))
        s = sources[t["provenance"]["source_id"]]
        F.append(f"- {t['id']}: {comps} {t['unit']['display']}; {cond_text(t) or 'conditions in record'}; {t['provenance']['status']}{'; recommended' if t.get('default') else ''}; frame convention {t['frame']['convention']}; source {s['id']}{', ' + source_link(s) if source_link(s) else ''}")
    F += ["", "## Dispersion models", ""]
    for m in disp:
        F.append(f"### {m['name']} ({m['id']})")
        F.append("")
        F.append(f"- Formula: {m['formula']['expression']}")
        F.append("- Coefficients: " + ", ".join(f"{k} = {v:g}" for k, v in m["coefficients"].items()))
        F.append(f"- Validity: {m['valid_lambda_um'][0]:g}-{m['valid_lambda_um'][1]:g} um; reference {slug_t(m['reference_T_C'])} C; status {m['provenance']['status']}")
        for e in m.get("errata", []):
            F.append(f"- Erratum: {e['citation']}; applied: {str(e['applied']).lower()}")
        for c in m.get("caveats", []):
            F.append(f"- Caveat: {c}")
        F.append("")
    F += ["## Glossary", ""]
    for g in gloss:
        srcs = ", ".join(s.get("source_id") or s["citation"] for s in g["sources"])
        F.append(f"- **{g['term']}**: {g['short']}" + (f" (source: {srcs})" if srcs else ""))
    F.append("")
    return "\n".join(L), "\n".join(F)


def main() -> int:
    check = "--check" in sys.argv
    try:
        res = build(write=not check)
    except BuildError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    c = res["index"]["counts"]
    print(json.dumps(c, indent=2, sort_keys=True))
    print(f"files: {len(res['files'])} API/static files + {sum(1 for p in res['writer'].files if GENERATED in p.parents)} app copies {'(check only, nothing written)' if check else 'written'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
