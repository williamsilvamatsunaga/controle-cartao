import { compraFormSchema } from '../compra.schema';

describe('compraFormSchema', () => {
  test('parse_valorEParcelasValidos_sucesso', () => {
    const r = compraFormSchema.safeParse({
      valor: '2400',
      parcelas: '12',
      categoria: 'Outros',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.valor).toBe(2400);
      expect(r.data.parcelas).toBe(12);
      expect(r.data.categoria).toBe('Outros');
    }
  });

  test('parse_valorZero_erro', () => {
    const r = compraFormSchema.safeParse({
      valor: '0',
      parcelas: '1',
      categoria: 'Outros',
    });
    expect(r.success).toBe(false);
  });

  test('parse_parcelasInvalidas_erro', () => {
    const r = compraFormSchema.safeParse({
      valor: '100',
      parcelas: '0',
      categoria: 'Outros',
    });
    expect(r.success).toBe(false);
  });
});
