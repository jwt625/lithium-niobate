// Materials shared by the scenes. LN strategy per R05 B7: MeshPhysicalMaterial with transmission, one display index
// (three.js holds a single scalar ior, so birefringence is not represented), dispersion from the Abbe number of the
// Zelmon 1997 CLN ordinary index, an environment map, and a faint straw attenuation (tint is template).
import * as THREE from "three";
import { refractiveIndex } from "../physics/sellmeier.ts";
import { ZELMON_CLN_E, ZELMON_CLN_O } from "../physics/constants.ts";
import type { PDim } from "./types.ts";

export interface LnOptics {
  nd_o: PDim; // n_o at the helium d line 587.6 nm
  nd_e: PDim;
  abbe_o: PDim; // V_d = (n_d - 1) / (n_F - n_C), F 486.1 nm, C 656.3 nm
  dispersion: PDim; // three.js / KHR_materials_dispersion value 20 / V_d
  F0: PDim; // normal-incidence reflectance ((n - 1)/(n + 1))^2 at n_d
}

/** Display optics of congruent LN from the Zelmon 1997 fit (derived values). */
export function lnOptics(): LnOptics {
  const d = 0.5876, F = 0.4861, C = 0.6563;
  const no = (l: number): number => refractiveIndex(ZELMON_CLN_O, l), ne = (l: number): number => refractiveIndex(ZELMON_CLN_E, l);
  const nd = no(d), V = (nd - 1) / (no(F) - no(C));
  const src = { source: "zelmon1997", locator: "src/lib/physics/constants.ts ZELMON_CLN_O/E (21 C)" };
  return {
    nd_o: { value: nd, unit: "", status: "derived", formula: "Zelmon 1997 CLN n_o at 587.6 nm", ...src },
    nd_e: { value: ne(d), unit: "", status: "derived", formula: "Zelmon 1997 CLN n_e at 587.6 nm", ...src },
    abbe_o: { value: V, unit: "", status: "derived", formula: "(n_d - 1) / (n_F - n_C), F 486.1 nm, C 656.3 nm, ordinary", ...src },
    dispersion: { value: 20 / V, unit: "", status: "derived", formula: "20 / V_d (KHR_materials_dispersion; three.js spreads ior by (n - 1) / V_d between R and B)" },
    F0: { value: ((nd - 1) / (nd + 1)) ** 2, unit: "", status: "derived", formula: "((n_d - 1) / (n_d + 1))^2" },
  };
}

/** Transmissive LN crystal material. thickness = typical path length through the body (scene units). */
export function lnMaterial(o: { thickness: number; tint: string; attenuationDistance: number; env: THREE.Texture | null; transmission?: number }): THREE.MeshPhysicalMaterial {
  const op = lnOptics();
  return new THREE.MeshPhysicalMaterial({
    // transmission < 1 leaves a faint diffuse straw body so the crystal keeps its colour on a dark field (R13 audit
    // lesson: LN must not vanish or read as clear glass); display choice, tint is template
    color: new THREE.Color(o.tint),
    metalness: 0,
    roughness: 0.03,
    transmission: o.transmission ?? 0.86,
    thickness: o.thickness,
    ior: Math.min(2.333, op.nd_o.value as number),
    dispersion: op.dispersion.value as number,
    attenuationColor: new THREE.Color(o.tint),
    attenuationDistance: o.attenuationDistance,
    specularIntensity: 1,
    specularColor: new THREE.Color(0xffffff),
    envMap: o.env,
    envMapIntensity: 1.25,
    side: THREE.FrontSide,
  });
}

export interface LnShaderOptions {
  env: THREE.CubeTexture;
  tint: string; // template straw tint (assets3d/crystal.toml look.tint)
  attenuationDistance: number; // scene units, template
  thickness: number; // typical path length through the body (scene units)
  thin?: boolean; // polished plate: two-surface Fresnel reflectance, straight-through transmission (alpha blended)
  cylinderRadius?: number; // thick body: exit surface modelled as a cylinder about object +Y (object units)
  envIntensity?: number;
}

/** LN crystal shader (WebGL ShaderMaterial; replaces MeshPhysicalMaterial transmission, which shows only the dark
 *  field behind a crystal on a dark page and costs a second scene pass).
 *  Thick body: Schlick-Fresnel reflection of the studio cube map with F0 from n_d, plus the cube map seen through one
 *  refracting surface with per-channel index n_C, n_d, n_F (656.3, 587.6, 486.1 nm; Zelmon 1997 CLN ordinary), and
 *  Beer-Lambert straw attenuation over the path. With cylinderRadius the back surface is the boule's body cylinder:
 *  exit point solved analytically, refraction out with the same per-channel index, total internal reflection when
 *  refraction fails (one internal bounce, then the cube map). Without it the path is estimated and the back surface is
 *  ignored. Display approximation (the cones and seed exit through the body cylinder); stated in getInfo().optics.
 *  Thin plate: incoherent two-surface reflectance R2 = 2R / (1 + R) with R the unpolarized Fresnel reflectance at the
 *  view angle (0.27 at normal incidence for n = 2.30, against 0.08 for n = 1.5 glass), drawn as alpha over the scene. */
