import { PACKAGES_BANCARIOS } from '../data/instituicoes';
import type { MovimentoCapturado, NotificacaoBruta } from '../types';
import { classificarMovimento } from './classificar-movimento';
import { extrairValorMonetario } from './extrair-valor';

export function textoNotificacao(n: NotificacaoBruta): string {
  return [n.title, n.text, n.bigText].filter(Boolean).join(' ');
}

export function montarRawKey(n: NotificacaoBruta): string {
  return `${n.packageName}|${n.title ?? ''}|${n.text ?? ''}|${n.postTime}`;
}

/** Retorna null se não for movimento financeiro enfileirável. */
export function parseNotificacaoBancaria(
  n: NotificacaoBruta,
): Omit<MovimentoCapturado, 'id' | 'status'> | null {
  const instituicao = PACKAGES_BANCARIOS[n.packageName];
  if (!instituicao) return null;

  const texto = textoNotificacao(n);
  const tipo = classificarMovimento(texto);
  if (tipo === 'ignorado') return null;

  const valor = extrairValorMonetario(texto);
  if (valor == null || valor <= 0) return null;

  const descricao =
    (n.text ?? n.bigText ?? n.title ?? 'Movimento bancário').trim() ||
    'Movimento bancário';

  return {
    instituicao,
    tipo,
    valor,
    descricao,
    rawKey: montarRawKey(n),
    capturadoEm: new Date(n.postTime || Date.now()).toISOString(),
  };
}
