import type {
  ClassificacaoCompra,
  Compra,
  PerfilFinanceiro,
  ResultadoAnaliseCompra,
} from '@/shared/types';

export function calcularRendaDisponivel(perfil: PerfilFinanceiro): number {
  return perfil.salarioLiquido + perfil.outrasRendas - perfil.deducoesMensais;
}

/** Usa média dos últimos 2 meses para projeções futuras */
export function calcularRendaMediaFutura(perfil: PerfilFinanceiro): number {
  const historico = perfil.historicoRendas ?? [];
  if (historico.length >= 2) {
    const ultimas2 = historico.slice(-2);
    const mediaRendaBruta = ultimas2.reduce((s, r) => s + r.total, 0) / 2;
    return mediaRendaBruta - perfil.deducoesMensais;
  }
  return calcularRendaDisponivel(perfil);
}

export function calcularParcelaMensal(valor: number, numeroParcelas: number): number {
  return valor / numeroParcelas;
}

export function compraIncideNoMes(compra: Compra, mesReferencia: string): boolean {
  const [anoCompra, mesCompra] = compra.dataCompra.split('-').map(Number);
  const [anoRef, mesRef] = mesReferencia.split('-').map(Number);
  const indiceMesCompra = anoCompra * 12 + (mesCompra - 1);
  const indiceMesRef = anoRef * 12 + (mesRef - 1);
  const mesesPassados = indiceMesRef - indiceMesCompra;
  return mesesPassados >= 0 && mesesPassados < compra.numeroParcelas;
}

export function calcularComprometimentoNoMes(compras: Compra[], mesReferencia: string): number {
  return compras.reduce((total, compra) => {
    return compraIncideNoMes(compra, mesReferencia) ? total + compra.parcelaMensal : total;
  }, 0);
}

export function classificarComprometimento(percentual: number): ClassificacaoCompra {
  if (percentual <= 40) return 'ok';
  if (percentual <= 60) return 'moderado';
  return 'atencao';
}

export function analisarNovaCompra(
  perfil: PerfilFinanceiro,
  comprasExistentes: Compra[],
  valorNovaCompra: number,
  numeroParcelas: number,
  dataCompra: string
): ResultadoAnaliseCompra {
  const rendaDisponivel = calcularRendaDisponivel(perfil);
  const mesReferencia = dataCompra.slice(0, 7);
  const comprometidoAtual = calcularComprometimentoNoMes(comprasExistentes, mesReferencia);
  const parcelaMensal = calcularParcelaMensal(valorNovaCompra, numeroParcelas);
  const comprometidoApos = comprometidoAtual + parcelaMensal;
  const percentualApos = rendaDisponivel > 0 ? (comprometidoApos / rendaDisponivel) * 100 : 0;

  return {
    parcelaMensal,
    comprometimentoAtual: rendaDisponivel > 0 ? (comprometidoAtual / rendaDisponivel) * 100 : 0,
    comprometimentoApos: percentualApos,
    classificacao: classificarComprometimento(percentualApos),
  };
}
