/**
 * Bundles fingerpose + syauqy/handsign-tensorflow ASL letter gestures (BSD-2-Clause).
 * Build: npx esbuild scripts/handsigns-entry.js --bundle --format=iife --global-name=HandSignAlphabetKit --outfile=public/vendor/handsigns-alphabet.js
 */
import fpMod from "fingerpose";
import { aSign } from "./handsigns-src/Asign.js";
import { bSign } from "./handsigns-src/Bsign.js";
import { cSign } from "./handsigns-src/Csign.js";
import { dSign } from "./handsigns-src/Dsign.js";
import { eSign } from "./handsigns-src/Esign.js";
import { fSign } from "./handsigns-src/Fsign.js";
import { gSign } from "./handsigns-src/Gsign.js";
import { hSign } from "./handsigns-src/Hsign.js";
import { iSign } from "./handsigns-src/Isign.js";
import { jSign } from "./handsigns-src/Jsign.js";
import { kSign } from "./handsigns-src/Ksign.js";
import { lSign } from "./handsigns-src/Lsign.js";
import { mSign } from "./handsigns-src/Msign.js";
import { nSign } from "./handsigns-src/Nsign.js";
import { oSign } from "./handsigns-src/Osign.js";
import { pSign } from "./handsigns-src/Psign.js";
import { qSign } from "./handsigns-src/Qsign.js";
import { rSign } from "./handsigns-src/Rsign.js";
import { sSign } from "./handsigns-src/Ssign.js";
import { tSign } from "./handsigns-src/Tsign.js";
import { uSign } from "./handsigns-src/Usign.js";
import { vSign } from "./handsigns-src/Vsign.js";
import { wSign } from "./handsigns-src/Wsign.js";
import { xSign } from "./handsigns-src/Xsign.js";
import { ySign } from "./handsigns-src/Ysign.js";
import { zSign } from "./handsigns-src/Zsign.js";

const fpExports = fpMod.default || fpMod;

export const alphabetGestureList = [
  aSign,
  bSign,
  cSign,
  dSign,
  eSign,
  fSign,
  gSign,
  hSign,
  iSign,
  jSign,
  kSign,
  lSign,
  mSign,
  nSign,
  oSign,
  pSign,
  qSign,
  rSign,
  sSign,
  tSign,
  uSign,
  vSign,
  wSign,
  xSign,
  ySign,
  zSign,
];

export { fpExports };
