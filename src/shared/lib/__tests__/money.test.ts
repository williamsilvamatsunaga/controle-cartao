import { parseMoneyInput } from '../money';

describe('parseMoneyInput', () => {
  test('parse_virgula_converteParaNumero', () => {
    expect(parseMoneyInput('3500,50')).toBe(3500.5);
  });

  test('parse_vazio_retornaNaN', () => {
    expect(Number.isNaN(parseMoneyInput(''))).toBe(true);
  });

  test('parse_invalido_retornaNaN', () => {
    expect(Number.isNaN(parseMoneyInput('abc'))).toBe(true);
  });
});
