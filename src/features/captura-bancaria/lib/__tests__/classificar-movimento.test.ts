import { classificarMovimento } from '../classificar-movimento';

describe('classificarMovimento', () => {
  it('compra_aprovada_classifica_gasto', () => {
    expect(classificarMovimento('Compra de R$ 10,00 em Mercado aprovada')).toBe(
      'gasto',
    );
  });

  it('pix_recebido_classifica_recebimento', () => {
    expect(classificarMovimento('Pix de R$ 100,00 recebido')).toBe(
      'recebimento',
    );
  });

  it('lembrete_classifica_ignorado', () => {
    expect(classificarMovimento('Lembrete: sua fatura fecha amanhã')).toBe(
      'ignorado',
    );
  });
});
