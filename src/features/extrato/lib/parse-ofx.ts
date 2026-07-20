import type { LancamentoExtrato, TipoLancamento } from '../types';

function tagValue(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
  const m = re.exec(block);
  return m ? m[1].trim() : null;
}

function parseDataOfx(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function inferirTipo(trnType: string | null, amount: number): TipoLancamento {
  const t = (trnType ?? '').toUpperCase();
  if (t.includes('CREDIT') || t === 'DEP' || t === 'DIRECTDEP') return 'credito';
  if (t.includes('DEBIT') || t === 'ATM' || t === 'POS') return 'debito';
  return amount >= 0 ? 'credito' : 'debito';
}

export function parseOfxExtrato(conteudo: string): LancamentoExtrato[] {
  const blocks = conteudo.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi) ?? [];
  const result: LancamentoExtrato[] = [];

  for (const block of blocks) {
    const amountRaw = tagValue(block, 'TRNAMT');
    const dateRaw = tagValue(block, 'DTPOSTED');
    const memo = tagValue(block, 'MEMO') ?? tagValue(block, 'NAME') ?? '';
    if (!amountRaw || !dateRaw || !memo) continue;

    const amount = Number(amountRaw.replace(',', '.'));
    if (!Number.isFinite(amount)) continue;

    const data = parseDataOfx(dateRaw);
    if (!data) continue;

    const trnType = tagValue(block, 'TRNTYPE');
    const tipo = inferirTipo(trnType, amount);

    result.push({
      data,
      descricao: memo,
      valor: Math.abs(amount),
      tipo,
    });
  }

  return result;
}
