import type { InstituicaoBancaria } from '@/shared/types';

export const PACKAGES_BANCARIOS: Record<string, InstituicaoBancaria> = {
  'com.nu.production': 'nubank',
  'br.com.intermedium': 'inter',
  'br.com.sicoob.mobile': 'sicoob',
};

export const LABELS_INSTITUICAO: Record<InstituicaoBancaria, string> = {
  nubank: 'Nubank',
  inter: 'Inter',
  sicoob: 'Sicoob',
};

export const PACKAGES_PERMITIDOS = Object.keys(PACKAGES_BANCARIOS);
