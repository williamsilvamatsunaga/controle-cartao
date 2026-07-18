import { agregarRendasValidadas } from '../agregar-rendas';
import type { CandidatoRendaClassificado } from '../../types';

describe('agregarRendasValidadas', () => {
  test('agregar_salarioEOutrasPorMes_calculaTotaisEHistorico', () => {
    const itens: CandidatoRendaClassificado[] = [
      {
        id: '1',
        data: '2026-01-05',
        descricao: 'SALARIO',
        valor: 4500,
        tipo: 'credito',
        classificacao: 'salario',
      },
      {
        id: '2',
        data: '2026-01-10',
        descricao: 'FREELA',
        valor: 800,
        tipo: 'credito',
        classificacao: 'outra_renda',
      },
      {
        id: '3',
        data: '2026-02-05',
        descricao: 'SALARIO',
        valor: 4600,
        tipo: 'credito',
        classificacao: 'salario',
      },
      {
        id: '4',
        data: '2026-01-12',
        descricao: 'PIX AMIGO',
        valor: 200,
        tipo: 'credito',
        classificacao: 'ignorar',
      },
    ];

    const result = agregarRendasValidadas(itens);

    expect(result.historicoRendas).toEqual([
      { mes: '2026-01', total: 5300 },
      { mes: '2026-02', total: 4600 },
    ]);
    expect(result.salarioLiquido).toBe(4600);
    expect(result.outrasRendas).toBe(0);
  });

  test('agregar_ultimoMesComOutrasRendas_preencheCamposAtuais', () => {
    const itens: CandidatoRendaClassificado[] = [
      {
        id: '1',
        data: '2026-03-05',
        descricao: 'SALARIO',
        valor: 3000,
        tipo: 'credito',
        classificacao: 'salario',
      },
      {
        id: '2',
        data: '2026-03-15',
        descricao: 'ALUGUEL',
        valor: 700,
        tipo: 'credito',
        classificacao: 'outra_renda',
      },
    ];

    const result = agregarRendasValidadas(itens);

    expect(result.salarioLiquido).toBe(3000);
    expect(result.outrasRendas).toBe(700);
    expect(result.historicoRendas).toEqual([{ mes: '2026-03', total: 3700 }]);
  });

  test('agregar_somenteIgnorados_retornaZeros', () => {
    const itens: CandidatoRendaClassificado[] = [
      {
        id: '1',
        data: '2026-01-01',
        descricao: 'X',
        valor: 1000,
        tipo: 'credito',
        classificacao: 'ignorar',
      },
    ];

    expect(agregarRendasValidadas(itens)).toEqual({
      salarioLiquido: 0,
      outrasRendas: 0,
      historicoRendas: [],
    });
  });
});
