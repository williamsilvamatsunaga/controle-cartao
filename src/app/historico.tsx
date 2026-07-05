import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { carregarHistorico } from '../storage/storage';
import { FaturaHistorico } from '../types';

function formatarMes(mesStr: string): string {
  const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const [ano, mes] = mesStr.split('-');
  return `${nomes[parseInt(mes) - 1]} ${ano}`;
}

function getCorPercentual(p: number): string {
  if (p <= 40) return '#16a34a';
  if (p <= 60) return '#d97706';
  return '#dc2626';
}

export default function Historico() {
  const router = useRouter();
  const [historico, setHistorico] = useState<FaturaHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    carregarHistorico().then(h => {
      setHistorico([...h].reverse()); // mais recente primeiro
      setCarregando(false);
    });
  }, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Histórico de Faturas</Text>
      </View>

      {historico.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhuma fatura fechada ainda.</Text>
          <Text style={styles.vazioSubtexto}>
            As faturas aparecem aqui após o fechamento mensal.
          </Text>
        </View>
      ) : (
        historico.map((fatura) => (
          <View key={fatura.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setExpandido(expandido === fatura.id ? null : fatura.id)}>
              <View>
                <Text style={styles.cardMes}>{formatarMes(fatura.mes)}</Text>
                <Text style={styles.cardFechamento}>
                  Fechada em {new Date(fatura.fechadaEm).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.cardDireita}>
                <Text style={[styles.cardPercentual, { color: getCorPercentual(fatura.percentualComprometido) }]}>
                  {fatura.percentualComprometido.toFixed(1)}%
                </Text>
                <Text style={styles.cardValorTotal}>
                  R$ {fatura.totalComprometido.toFixed(2)}
                </Text>
                <Text style={styles.expandirTexto}>{expandido === fatura.id ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>

            {expandido === fatura.id && (
              <View style={styles.cardDetalhes}>
                <View style={styles.detalheLinha}>
                  <Text style={styles.detalheLabel}>Renda disponível</Text>
                  <Text style={styles.detalheValor}>R$ {fatura.rendaDisponivel.toFixed(2)}</Text>
                </View>
                <View style={styles.detalheLinha}>
                  <Text style={styles.detalheLabel}>Total comprometido</Text>
                  <Text style={[styles.detalheValor, { color: getCorPercentual(fatura.percentualComprometido) }]}>
                    R$ {fatura.totalComprometido.toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.comprasTitulo}>Compras desta fatura</Text>
                {fatura.compras.length === 0 ? (
                  <Text style={styles.semCompras}>Nenhuma compra nesta fatura.</Text>
                ) : (
                  fatura.compras.map((compra) => (
                    <View key={compra.id} style={styles.compraItem}>
                      <Text style={styles.compraCategoria}>{compra.categoria}</Text>
                      <Text style={styles.compraParcela}>
                        {compra.numeroParcelas}x · R$ {compra.parcelaMensal.toFixed(2)}/mês
                      </Text>
                      <Text style={styles.compraValor}>R$ {compra.valor.toFixed(2)}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 24 },
  voltar: { color: '#2563eb', fontSize: 14, marginBottom: 8 },
  titulo: { fontSize: 24, fontWeight: 'bold' },
  vazio: { alignItems: 'center', marginTop: 60 },
  vazioTexto: { fontSize: 16, fontWeight: '600', color: '#555' },
  vazioSubtexto: { fontSize: 13, color: '#999', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1,
    borderColor: '#e2e8f0', marginBottom: 12, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  cardMes: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  cardFechamento: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  cardDireita: { alignItems: 'flex-end' },
  cardPercentual: { fontSize: 18, fontWeight: 'bold' },
  cardValorTotal: { fontSize: 13, color: '#555' },
  expandirTexto: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  cardDetalhes: {
    borderTopWidth: 1, borderTopColor: '#e2e8f0', padding: 16,
  },
  detalheLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detalheLabel: { fontSize: 14, color: '#555' },
  detalheValor: { fontSize: 14, fontWeight: 'bold' },
  comprasTitulo: { fontSize: 13, fontWeight: '600', color: '#555', marginTop: 12, marginBottom: 8 },
  semCompras: { fontSize: 13, color: '#999' },
  compraItem: {
    backgroundColor: '#fff', borderRadius: 8, padding: 10,
    marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0',
  },
  compraCategoria: { fontSize: 13, fontWeight: '600', color: '#333' },
  compraParcela: { fontSize: 12, color: '#666', marginTop: 2 },
  compraValor: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', marginTop: 2 },
});