"""gen_cell.py: build mockup/data/linbo3-cell.json (conventional hexagonal R3c cell of LiNbO3) from a CIF.

Source: R. Hsu, E. N. Maslen, D. du Boulay, N. Ishizawa, Acta Cryst. B 53, 420 (1997), doi:10.1107/S010876819600777X,
CIF from the Crystallography Open Database, entry 2101845 (http://www.crystallography.net/cod/2101845.cif).

Method: parse cell, symmetry operators (_symmetry_equiv_pos_as_xyz, 18 operators including the R centring) and the
asymmetric unit; apply every operator, wrap to [0, 1), drop duplicates (minimum-image tolerance 1e-4); convert to
Cartesian with a1 along x, a2 at 120 deg in the xy plane, c along z. Neighbour shells from all periodic images.
Empty octahedral sites: for each cation column (0,0), (2/3,1/3), (1/3,2/3) and each gap between consecutive O
layers, the centroid of the 6 nearest O; a site is empty when no Li or Nb lies within 1.0 Angstrom of that centroid.

Usage: uv run --no-project --with numpy python -I scripts/gen_cell.py <COD_2101845.cif> mockup/data/linbo3-cell.json
License: GPL-3.0 (repository code license). Output data: CC BY 4.0 (repository data license).
"""

import datetime
import itertools
import json
import re
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np

WYCKOFF = {"Li": "6a", "Nb": "6a", "O": "18b"}  # R3c (No. 161), hexagonal axes: 6a (0,0,z); 18b general
TOL = 1e-4


def num(s: str) -> float:
    return float(re.sub(r"\(.*\)", "", s))


def parse_cif(text: str) -> dict:
    lines = [ln.strip() for ln in text.splitlines()]
    tags = {}
    for ln in lines:
        m = re.match(r"^(_\S+)\s+(.+)$", ln)
        if m:
            tags[m.group(1)] = m.group(2).strip().strip("'")
    ops, atoms = [], []
    i = 0
    while i < len(lines):
        if lines[i] == "loop_":
            j = i + 1
            heads = []
            while j < len(lines) and lines[j].startswith("_"):
                heads.append(lines[j])
                j += 1
            rows = []
            while j < len(lines) and lines[j] and not lines[j].startswith(("_", "loop_", "#")):
                rows.append(lines[j])
                j += 1
            if heads == ["_symmetry_equiv_pos_as_xyz"]:
                ops = [r.strip("'") for r in rows]
            if "_atom_site_label" in heads and "_atom_site_fract_x" in heads:
                ix = {h: k for k, h in enumerate(heads)}
                for r in rows:
                    f = r.split()
                    atoms.append({
                        "label": f[ix["_atom_site_label"]],
                        "frac": [num(f[ix[f"_atom_site_fract_{a}"]]) for a in "xyz"],
                        "uiso_A2": num(f[ix["_atom_site_U_iso_or_equiv"]]) if "_atom_site_U_iso_or_equiv" in ix else None,
                    })
            i = j
        else:
            i += 1
    rev = re.search(r"\$Revision:\s*(\d+)", text)
    dat = re.search(r"\$Date:\s*(\d{4}-\d{2}-\d{2})", text)
    revision = f"COD revision {rev.group(1)} ({dat.group(1)})" if rev and dat else "N/A"
    return {"tags": tags, "ops": ops, "asym": atoms, "revision": revision}


def op_fn(s: str):
    """'2/3-y,1/3+x-y,1/3+z' -> (R, t) with frac' = R @ frac + t."""
    R = np.zeros((3, 3))
    t = np.zeros(3)
    for row, expr in enumerate(s.replace(" ", "").split(",")):
        for sign, term in re.findall(r"([+-]?)([^+-]+)", expr):
            sg = -1.0 if sign == "-" else 1.0
            if term in "xyz":
                R[row, "xyz".index(term)] += sg
            else:
                t[row] += sg * float(Fraction(term))
    return R, t


def wrap(f):
    w = np.mod(f, 1.0)
    w[np.isclose(w, 1.0, atol=TOL)] = 0.0
    return w


