// Tiny stack VM for make.fun's ISA (program/generator/subject/ISA.md): 32-bit wrapping
// arithmetic, 256-value data stack, 64-deep call stack, 256 words of memory, input/output,
// ten traps with their own exit codes, a 1,000,000 step limit and a 65,536 byte output
// limit. Answers every instance of a set in one run: /input/<id>/program.bin + input.bin
// in, /output/<id>/stdout.bin + exit.txt out (or MAKEFUN_INPUT_DIR / MAKEFUN_OUTPUT_DIR).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
function run(p: Uint8Array, inp: Uint8Array): [Uint8Array, number] {
  const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), o = new Uint8Array(65536);
  let s = 0, c = 0, l = 0, ip = 0, pc = 0, st = 0;
  const end = (e: number): [Uint8Array, number] => [o.slice(0, l), e];
  for (;;) {
    if (st === 1e6) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const op = p[pc];
    if (op > 7 && !(op >= 16 && op <= 30) && !(op >= 32 && op <= 34) && !(op >= 48 && op <= 52) && op !== 64 && op !== 65 && !(op >= 80 && op <= 83)) return end(5);
    let im = 0;
    if (op === 1) im = 1;
    else if (op === 2) im = 4;
    else if (op >= 48 && op <= 51) im = 2;
    if (pc + im >= n) return end(9);
    let po = 0, pu = 0;
    if (op === 3 || op === 4 || op === 23 || op === 27 || op === 64 || op === 80 || op === 81 || op === 83) po = 1;
    else if (op === 5 || op === 6) po = 2;
    else if (op === 7) po = 3;
    else if (op >= 16 && op <= 34) po = 2;
    else if (op === 49 || op === 50) po = 1;
    else if (op === 65) po = 2;
    if (op === 1 || op === 2 || op === 4 || op === 64 || op === 82) pu = 1;
    else if (op === 5) pu = 2;
    else if (op === 6 || op === 7) pu = 3;
    else if (op >= 16 && op <= 34) pu = 1;
    st++;
    const nx = pc + 1 + im;
    if (s < po) return end(2);
    if (s - po + pu > 256) return end(3);
    pc = nx;
    switch (op) {
      case 0: return end(0);
      case 1: D[s++] = (p[nx - 1] << 24) >> 24; break;
      case 2: D[s++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 3: s--; break;
      case 4: D[s] = D[s - 1]; s++; break;
      case 5: { const t = D[s - 1]; D[s - 1] = D[s - 2]; D[s - 2] = t; break; }
      case 6: D[s] = D[s - 2]; s++; break;
      case 7: { const a = D[s - 3]; D[s - 3] = D[s - 2]; D[s - 2] = D[s - 1]; D[s - 1] = a; break; }
      case 23: D[s - 1] = -D[s - 1] | 0; break;
      case 27: D[s - 1] = ~D[s - 1]; break;
      case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 24: case 25: case 26:
      case 28: case 29: case 30: case 32: case 33: case 34: {
        const b = D[s - 1], a = D[s - 2];
        let r = 0;
        if (op === 16) r = (a + b) | 0;
        else if (op === 17) r = (a - b) | 0;
        else if (op === 18) r = Math.imul(a, b);
        else if (op === 19) { if (!b) return end(4); r = (a / b) | 0; }
        else if (op === 20) { if (!b) return end(4); r = (a % b) | 0; }
        else if (op === 21) { if (!b) return end(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (op === 22) { if (!b) return end(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op === 24) r = a & b;
        else if (op === 25) r = a | b;
        else if (op === 26) r = a ^ b;
        else if (op === 28) r = a << (b & 31);
        else if (op === 29) r = a >> (b & 31);
        else if (op === 30) r = (a >>> (b & 31)) | 0;
        else if (op === 32) r = a === b ? 1 : 0;
        else if (op === 33) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        s -= 2; D[s++] = r; break;
      }
      case 48: case 49: case 50: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        let t = 1;
        if (op !== 48) { const v = D[--s]; t = op === 49 ? (v === 0 ? 1 : 0) : (v !== 0 ? 1 : 0); }
        if (t) pc = nx + rel;
        break;
      }
      case 51:
        if (c === 64) return end(7);
        C[c++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8); break;
      case 52:
        if (!c) return end(8);
        pc = C[--c]; break;
      case 64: { const a = D[s - 1]; if (a < 0 || a > 255) return end(6); D[s - 1] = M[a]; break; }
      case 65: { const a = D[s - 1], v = D[s - 2]; if (a < 0 || a > 255) return end(6); s -= 2; M[a] = v; break; }
      case 80: { const t = String(D[s - 1]); if (l + t.length > 65536) return end(11); s--; for (let i = 0; i < t.length; i++) o[l++] = t.charCodeAt(i); break; }
      case 81:
        if (l + 1 > 65536) return end(11);
        o[l++] = D[--s] & 255; break;
      case 82: D[s++] = ip < inp.length ? inp[ip++] : -1; break;
      case 83: return end(D[--s] & 255);
    }
  }
}
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const [o, e] = run(new Uint8Array(readFileSync(join(I, id, 'program.bin'))), new Uint8Array(readFileSync(join(I, id, 'input.bin'))));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), o);
  writeFileSync(join(O, id, 'exit.txt'), e + '\n');
}
