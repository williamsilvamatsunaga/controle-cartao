import type { TipoMovimento } from '../types';

const RECEBIMENTO =
  /\b(recebeu|recebida|recebido|dep[oó]sito|pix recebido|transfer[eê]ncia recebida|entrou na sua conta)\b/i;
const GASTO =
  /\b(compra|pagamento|pagou|aprovada|aprovado|d[eé]bito|cobran[cç]a|sa[ií]da)\b/i;
const IGNORAR =
  /\b(lembrete|fatura fech|login|acesso|oferta|promo[cç][aã]o|cashback dispon|abriu o app)\b/i;

export function classificarMovimento(texto: string): TipoMovimento {
  if (IGNORAR.test(texto)) return 'ignorado';
  if (RECEBIMENTO.test(texto)) return 'recebimento';
  if (GASTO.test(texto)) return 'gasto';
  return 'ignorado';
}
