import { extrairValorMonetario } from '../extrair-valor';

describe('extrairValorMonetario', () => {
  it('extrai_valor_com_centavos_resultado_numero', () => {
    expect(extrairValorMonetario('Compra de R$ 49,90 aprovada')).toBe(49.9);
  });

  it('extrai_valor_com_milhar_resultado_numero', () => {
    expect(extrairValorMonetario('Pagamento de R$ 1.250,00')).toBe(1250);
  });

  it('sem_valor_retorna_null', () => {
    expect(extrairValorMonetario('Lembrete de fatura')).toBeNull();
  });
});