def main(cif_path: str, out_path: str) -> None:
    cif = parse_cif(Path(cif_path).read_text())
    tg = cif["tags"]
    a, b, c = (num(tg[f"_cell_length_{k}"]) for k in "abc")
    al, be, ga = (num(tg[f"_cell_angle_{k}"]) for k in ("alpha", "beta", "gamma"))
    assert abs(a - b) < 1e-9 and abs(al - 90) < 1e-9 and abs(be - 90) < 1e-9 and abs(ga - 120) < 1e-9
    M = np.array([[a, -a / 2, 0.0], [0.0, a * np.sqrt(3) / 2, 0.0], [0.0, 0.0, c]])  # columns: a1, a2, c (Angstrom)
    cart = lambda f: M @ np.asarray(f, float)  # noqa: E731
    ops = [op_fn(s) for s in cif["ops"]]

    atoms = []
    for site in cif["asym"]:
        el = re.match(r"[A-Z][a-z]?", site["label"]).group(0)
        found = []
        for R, t in ops:
            q = wrap(R @ np.array(site["frac"]) + t)
            if not any(np.allclose(((q - p + 0.5) % 1.0) - 0.5, 0, atol=TOL) for p in found):
                found.append(q)
        found.sort(key=lambda q: (q[2], q[0], q[1]))
        for q in found:
            atoms.append({"el": el, "site": site["label"], "wyckoff": WYCKOFF[el], "frac": q})
    counts = {el: sum(1 for x in atoms if x["el"] == el) for el in ("Li", "Nb", "O")}

    imgs = np.array(list(itertools.product((-1, 0, 1), repeat=3)), float)
    allf = np.array([x["frac"] for x in atoms])
    els = [x["el"] for x in atoms]

    def shell(p, dmax, skip_self=True):
        out = []
        for k, f in enumerate(allf):
            for im in imgs:
                v = cart(f + im - p)
                d = float(np.linalg.norm(v))
                if (skip_self and d < 1e-6) or d > dmax:
                    continue
                out.append((d, els[k], f + im))
        out.sort(key=lambda z: z[0])
        return out

    def grouped(sh):
        g: dict = {}
        for d, el, _ in sh:
            key = (el, round(d, 3))
            g[key] = g.get(key, 0) + 1
        return [{"el": el, "d_A": d, "n": n} for (el, d), n in sorted(g.items(), key=lambda z: (z[0][1], z[0][0]))]

    def octa(p):
        o6 = [z for z in shell(p, 3.0, skip_self=False) if z[1] == "O"][:6]
        return o6

    for k, x in enumerate(atoms):
        x["id"] = f"{x['el']}{sum(1 for y in atoms[:k] if y['el'] == x['el']) + 1}"
        x["neighbors"] = grouped(shell(x["frac"], 3.1))
        if x["el"] != "O":
            x["octahedron_O_cart"] = [np.round(cart(z[2]), 4).tolist() for z in octa(x["frac"])]

    # O layers and empty octahedral sites
    oz = sorted({round(float(x["frac"][2]), 6) for x in atoms if x["el"] == "O"})
    gaps = [((oz[i] + (oz[(i + 1) % len(oz)] + (1 if i == len(oz) - 1 else 0))) / 2) % 1.0 for i in range(len(oz))]
    cations = [(x["el"], x["frac"]) for x in atoms if x["el"] != "O"]
    empty, column_seq = [], []
    for col in ((0.0, 0.0), (2 / 3, 1 / 3), (1 / 3, 2 / 3)):
        seq = []
        for zg in gaps:
            p = np.array([col[0], col[1], zg])
            o6 = octa(p)
            cen = np.mean([z[2] for z in o6], axis=0)
            occ = None
            for el, f in cations:
                for im in imgs:
                    if np.linalg.norm(cart(f + im - cen)) < 1.0:
                        occ = el
            seq.append((float(np.mod(cen[2], 1.0)), occ or "empty"))
            if occ is None:
                cw = wrap(cen)
                empty.append({
                    "id": f"E{len(empty) + 1}", "el": "empty", "wyckoff": "6a",
                    "frac": cw, "octahedron_O_cart": [np.round(cart(z[2] + (cw - cen)), 4).tolist() for z in o6],
                    "neighbors": grouped(shell(cw, 3.1, skip_self=False)),
                })
        seq.sort()
        column_seq.append({"column_frac_xy": [round(col[0], 6), round(col[1], 6)],
                           "along_c": [{"z_frac": round(z, 4), "occupant": o} for z, o in seq]})

    def dists(el):
        x = next(y for y in atoms if y["el"] == el)
        return sorted(round(z[0], 4) for z in octa(x["frac"]))

    nb, li = next(y for y in atoms if y["el"] == "Nb"), next(y for y in atoms if y["el"] == "Li")
    nb_cen = np.mean([z[2] for z in octa(nb["frac"])], axis=0)
    li_o = [z for z in shell(li["frac"], 3.0) if z[1] == "O"][:3]
    li_plane = np.mean([z[2] for z in li_o], axis=0)

    for x in atoms + empty:
        x["frac"] = np.round(x["frac"], 6).tolist()
        x["cart_A"] = np.round(cart(x["frac"]), 4).tolist()
    order = ["id", "el", "site", "wyckoff", "frac", "cart_A", "neighbors", "octahedron_O_cart"]
    atoms = [{k: x[k] for k in order if k in x} for x in atoms]
    empty = [{k: x[k] for k in order if k in x} for x in empty]

    out = {
        "schema": "linbo3-cell/1",
        "provenance": {
            "source": "R. Hsu, E. N. Maslen, D. du Boulay, N. Ishizawa, Acta Cryst. B 53, 420 (1997)",
            "doi": "10.1107/S010876819600777X",
            "database": "Crystallography Open Database, entry 2101845",
            "cif_url": "http://www.crystallography.net/cod/2101845.cif",
            "cif_revision": cif["revision"],
            "method": "synchrotron X-ray (20 keV, 0.7 Angstrom), 293 K, R = 0.015",
            "status": "P-db (database transcription of the primary refinement); expanded coordinates and distances derived",
            "generator": "scripts/gen_cell.py",
            "generated": datetime.datetime.now(datetime.timezone.utc).date().isoformat(),
            "license": "this file: CC BY 4.0; CIF header: may be used within the scientific community so long as proper attribution is given to the journal article",
        },
        "space_group": {"hm": "R 3 c :H", "it_number": int(tg["_space_group_IT_number"]), "point_group": "3m",
                        "operators": cif["ops"]},
        "cell": {"a_A": a, "c_A": c, "gamma_deg": ga, "Z": int(tg["_cell_formula_units_Z"]),
                 "volume_A3": round(float(np.linalg.det(M)), 3), "temperature_K": num(tg["_cell_measurement_temperature"]),
                 "cartesian": "x along a1; y in the a1-a2 plane; z along c (Angstrom)",
                 "matrix_columns_a1_a2_c": np.round(M, 6).T.tolist()},
        "asymmetric_unit": [{"label": s["label"], "wyckoff": WYCKOFF[s["label"]], "frac": s["frac"], "uiso_A2": s["uiso_A2"]}
                            for s in cif["asym"]],
        "atoms": atoms,
        "empty_octahedral_sites": empty,
        "columns_along_c": column_seq,
        "checks": {
            "counts": counts | {"empty_octahedral": len(empty)},
            "Nb_O_A": dists("Nb"), "Li_O_A": dists("Li"),
            "cif_reported_bonds_A": {"Nb_O": [1.876, 2.130], "Li_O": [2.063, 2.245]},
            "Nb_offset_from_O6_centroid_along_c_A": round(float(cart(nb["frac"] - nb_cen)[2]), 4),
            "Li_height_above_O3_plane_along_c_A": round(float(cart(li["frac"] - li_plane)[2]), 4),
            "Ps_direction": "+z of this coordinate set: Li and Nb are displaced toward +z from the centrosymmetric positions",
        },
    }
    Path(out_path).write_text(json.dumps(out, indent=1) + "\n")
    print(json.dumps(out["checks"], indent=1))
    for cs in column_seq:
        print(cs["column_frac_xy"], " ".join(f"{s['occupant']}@{s['z_frac']}" for s in cs["along_c"]))
    print("wrote", out_path, Path(out_path).stat().st_size, "bytes")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
