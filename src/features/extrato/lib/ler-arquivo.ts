import { File as ExpoFile } from 'expo-file-system';

import type { LancamentoExtrato } from '../types';
import {
  detectarFormatoExtrato,
  parseExtratoPorFormato,
  type FormatoExtrato,
} from './parse-arquivo';

export interface AssetExtrato {
  uri: string;
  name: string;
  mimeType?: string | null;
  /** Presente no web (DocumentPicker). */
  file?: Blob;
}

export class FormatoExtratoNaoSuportadoError extends Error {
  constructor(nome: string) {
    super(
      `"${nome}" não é suportado. Exporte CSV, OFX ou Excel (XLSX) no app do banco. PDF ainda não é lido automaticamente.`
    );
    this.name = 'FormatoExtratoNaoSuportadoError';
  }
}

export async function lerEParsearExtrato(asset: AssetExtrato): Promise<{
  formato: FormatoExtrato;
  lancamentos: LancamentoExtrato[];
}> {
  const formato = detectarFormatoExtrato(asset.name, asset.mimeType);
  if (formato === 'desconhecido') {
    throw new FormatoExtratoNaoSuportadoError(asset.name);
  }

  let texto: string | null = null;
  let buffer: ArrayBuffer | null = null;

  if (asset.file) {
    if (formato === 'xlsx') {
      buffer = await asset.file.arrayBuffer();
    } else {
      texto = await asset.file.text();
    }
  } else {
    const file = new ExpoFile(asset.uri);
    if (formato === 'xlsx') {
      buffer = await file.arrayBuffer();
    } else {
      texto = await file.text();
    }
  }

  const lancamentos = parseExtratoPorFormato(formato, texto, buffer);
  return { formato, lancamentos };
}