export function lnCrystalMaterial(o: LnShaderOptions): THREE.ShaderMaterial {
  const nC = refractiveIndex(ZELMON_CLN_O, 0.6563), nd = refractiveIndex(ZELMON_CLN_O, 0.5876), nF = refractiveIndex(ZELMON_CLN_O, 0.4861);
  const tint = new THREE.Color(o.tint);
  return new THREE.ShaderMaterial({
    uniforms: {
      envMap: { value: o.env },
      nRGB: { value: new THREE.Vector3(nC, nd, nF) },
      tint: { value: new THREE.Vector3(tint.r, tint.g, tint.b) },
      attD: { value: o.attenuationDistance },
      thick: { value: o.thickness },
      envI: { value: o.envIntensity ?? 1 },
      opacity: { value: 1 },
      cylR: { value: o.cylinderRadius ?? 1 },
    },
    transparent: !!o.thin,
    depthWrite: !o.thin,
    defines: o.thin ? { THIN: 1 } : o.cylinderRadius ? { CYL: 1 } : {},
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vP; varying vec3 vOP; varying vec3 vON;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vP = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); vOP = position; vON = normal;
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform samplerCube envMap; uniform vec3 nRGB; uniform vec3 tint; uniform float attD; uniform float thick; uniform float envI; uniform float opacity;
      varying vec3 vN; varying vec3 vP; varying vec3 vOP; varying vec3 vON;
      uniform mat4 modelMatrix; uniform float cylR;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      // exit of an internal ray (object space) through the local cylinder x^2 + z^2 = r^2, r = radius of the entry point
      // (body, cones and seed each treated as locally cylindrical); returns the outgoing direction
      vec3 exitDir(vec3 Po, vec3 To, float n, out float L) {
        float r = max(length(Po.xz), 0.02 * cylR) * 1.0005;
        float a = To.x * To.x + To.z * To.z, b = 2.0 * (Po.x * To.x + Po.z * To.z), c = Po.x * Po.x + Po.z * Po.z - r * r;
        float disc = b * b - 4.0 * a * c;
        if (a < 1e-6 || disc < 0.0) { L = r; return To; }
        float s = max(0.0, (-b + sqrt(disc)) / (2.0 * a)); L = s;
        vec3 E = Po + s * To; vec3 Ne = normalize(vec3(E.x, 0.0, E.z));
        vec3 D = refract(To, -Ne, n);
        if (dot(D, D) < 1e-6) D = reflect(To, -Ne); // total internal reflection
        return D;
      }
      vec3 env(vec3 d) { return textureCube(envMap, d).rgb * envI; }
      float fresnelU(float ci, float n) {
        float si2 = 1.0 - ci * ci; float ct = sqrt(max(0.0, 1.0 - si2 / (n * n)));
        float rs = (ci - n * ct) / (ci + n * ct); float rp = (n * ci - ct) / (n * ci + ct);
        return 0.5 * (rs * rs + rp * rp);
      }
      void main() {
        #include <logdepthbuf_fragment>
        vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vP);
        if (!gl_FrontFacing) N = -N;
        vec3 I = -V; float ci = clamp(dot(N, V), 0.0, 1.0);
        vec3 refl = env(reflect(I, N));
      #ifdef THIN
        float R = fresnelU(max(ci, 1e-3), nRGB.g); float R2 = 2.0 * R / (1.0 + R);
        gl_FragColor = vec4(refl, clamp(R2 * opacity, 0.0, 1.0));
      #else
        float F = fresnelU(max(ci, 1e-3), nRGB.g);
        vec3 tr;
      #ifdef CYL
        mat3 M = mat3(modelMatrix); mat3 Mi = inverse(M); float sc = length(M[0]);
        vec3 Io = normalize(Mi * I); vec3 No = normalize(vON); if (dot(No, Io) > 0.0) No = -No;
        float Lr, Lg, Lb;
        tr.r = env(normalize(M * exitDir(vOP, refract(Io, No, 1.0 / nRGB.r), nRGB.r, Lr))).r;
        tr.g = env(normalize(M * exitDir(vOP, refract(Io, No, 1.0 / nRGB.g), nRGB.g, Lg))).g;
        tr.b = env(normalize(M * exitDir(vOP, refract(Io, No, 1.0 / nRGB.b), nRGB.b, Lb))).b;
        vec3 att = pow(tint, vec3(Lr, Lg, Lb) * sc / attD);
        gl_FragColor = vec4(mix(tr * att, refl, F), opacity);
      #else
        tr.r = env(refract(I, N, 1.0 / nRGB.r)).r;
        tr.g = env(refract(I, N, 1.0 / nRGB.g)).g;
        tr.b = env(refract(I, N, 1.0 / nRGB.b)).b;
        vec3 T = refract(I, N, 1.0 / nRGB.g);
        float L = thick * (0.35 + 0.65 * clamp(-dot(T, N), 0.0, 1.0));
        vec3 att = pow(tint, vec3(L / attD));
        gl_FragColor = vec4(mix(tr * att, refl, F), opacity);
      #endif
      #endif
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

export const gold = (): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.84, 0.66, 0.36), metalness: 1, roughness: 0.22 });
export const silicon = (): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.34, 0.35, 0.38), metalness: 0.85, roughness: 0.32 });
export const oxide = (): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.55, 0.64, 0.78), metalness: 0, roughness: 0.27, transparent: true, opacity: 0.32, depthWrite: false });
