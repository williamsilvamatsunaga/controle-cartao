import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    CHAVE_COMPRAS,
    CHAVE_EXTRATOS,
    CHAVE_HISTORICO,
    CHAVE_MOVIMENTOS_PENDENTES,
    CHAVE_PERFIL,
} from './keys';

export interface BackupData {
  versao: string;
  exportadoEm: string;
  perfil: unknown;
  compras: unknown;
  historico: unknown;
  extratos: unknown;
  movimentosPendentes: unknown;
}

export async function gerarBackup(): Promise<string> {
  const [perfil, compras, historico, extratos, movimentos] = await Promise.all([
    AsyncStorage.getItem(CHAVE_PERFIL),
    AsyncStorage.getItem(CHAVE_COMPRAS),
    AsyncStorage.getItem(CHAVE_HISTORICO),
    AsyncStorage.getItem(CHAVE_EXTRATOS),
    AsyncStorage.getItem(CHAVE_MOVIMENTOS_PENDENTES),
  ]);

  const backup: BackupData = {
    versao: '1.0',
    exportadoEm: new Date().toISOString(),
    perfil: perfil ? JSON.parse(perfil) : null,
    compras: compras ? JSON.parse(compras) : [],
    historico: historico ? JSON.parse(historico) : [],
    extratos: extratos ? JSON.parse(extratos) : [],
    movimentosPendentes: movimentos ? JSON.parse(movimentos) : [],
  };

  return JSON.stringify(backup, null, 2);
}

export async function restaurarBackup(jsonString: string): Promise<void> {
  const backup: BackupData = JSON.parse(jsonString);

  if (!backup.versao || !backup.exportadoEm) {
    throw new Error('Arquivo de backup inválido.');
  }

  await Promise.all([
    backup.perfil
      ? AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(backup.perfil))
      : Promise.resolve(),
    backup.compras
      ? AsyncStorage.setItem(CHAVE_COMPRAS, JSON.stringify(backup.compras))
      : Promise.resolve(),
    backup.historico
      ? AsyncStorage.setItem(CHAVE_HISTORICO, JSON.stringify(backup.historico))
      : Promise.resolve(),
    backup.extratos
      ? AsyncStorage.setItem(CHAVE_EXTRATOS, JSON.stringify(backup.extratos))
      : Promise.resolve(),
    backup.movimentosPendentes
      ? AsyncStorage.setItem(CHAVE_MOVIMENTOS_PENDENTES, JSON.stringify(backup.movimentosPendentes))
      : Promise.resolve(),
  ]);
}