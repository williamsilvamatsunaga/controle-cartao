import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { adicionarCompra, carregarCompras, carregarPerfil } from '../storage/storage';
import { Categoria, ResultadoAnaliseCompra } from '../types';
import { analisarNovaCompra } from '../utils/calculos';

const CATEGORIAS: Categoria[] = [
  'Tecnologia',
  'Alimentação',
  'Vestuário',
  'Saúde',
  'Lazer',
  'Casa',
  'Outros',
];

export default function NovaCompra() {
  const router = useRouter();

  // Campos do formulário
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [categoria, setCategoria] = useState<Categoria>('Outros');
  const [dataCompra] = useState(new Date().toISOString().slice(0, 10)); // hoje

  // Resultado da análise
  const [resultado, setResultado] = useState<ResultadoAnaliseCompra | null>(null);
  const [analisando, setAnalisando] = useState(false);

  function converterNumero(texto: string): number {
    const valor = parseFloat(texto.replace(',', '.'));
    return isNaN(valor) ? 0 : valor;
  }

  async function handleAnalisar() {
    const valorNum = converterNumero(valor);
    const parcelasNum = parseInt(parcelas);

    if (valorNum <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido para a compra.');
      return;
    }
    if (parcelasNum <= 0 || isNaN(parcelasNum)) {
      Alert.alert('Atenção', 'Informe um número de parcelas válido.');
      return;
    }

    setAnalisando(true);
    try {
      const perfil = await carregarPerfil();
      const compras = await carregarCompras();

      if (!perfil) {
        Alert.alert('Erro', 'Perfil não encontrado. Recadastre seus dados.');
        router.replace('/cadastro-perfil');
        return;
      }

      const analise = analisarNovaCompra(perfil, compras, valorNum, parcelasNum, dataCompra);
      setResultado(analise);
    } finally {
      setAnalisando(false);
    }
  }

  async function handleConfirmar() {
    if (!resultado) return;

    const novaCompra = {
      id: Date.now().toString(),
      valor: converterNumero(valor),
      numeroParcelas: parseInt(parcelas),
      categoria,
      dataCompra,
      parcelaMensal: resultado.parcelaMensal,
    };

    await adicionarCompra(novaCompra);
    router.replace('/dashboard');
  }

  function getCorClassificacao() {
    if (!resultado) return '#000';
    if (resultado.classificacao === 'ok') return '#16a34a';
    if (resultado.classificacao === 'moderado') return '#d97706';
    return '#dc2626';
  }

  function getTextoClassificacao() {
    if (!resultado) return '';
    if (resultado.classificacao === 'ok') return '✓ Compra dentro do orçamento';
    if (resultado.classificacao === 'moderado') return '⚠ Atenção ao orçamento';
    return '⛔ Esta compra comprometerá grande parte da sua renda';
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Nova Compra</Text>
      <Text style={styles.subtitulo}>Registre a compra para ver o impacto na sua renda</Text>

      {/* Valor */}
      <Text style={styles.label}>Valor total da compra *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex: 2400"
        value={valor}
        onChangeText={(t) => { setValor(t); setResultado(null); }}
      />

      {/* Parcelas */}
      <Text style={styles.label}>Número de parcelas *</Text>
      <View style={styles.parcelasContainer}>
        {[1, 2, 3, 6, 10, 12, 18, 24].map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.parcelaBtn,
              parcelas === String(n) && styles.parcelaBtnSelecionado,
            ]}
            onPress={() => { setParcelas(String(n)); setResultado(null); }}>
            <Text
              style={[
                styles.parcelaBtnTexto,
                parcelas === String(n) && styles.parcelaBtnTextoSelecionado,
              ]}>
              {n}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[styles.input, { marginTop: 8 }]}
        keyboardType="numeric"
        placeholder="Ou digite outro valor (ex: 36)"
        value={[1, 2, 3, 6, 10, 12, 18, 24].includes(parseInt(parcelas)) ? '' : parcelas}
        onChangeText={(t) => { setParcelas(t); setResultado(null); }}
      />

      {/* Categoria */}
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categoriasContainer}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoriaBtn,
              categoria === cat && styles.categoriaBtnSelecionado,
            ]}
            onPress={() => setCategoria(cat)}>
            <Text
              style={[
                styles.categoriaBtnTexto,
                categoria === cat && styles.categoriaBtnTextoSelecionado,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão Analisar */}
      <TouchableOpacity
        style={[styles.botao, analisando && styles.botaoDesabilitado]}
        onPress={handleAnalisar}
        disabled={analisando}>
        <Text style={styles.botaoTexto}>
          {analisando ? 'Analisando...' : 'Analisar impacto'}
        </Text>
      </TouchableOpacity>

      {/* Resultado da análise */}
      {resultado && (
        <View style={styles.resultadoContainer}>
          <Text style={styles.resultadoTitulo}>Resultado da análise</Text>

          <View style={styles.resultadoLinha}>
            <Text style={styles.resultadoLabel}>Parcela mensal</Text>
            <Text style={styles.resultadoValor}>
              R$ {resultado.parcelaMensal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.resultadoLinha}>
            <Text style={styles.resultadoLabel}>Comprometimento atual</Text>
            <Text style={styles.resultadoValor}>
              {resultado.comprometimentoAtual.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.resultadoLinha}>
            <Text style={styles.resultadoLabel}>Comprometimento após compra</Text>
            <Text style={[styles.resultadoValor, { color: getCorClassificacao() }]}>
              {resultado.comprometimentoApos.toFixed(1)}%
            </Text>
          </View>

          {/* Barra de progresso visual */}
          <View style={styles.barraContainer}>
            <View
              style={[
                styles.barraAtual,
                { width: `${Math.min(resultado.comprometimentoAtual, 100)}%` },
              ]}
            />
            <View
              style={[
                styles.barraAdicional,
                {
                  width: `${Math.min(
                    resultado.comprometimentoApos - resultado.comprometimentoAtual,
                    100 - resultado.comprometimentoAtual
                  )}%`,
                  backgroundColor: getCorClassificacao(),
                },
              ]}
            />
          </View>
          <Text style={[styles.classificacao, { color: getCorClassificacao() }]}>
            {getTextoClassificacao()}
          </Text>

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: getCorClassificacao() }]}
            onPress={handleConfirmar}>
            <Text style={styles.botaoTexto}>Confirmar e salvar compra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={() => setResultado(null)}>
            <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  parcelasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  parcelaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  parcelaBtnSelecionado: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  parcelaBtnTexto: { fontSize: 14, color: '#333' },
  parcelaBtnTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoriaBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoriaBtnSelecionado: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  categoriaBtnTexto: { fontSize: 13, color: '#333' },
  categoriaBtnTextoSelecionado: { color: '#fff' },
  botao: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  botaoDesabilitado: { backgroundColor: '#93c5fd' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoCancelar: { padding: 16, alignItems: 'center', marginTop: 8 },
  botaoCancelarTexto: { color: '#666', fontSize: 14 },
  resultadoContainer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultadoTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  resultadoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultadoLabel: { fontSize: 14, color: '#555' },
  resultadoValor: { fontSize: 14, fontWeight: 'bold' },
  barraContainer: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 16,
  },
  barraAtual: { height: '100%', backgroundColor: '#94a3b8' },
  barraAdicional: { height: '100%' },
  classificacao: { fontSize: 15, fontWeight: 'bold', marginBottom: 16 },
});