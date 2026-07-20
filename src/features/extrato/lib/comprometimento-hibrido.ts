import { calcularComprometimentoNoMes } from '@/shared/lib/calculos';
import type { Compra } from '@/shared/types';

import type { LancamentoPersistido } from '../types';

/**
 * Comprometimento do cartão = parcelas manuais do mês
 * + débitos do extrato classificados como cartão.
 */
export function calcularComprometimentoHibrido(
  compras: Compra[],
  lancamentos: LancamentoPersistido[],
  mesReferencia: string
): number {
  const parcelas = calcularComprometimentoNoMes(compras, mesReferencia);
  const cartaoExtrato = lancamentos
    .filter(
      (l) =>
        l.mes === mesReferencia &&
        l.tipo === 'debito' &&
        l.natureza === 'cartao'
    )
    .reduce((s, l) => s + l.valor, 0);
  return parcelas + cartaoExtrato;
}
