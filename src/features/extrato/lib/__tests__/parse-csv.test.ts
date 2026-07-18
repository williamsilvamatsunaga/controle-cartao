import { parseCsvExtrato } from '../parse-csv';

describe('parseCsvExtrato', () => {
  test('parse_csvBrasileiroComCreditoDebito_extraiLancamentos', () => {
    const csv = [
      'Data;Descrição;Valor;Tipo',
      '05/01/2026;SALARIO EMPRESA XYZ;4500,00;C',
      '06/01/2026;PIX MERCADO;-89,90;D',
      '10/01/2026;FREELA PROJETO;800,00;C',
    ].join('\n');

    const result = parseCsvExtrato(csv);

    expect(result).toEqual([
      {
        data: '2026-01-05',
        descricao: 'SALARIO EMPRESA XYZ',
        valor: 4500,
        tipo: 'credito',
      },
      {
        data: '2026-01-06',
        descricao: 'PIX MERCADO',
        valor: 89.9,
        tipo: 'debito',
      },
      {
        data: '2026-01-10',
        descricao: 'FREELA PROJETO',
        valor: 800,
        tipo: 'credito',
      },
    ]);
  });

  test('parse_csvComValorNegativoComoDebito_infereTipo', () => {
    const csv = [
      'date,description,amount',
      '2026-02-01,Salary Deposit,5200.50',
      '2026-02-03,Grocery,-120.00',
    ].join('\n');

    const result = parseCsvExtrato(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      data: '2026-02-01',
      valor: 5200.5,
      tipo: 'credito',
    });
    expect(result[1]).toMatchObject({
      data: '2026-02-03',
      valor: 120,
      tipo: 'debito',
    });
  });

  test('parse_csvVazio_retornaListaVazia', () => {
    expect(parseCsvExtrato('')).toEqual([]);
  });
});
