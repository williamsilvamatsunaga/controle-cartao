import { commitmentColor, Colors } from '@/shared/constants/theme';

describe('commitmentColor', () => {
  const light = Colors.light;

  it('retorna_sucesso_quando_percentual_ate_40', () => {
    expect(commitmentColor(0, light)).toBe(light.success);
    expect(commitmentColor(40, light)).toBe(light.success);
  });

  it('retorna_alerta_quando_percentual_entre_41_e_60', () => {
    expect(commitmentColor(41, light)).toBe(light.warning);
    expect(commitmentColor(60, light)).toBe(light.warning);
  });

  it('retorna_risco_quando_percentual_acima_de_60', () => {
    expect(commitmentColor(61, light)).toBe(light.danger);
    expect(commitmentColor(120, light)).toBe(light.danger);
  });
});
