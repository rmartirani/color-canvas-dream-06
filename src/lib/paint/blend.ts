// Mistura realista cor x foto preservando luz/sombra (modo multiply normalizado).
// resultado = foto * (cor / 255), depois lerp(foto, resultado, realismo)
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function applyPaint(
  base: ImageData,
  mask: Uint8Array,
  hex: string,
  realism: number, // 0..1
  out: ImageData,
): void {
  const [cr, cg, cb] = hexToRgb(hex);
  const d = base.data;
  const o = out.data;
  const n = mask.length;
  // Normaliza a cor pela média de luminância da área mascarada para que
  // a cor escolhida apareça com fidelidade nas áreas neutras da foto.
  let sumL = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (mask[i] > 0) {
      const j = i * 4;
      sumL += 0.2126 * d[j] + 0.7152 * d[j + 1] + 0.0722 * d[j + 2];
      count++;
    }
  }
  const avgL = count > 0 ? sumL / count : 180;
  const scale = avgL > 1 ? 255 / avgL : 1;

  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const a = mask[i] / 255;
    if (a === 0) {
      o[j] = d[j];
      o[j + 1] = d[j + 1];
      o[j + 2] = d[j + 2];
      o[j + 3] = d[j + 3];
      continue;
    }
    // Multiply normalizado: mantém variações da foto, aplica cor escolhida
    const r = Math.min(255, (d[j] * scale * cr) / 255);
    const g = Math.min(255, (d[j + 1] * scale * cg) / 255);
    const b = Math.min(255, (d[j + 2] * scale * cb) / 255);
    // Mistura entre multiply puro e a foto original baseada no realismo
    const k = a * realism;
    o[j] = d[j] * (1 - k) + r * k;
    o[j + 1] = d[j + 1] * (1 - k) + g * k;
    o[j + 2] = d[j + 2] * (1 - k) + b * k;
    o[j + 3] = d[j + 3];
  }
}

// Flood fill com tolerância simples em RGB. Marca pixels na máscara.
export function bucketFill(
  base: ImageData,
  mask: Uint8Array,
  x: number,
  y: number,
  tolerance: number, // 0..100 (distância RGB euclidiana)
  value: number = 255,
): void {
  const { width: w, height: h, data } = base;
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const idx = (y * w + x) * 4;
  const tr = data[idx];
  const tg = data[idx + 1];
  const tb = data[idx + 2];
  const tol2 = tolerance * tolerance * 3;
  const visited = new Uint8Array(w * h);
  const stack: number[] = [x, y];
  while (stack.length) {
    const cy = stack.pop()!;
    const cx = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const i = cy * w + cx;
    if (visited[i]) continue;
    visited[i] = 1;
    const k = i * 4;
    const dr = data[k] - tr;
    const dg = data[k + 1] - tg;
    const db = data[k + 2] - tb;
    if (dr * dr + dg * dg + db * db > tol2) continue;
    mask[i] = value;
    stack.push(cx + 1, cy, cx - 1, cy, cx, cy + 1, cx, cy - 1);
  }
}

export function paintStroke(
  mask: Uint8Array,
  w: number,
  h: number,
  x: number,
  y: number,
  radius: number,
  erase: boolean,
): void {
  const r2 = radius * radius;
  const x0 = Math.max(0, Math.floor(x - radius));
  const x1 = Math.min(w - 1, Math.ceil(x + radius));
  const y0 = Math.max(0, Math.floor(y - radius));
  const y1 = Math.min(h - 1, Math.ceil(y + radius));
  for (let yy = y0; yy <= y1; yy++) {
    for (let xx = x0; xx <= x1; xx++) {
      const dx = xx - x;
      const dy = yy - y;
      if (dx * dx + dy * dy <= r2) {
        mask[yy * w + xx] = erase ? 0 : 255;
      }
    }
  }
}
