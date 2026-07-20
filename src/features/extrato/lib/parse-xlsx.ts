import * as XLSX from 'xlsx';

import type { LancamentoExtrato } from '../types';
import { parseCsvExtrato } from './parse-csv';

/**
 * Converte a primeira planilha em CSV e reutiliza o parser CSV
 * (mesma lógica de colunas Data/Descrição/Valor).
 */
export function parseXlsxExtrato(buffer: ArrayBuffer): LancamentoExtrato[] {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ';' });
  return parseCsvExtrato(csv);
}
