import type { LancamentoExtrato } from '../types';
import { parseCsvExtrato } from './parse-csv';
import { parseOfxExtrato } from './parse-ofx';
import { parseXlsxExtrato } from './parse-xlsx';

export type FormatoExtrato = 'csv' | 'ofx' | 'xlsx' | 'desconhecido';

export function detectarFormatoExtrato(
  nomeArquivo: string,
  mimeType?: string | null
): FormatoExtrato {
  const nome = nomeArquivo.toLowerCase();
  const mime = (mimeType ?? '').toLowerCase();

  if (nome.endsWith('.ofx') || mime.includes('ofx')) return 'ofx';
  if (
    nome.endsWith('.xlsx') ||
    nome.endsWith('.xls') ||
    mime.includes('spreadsheet') ||
    mime.includes('excel')
  ) {
    return 'xlsx';
  }
  if (nome.endsWith('.csv') || mime.includes('csv') || mime.includes('text/plain')) {
    return 'csv';
  }
  if (nome.endsWith('.pdf') || mime.includes('pdf')) return 'desconhecido';
  return 'desconhecido';
}

export function parseExtratoPorFormato(
  formato: FormatoExtrato,
  conteudoTexto: string | null,
  buffer: ArrayBuffer | null
): LancamentoExtrato[] {
  if (formato === 'csv' && conteudoTexto != null) {
    return parseCsvExtrato(conteudoTexto);
  }
  if (formato === 'ofx' && conteudoTexto != null) {
    return parseOfxExtrato(conteudoTexto);
  }
  if (formato === 'xlsx' && buffer != null) {
    return parseXlsxExtrato(buffer);
  }
  return [];
}
