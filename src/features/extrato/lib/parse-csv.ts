import type { LancamentoExtrato, TipoLancamento } from '../types';

function detectarSeparador(linha: string): string {
  const pontosVirgula = (linha.match(/;/g) ?? []).length;
  const virgulas = (linha.match(/,/g) ?? []).length;
  return pontosVirgula >= virgulas ? ';' : ',';
}

function limparCelula(valor: string): string {
  return valor.trim().replace(/^["']|["']$/g, '');
}

function parseDataBrOuIso(raw: string): string | null {
  const v = limparCelula(raw);
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return null;
}

function parseValorMonetario(raw: string): number | null {
  let v = limparCelula(raw).replace(/R\$\s?/i, '').replace(/\s/g, '');
  if (!v) return null;

  if (v.includes(',') && v.includes('.')) {
    v = v.replace(/\./g, '').replace(',', '.');
  } else if (v.includes(',')) {
    v = v.replace(',', '.');
  }

  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapearIndiceColuna(headers: string[]): {
  data: number;
  descricao: number;
  valor: number;
  tipo: number | null;
} | null {
  const norm = headers.map((h) =>
    limparCelula(h)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
  );

  const find = (...aliases: string[]) =>
    norm.findIndex((h) => aliases.some((a) => h.includes(a)));

  const data = find('data', 'date', 'dt');
  const descricao = find('descricao', 'descri', 'memo', 'historico', 'description', 'titulo');
  const valor = find('valor', 'amount', 'montante', 'value');
  const tipo = find('tipo', 'type', 'natureza', 'dc', 'c/d');

  if (data < 0 || descricao < 0 || valor < 0) return null;
  return { data, descricao, valor, tipo: tipo >= 0 ? tipo : null };
}

function inferirTipo(rawTipo: string | undefined, valorAssinado: number): TipoLancamento {
  if (rawTipo) {
    const t = rawTipo.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    if (
      t === 'c' ||
      t === 'credito' ||
      t === 'credit' ||
      t.includes('cred') ||
      t === 'entrada'
    ) {
      return 'credito';
    }
    if (
      t === 'd' ||
      t === 'debito' ||
      t === 'debit' ||
      t.includes('deb') ||
      t === 'saida'
    ) {
      return 'debito';
    }
  }
  return valorAssinado >= 0 ? 'credito' : 'debito';
}

export function parseCsvExtrato(conteudo: string): LancamentoExtrato[] {
  const texto = conteudo.replace(/^\uFEFF/, '').trim();
  if (!texto) return [];

  const linhas = texto.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (linhas.length < 2) return [];

  const sep = detectarSeparador(linhas[0]);
  const headers = linhas[0].split(sep);
  const cols = mapearIndiceColuna(headers);
  if (!cols) return [];

  const result: LancamentoExtrato[] = [];

  for (let i = 1; i < linhas.length; i++) {
    const cells = linhas[i].split(sep);
    const data = parseDataBrOuIso(cells[cols.data] ?? '');
    const valorAssinado = parseValorMonetario(cells[cols.valor] ?? '');
    const descricao = limparCelula(cells[cols.descricao] ?? '');
    if (!data || valorAssinado === null || !descricao) continue;

    const rawTipo = cols.tipo != null ? cells[cols.tipo] : undefined;
    const tipo = inferirTipo(rawTipo, valorAssinado);

    result.push({
      data,
      descricao,
      valor: Math.abs(valorAssinado),
      tipo,
    });
  }

  return result;
}
