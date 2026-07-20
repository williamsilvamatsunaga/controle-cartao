import { detectarFormatoExtrato } from '../parse-arquivo';

describe('detectarFormatoExtrato', () => {
  test('detectar_extensoesConhecidas_retornaFormato', () => {
    expect(detectarFormatoExtrato('extrato.csv')).toBe('csv');
    expect(detectarFormatoExtrato('extrato.ofx')).toBe('ofx');
    expect(detectarFormatoExtrato('extrato.xlsx')).toBe('xlsx');
    expect(detectarFormatoExtrato('extrato.xls')).toBe('xlsx');
  });

  test('detectar_pdf_retornaDesconhecido', () => {
    expect(detectarFormatoExtrato('fatura.pdf', 'application/pdf')).toBe(
      'desconhecido'
    );
  });
});
