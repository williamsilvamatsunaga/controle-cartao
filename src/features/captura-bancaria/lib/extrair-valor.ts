export function extrairValorMonetario(texto: string): number | null {
  const match = texto.match(/R\$\s*([\d.]+,\d{2}|\d+)/i);
  if (!match) return null;
  const normalizado = match[1].replace(/\./g, '').replace(',', '.');
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}
