import { perfilFormSchema } from '../perfil.schema';

describe('perfilFormSchema', () => {
  test('parse_salarioValido_sucesso', () => {
    const r = perfilFormSchema.safeParse({
      salarioLiquido: '3500',
      outrasRendas: '',
      deducoesMensais: '',
      diaFechamento: '2',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.salarioLiquido).toBe(3500);
      expect(r.data.outrasRendas).toBe(0);
      expect(r.data.diaFechamento).toBe(2);
    }
  });

  test('parse_salarioZero_erro', () => {
    const r = perfilFormSchema.safeParse({
      salarioLiquido: '0',
      outrasRendas: '',
      deducoesMensais: '',
      diaFechamento: '2',
    });
    expect(r.success).toBe(false);
  });

  test('parse_dia32_erro', () => {
    const r = perfilFormSchema.safeParse({
      salarioLiquido: '1000',
      outrasRendas: '',
      deducoesMensais: '',
      diaFechamento: '32',
    });
    expect(r.success).toBe(false);
  });
});
