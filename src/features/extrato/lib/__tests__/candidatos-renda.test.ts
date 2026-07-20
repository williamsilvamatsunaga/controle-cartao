import { detectarCandidatosRenda } from '../candidatos-renda';
import type { LancamentoExtrato } from '../../types';

describe('detectarCandidatosRenda', () => {
  const lancamentos: LancamentoExtrato[] = [
    { data: '2026-01-05', descricao: 'SALARIO', valor: 4500, tipo: 'credito' },
    { data: '2026-01-06', descricao: 'PIX VOLTA', valor: 50, tipo: 'credito' },
    { data: '2026-01-07', descricao: 'FREELA', valor: 1200, tipo: 'credito' },
    { data: '2026-01-08', descricao: 'MERCADO', valor: 200, tipo: 'debito' },
    { data: '2026-02-05', descricao: 'SALARIO', valor: 4500, tipo: 'credito' },
  ];

  test('detectar_creditosAcimaDoLimite_retornaCandidatos', () => {
    const candidatos = detectarCandidatosRenda(lancamentos, { limiarMinimo: 500 });

    expect(candidatos).toHaveLength(3);
    expect(candidatos.map((c) => c.descricao)).toEqual(['SALARIO', 'FREELA', 'SALARIO']);
  });

  test('detectar_semCreditosAltos_retornaVazio', () => {
    const pequenos: LancamentoExtrato[] = [
      { data: '2026-01-01', descricao: 'PIX', valor: 30, tipo: 'credito' },
    ];
    expect(detectarCandidatosRenda(pequenos, { limiarMinimo: 500 })).toEqual([]);
  });
});
