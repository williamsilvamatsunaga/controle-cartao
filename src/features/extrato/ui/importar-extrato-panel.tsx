import * as DocumentPicker from 'expo-document-picker';
import { FileUp, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  FormatoExtratoNaoSuportadoError,
  lerEParsearExtrato,
} from '../lib/ler-arquivo';
import {
  criarRevisoesIniciais,
  montarResultadoImportacao,
  type RevisaoLancamento,
} from '../lib/montar-importacao';
import type {
  NaturezaLancamento,
  ResultadoImportacaoExtrato,
} from '../types';

const LIMIAR_CREDITO_REVISAO = 500;

type ArquivoCarregado = {
  nome: string;
  qtdLancamentos: number;
};

type Props = {
  onAplicar: (resultado: ResultadoImportacaoExtrato) => void | Promise<void>;
  onCancelar: () => void;
  /** Texto do botão final (cadastro vs dashboard). */
  labelConfirmar?: string;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function ImportarExtratoPanel({
  onAplicar,
  onCancelar,
  labelConfirmar = 'Usar estes valores',
}: Props) {
  const [arquivos, setArquivos] = useState<ArquivoCarregado[]>([]);
  const [revisoes, setRevisoes] = useState<RevisaoLancamento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const resultado = useMemo(() => montarResultadoImportacao(revisoes), [revisoes]);

  const paraRevisar = useMemo(() => {
    return revisoes.filter((r) => {
      if (r.tipo === 'credito' && r.valor >= LIMIAR_CREDITO_REVISAO) return true;
      if (r.tipo === 'debito' && (r.natureza === 'cartao' || r.valor >= LIMIAR_CREDITO_REVISAO)) {
        return true;
      }
      return false;
    });
  }, [revisoes]);

  const temRenda = revisoes.some((r) => r.natureza === 'renda' && r.tipoRenda);

  async function handleEscolherArquivos() {
    setErro('');
    setCarregando(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/plain',
          'text/comma-separated-values',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/x-ofx',
          'application/ofx',
          'application/octet-stream',
          '*/*',
        ],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        setCarregando(false);
        return;
      }

      const novosArquivos: ArquivoCarregado[] = [];
      const novasRevisoes: RevisaoLancamento[] = [];
      const avisos: string[] = [];

      for (const asset of result.assets) {
        try {
          const { lancamentos } = await lerEParsearExtrato({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType,
            file: asset.file,
          });
          if (lancamentos.length === 0) {
            avisos.push(`${asset.name}: nenhum lançamento reconhecido.`);
            continue;
          }
          novosArquivos.push({
            nome: asset.name,
            qtdLancamentos: lancamentos.length,
          });
          novasRevisoes.push(...criarRevisoesIniciais(lancamentos, asset.name));
        } catch (e) {
          const msg =
            e instanceof FormatoExtratoNaoSuportadoError
              ? e.message
              : `Falha ao ler ${asset.name}.`;
          avisos.push(msg);
        }
      }

      if (novasRevisoes.length === 0) {
        setErro(
          avisos[0] ??
            'Nenhum lançamento encontrado. Use CSV, OFX ou Excel exportado pelo banco.'
        );
        setCarregando(false);
        return;
      }

      setArquivos((prev) => [...prev, ...novosArquivos]);
      setRevisoes((prev) => mesclarRevisoes(prev, novasRevisoes));
      if (avisos.length > 0) setErro(avisos.join('\n'));
    } catch {
      setErro('Não foi possível abrir o seletor de arquivos.');
    } finally {
      setCarregando(false);
    }
  }

  function setNatureza(id: string, natureza: NaturezaLancamento) {
    setRevisoes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (natureza === 'renda') {
          return { ...r, natureza, tipoRenda: r.tipoRenda ?? 'salario' };
        }
        return { ...r, natureza, tipoRenda: undefined };
      })
    );
  }

  function setTipoRenda(id: string, tipoRenda: 'salario' | 'outra_renda') {
    setRevisoes((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, natureza: 'renda' as const, tipoRenda } : r
      )
    );
  }

  function limparTudo() {
    setArquivos([]);
    setRevisoes([]);
    setErro('');
  }

  async function handleAplicar() {
    if (revisoes.length === 0) {
      setErro('Importe ao menos um extrato.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await onAplicar(resultado);
    } catch {
      setErro('Não foi possível salvar a importação.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.tituloSecao}>Importar extratos</Text>
      <Text style={styles.ajuda}>
        Envie um ou mais extratos (CSV, OFX ou Excel), de um ou vários meses.
        Entradas e saídas alimentam o fluxo do mês; débitos de cartão entram no
        comprometimento junto com as parcelas.
      </Text>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={handleEscolherArquivos}
        disabled={carregando}>
        {carregando ? (
          <ActivityIndicator color="#0F766E" />
        ) : (
          <>
            <FileUp size={18} color="#0F766E" strokeWidth={2} />
            <Text style={styles.botaoSecundarioTexto}>
              {arquivos.length > 0 ? 'Adicionar mais extratos' : 'Escolher arquivos'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {arquivos.length > 0 && (
        <View style={styles.listaArquivos}>
          {arquivos.map((a, i) => (
            <Text key={`${a.nome}-${i}`} style={styles.arquivoItem}>
              {a.nome} · {a.qtdLancamentos} lançamentos
            </Text>
          ))}
          <Text style={styles.meta}>
            {revisoes.length} lançamentos no total · revise os destacados abaixo
          </Text>
          <TouchableOpacity style={styles.limpar} onPress={limparTudo}>
            <Trash2 size={14} color="#dc2626" />
            <Text style={styles.limparTexto}>Limpar importação</Text>
          </TouchableOpacity>
        </View>
      )}

      {paraRevisar.length > 0 && (
        <>
          <Text style={styles.labelLista}>Revise créditos altos e cartão</Text>
          <ScrollView style={styles.listaCandidatos} nestedScrollEnabled>
            {paraRevisar.map((c) => (
              <View key={c.id} style={styles.card}>
                <View style={styles.cardTopo}>
                  <Text style={styles.cardValor}>{formatarMoeda(c.valor)}</Text>
                  <Text style={styles.cardData}>
                    {formatarData(c.data)} · {c.tipo === 'credito' ? 'entrada' : 'saída'}
                  </Text>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {c.descricao}
                </Text>

                {c.tipo === 'credito' ? (
                  <View style={styles.chips}>
                    {(
                      [
                        ['salario', 'Salário'],
                        ['outra_renda', 'Outra renda'],
                        ['outro', 'Só fluxo'],
                      ] as const
                    ).map(([valor, label]) => {
                      const ativo =
                        valor === 'outro'
                          ? c.natureza === 'outro'
                          : c.natureza === 'renda' && c.tipoRenda === valor;
                      return (
                        <TouchableOpacity
                          key={valor}
                          style={[
                            styles.chip,
                            ativo &&
                              (valor === 'salario'
                                ? styles.chipSalario
                                : valor === 'outra_renda'
                                  ? styles.chipOutra
                                  : styles.chipIgnorar),
                          ]}
                          onPress={() => {
                            if (valor === 'outro') setNatureza(c.id, 'outro');
                            else setTipoRenda(c.id, valor);
                          }}>
                          <Text
                            style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.chips}>
                    {(
                      [
                        ['cartao', 'Cartão (comprometimento)'],
                        ['outro', 'Só fluxo'],
                      ] as const
                    ).map(([valor, label]) => {
                      const ativo = c.natureza === valor;
                      return (
                        <TouchableOpacity
                          key={valor}
                          style={[
                            styles.chip,
                            ativo &&
                              (valor === 'cartao' ? styles.chipCartao : styles.chipIgnorar),
                          ]}
                          onPress={() => setNatureza(c.id, valor)}>
                          <Text
                            style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.resumoBox}>
            <Text style={styles.resumoTitulo}>Resumo da importação</Text>
            <Text style={styles.resumoLinha}>
              Lançamentos a salvar: {resultado.lancamentos.length}
            </Text>
            <Text style={styles.resumoLinha}>
              Renda (mês recente): {formatarMoeda(resultado.renda.salarioLiquido)}
              {resultado.renda.outrasRendas > 0
                ? ` + ${formatarMoeda(resultado.renda.outrasRendas)}`
                : ''}
            </Text>
            <Text style={styles.resumoLinha}>
              Meses de renda: {resultado.renda.historicoRendas.length}
            </Text>
            {!temRenda && (
              <Text style={styles.resumoAviso}>
                Sem salário marcado — o fluxo ainda será salvo; a renda do perfil
                não muda.
              </Text>
            )}
          </View>
        </>
      )}

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <View style={styles.acoes}>
        <TouchableOpacity style={styles.linkCancelar} onPress={onCancelar}>
          <Text style={styles.linkCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botaoAplicar, revisoes.length === 0 && styles.botaoDisabled]}
          onPress={handleAplicar}
          disabled={revisoes.length === 0 || salvando}>
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoAplicarTexto}>{labelConfirmar}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function mesclarRevisoes(
  existentes: RevisaoLancamento[],
  novos: RevisaoLancamento[]
): RevisaoLancamento[] {
  const mapa = new Map<string, RevisaoLancamento>();
  const chave = (r: RevisaoLancamento) =>
    `${r.data}|${r.descricao}|${r.valor}|${r.tipo}`;
  for (const r of existentes) mapa.set(chave(r), r);
  for (const n of novos) {
    const k = chave(n);
    if (!mapa.has(k)) mapa.set(k, n);
  }
  return [...mapa.values()].sort((a, b) => a.data.localeCompare(b.data));
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  tituloSecao: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  ajuda: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  botaoSecundario: {
    borderWidth: 1.5,
    borderColor: '#0F766E',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
  },
  botaoSecundarioTexto: { color: '#0F766E', fontWeight: '700', fontSize: 15 },
  listaArquivos: { marginTop: 12, gap: 4 },
  arquivoItem: { fontSize: 12, color: '#334155' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  limpar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  limparTexto: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  labelLista: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  listaCandidatos: { maxHeight: 360 },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardValor: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardData: { fontSize: 12, color: '#64748b' },
  cardDesc: { fontSize: 13, color: '#475569', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSalario: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipOutra: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  chipCartao: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipIgnorar: { backgroundColor: '#64748b', borderColor: '#64748b' },
  chipTexto: { fontSize: 12, fontWeight: '600', color: '#334155' },
  chipTextoAtivo: { color: '#fff' },
  resumoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resumoTitulo: { fontWeight: '700', marginBottom: 4, fontSize: 13 },
  resumoLinha: { fontSize: 13, color: '#334155', marginTop: 2 },
  resumoAviso: { fontSize: 12, color: '#b45309', marginTop: 6, lineHeight: 16 },
  erro: { color: '#dc2626', fontSize: 13, marginTop: 10, lineHeight: 18 },
  acoes: { marginTop: 16, gap: 10 },
  linkCancelar: { alignItems: 'center', padding: 8 },
  linkCancelarTexto: { color: '#64748b', fontSize: 14 },
  botaoAplicar: {
    backgroundColor: '#0F766E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoDisabled: { opacity: 0.45 },
  botaoAplicarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
