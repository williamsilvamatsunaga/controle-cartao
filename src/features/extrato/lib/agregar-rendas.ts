import type {
  CandidatoRendaClassificado,
  RendaAgregadaDeExtrato,
} from '../types';

function mesDe(data: string): string {
  return data.slice(0, 7);
}

export function agregarRendasValidadas(
  itens: CandidatoRendaClassificado[]
): RendaAgregadaDeExtrato {
  const uteis = itens.filter((i) => i.classificacao !== 'ignorar');
  if (uteis.length === 0) {
    return { salarioLiquido: 0, outrasRendas: 0, historicoRendas: [] };
  }

  const porMes = new Map<string, { salario: number; outras: number }>();

  for (const item of uteis) {
    const mes = mesDe(item.data);
    const atual = porMes.get(mes) ?? { salario: 0, outras: 0 };
    if (item.classificacao === 'salario') {
      atual.salario += item.valor;
    } else {
      atual.outras += item.valor;
    }
    porMes.set(mes, atual);
  }

  const meses = [...porMes.keys()].sort();
  const historicoRendas = meses.map((mes) => {
    const { salario, outras } = porMes.get(mes)!;
    return { mes, total: salario + outras };
  });

  const ultimoMes = meses[meses.length - 1];
  const atual = porMes.get(ultimoMes)!;

  return {
    salarioLiquido: atual.salario,
    outrasRendas: atual.outras,
    historicoRendas,
  };
}
