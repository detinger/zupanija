export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))];
  return lines.join("\n");
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = "﻿" + toCsv(rows);
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export function downloadJson(filename: string, data: unknown) {
  downloadBlob(filename, new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
}

export async function downloadSvgAsPng(svgEl: SVGSVGElement, filename: string, scale = 2) {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const bbox = svgEl.getBoundingClientRect();
  const width = Number(svgEl.getAttribute("width")) || bbox.width || 800;
  const height = Number(svgEl.getAttribute("height")) || bbox.height || 500;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const style = document.createElement("style");
  style.textContent = "text { font-family: 'Source Sans 3', system-ui, sans-serif; }";
  clone.insertBefore(style, clone.firstChild);

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", "#ffffff");
  clone.insertBefore(bg, clone.firstChild);

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(url);

  canvas.toBlob((blob) => {
    if (blob) downloadBlob(filename, blob);
  }, "image/png");
}
