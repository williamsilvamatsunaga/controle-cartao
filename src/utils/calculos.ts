import { ClassificacaoCompra, Compra, PerfilFinanceiro, ResultadoAnaliseCompra } from '../types';

// Renda disponível para gastos, após reserva e investimentos
export function calcularRendaDisponivel(perfil: PerfilFinanceiro): number {
  return perfil.salarioLiquido + perfil.outrasRendas - perfil.reservaEmergencia - perfil.investimentos;
}

// Parcela mensal de uma compra (sem juros)
export function calcularParcelaMensal(valor: number, numeroParcelas: number): number {
  return valor / numeroParcelas;
}

// Soma das parcelas de TODAS as compras que ainda estão ativas em um mês específico
export function calcularComprometimentoNoMes(
  compras: Compra[],
  mesReferencia: string // formato "YYYY-MM"
): number {
  return compras.reduce((total, compra) => {
    const compraEstaAtivaNoMes = compraIncideNoMes(compra, mesReferencia);
    return compraEstaAtivaNoMes ? total + compra.parcelaMensal : total;
  }, 0);
}

// Verifica se uma compra ainda tem parcela "rodando" em determinado mês
function compraIncideNoMes(compra: Compra, mesReferencia: string): boolean {
  const [anoCompra, mesCompra] = compra.dataCompra.split('-').map(Number);
  const [anoRef, mesRef] = mesReferencia.split('-').map(Number);

  const indiceMesCompra = anoCompra * 12 + (mesCompra - 1);
  const indiceMesRef = anoRef * 12 + (mesRef - 1);

  const mesesPassados = indiceMesRef - indiceMesCompra;
  return mesesPassados >= 0 && mesesPassados < compra.numeroParcelas;
}

// Classificação visual baseada no % comprometido
export function classificarComprometimento(percentual: number): ClassificacaoCompra {
  if (percentual <= 40) return 'ok';
  if (percentual <= 60) return 'moderado';
  return 'atencao';
}

// Função central: simula o impacto de uma nova compra ANTES de salvar
export function analisarNovaCompra(
  perfil: PerfilFinanceiro,
  comprasExistentes: Compra[],
  valorNovaCompra: number,
  numeroParcelas: number,
  dataCompra: string
): ResultadoAnaliseCompra {
  const rendaDisponivel = calcularRendaDisponivel(perfil);
  const mesReferencia = dataCompra.slice(0, 7); // "YYYY-MM"

  const comprometidoAtual = calcularComprometimentoNoMes(comprasExistentes, mesReferencia);
  const parcelaMensal = calcularParcelaMensal(valorNovaCompra, numeroParcelas);
  const comprometidoApos = comprometidoAtual + parcelaMensal;

  const comprometimentoAtualPercentual = (comprometidoAtual / rendaDisponivel) * 100;
  const comprometimentoAposPercentual = (comprometidoApos / rendaDisponivel) * 100;

  return {
    parcelaMensal,
    comprometimentoAtual: comprometimentoAtualPercentual,
    comprometimentoApos: comprometimentoAposPercentual,
    classificacao: classificarComprometimento(comprometimentoAposPercentual),
  };
}