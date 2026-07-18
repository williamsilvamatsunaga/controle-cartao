export function parseMoneyInput(texto: string): number {
  return parseFloat(texto.replace(',', '.'));
}
