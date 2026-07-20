import { sugerirNatureza } from '../classificar-natureza';
import type { LancamentoExtrato } from '../../types';

function L(
  partial: Partial<LancamentoExtrato> & Pick<LancamentoExtrato, 'descricao' | 'tipo'>
): LancamentoExtrato {
  return {
    data: '2026-01-10',
    valor: 100,
    ...partial,
  };
}

describe('sugerirNatureza', () => {
  test('sugerir_debitoFaturaCartao_retornaCartao', () => {
    expect(
      sugerirNatureza(L({ descricao: 'PAGAMENTO FATURA CARTAO NUBANK', tipo: 'debito', valor: 1200 }))
    ).toBe('cartao');
  });

  test('sugerir_debitoVisaMaster_retornaCartao', () => {
    expect(sugerirNatureza(L({ descricao: 'VISA ELECTRON COMPRA', tipo: 'debito' }))).toBe(
      'cartao'
    );
    expect(sugerirNatureza(L({ descricao: 'MASTERCARD 1234', tipo: 'debito' }))).toBe('cartao');
  });

  test('sugerir_creditoSalario_retornaRenda', () => {
    expect(
      sugerirNatureza(L({ descricao: 'SALARIO EMPRESA XYZ', tipo: 'credito', valor: 4500 }))
    ).toBe('renda');
  });

  test('sugerir_debitoPix_retornaOutro', () => {
    expect(sugerirNatureza(L({ descricao: 'PIX MERCADO LIVRE', tipo: 'debito' }))).toBe('outro');
  });

  test('sugerir_creditoPixPequeno_retornaOutro', () => {
    expect(
      sugerirNatureza(L({ descricao: 'PIX RECEBIDO JOAO', tipo: 'credito', valor: 50 }))
    ).toBe('outro');
  });
});
