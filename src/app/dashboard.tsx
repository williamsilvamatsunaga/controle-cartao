import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { carregarCompras, carregarPerfil, limparTudo } from '../storage/storage';
import { Compra, PerfilFinanceiro } from '../types';
import { calcularComprometimentoNoMes, calcularRendaDisponivel } from '../utils/calculos';

function gerarProximosMeses(quantidade: number): string[] {
  const meses: string[] = [];
  const hoje = new Date();
  for (let i = 0; i < quantidade; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    meses.push(`${ano}-${mes}`);
  }
  return meses;
}

function formatarMes(mesStr: string): string {
  const [ano, mes] = mesStr.split('-');
  const nomesMes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return `${nomesMes[parseInt(mes) - 1]} ${ano}`;
}

function getCorPercentual(percentual: number): string {
  if (percentual <= 40) return '#16a34a';
  if (percentual <= 60) return '#d97706';
  return '#dc2626';
}

export default function Dashboard() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilFinanceiro | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  // Recarrega os dados toda vez que a tela fica em foco
  useEffect(() => {
    const intervalo = setInterval(carregarDados, 1000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarDados() {
    const [p, c] = await Promise.all([carregarPerfil(), carregarCompras()]);
    setPerfil(p);
    setCompras(c);
    setCarregando(false);
  }

  async function handleResetar() {
    await limparTudo();
    router.replace('/cadastro-perfil');
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Perfil não encontrado.</Text>
        <TouchableOpacity onPress={() => router.replace('/cadastro-perfil')}>
          <Text style={{ color: '#2563eb', marginTop: 8 }}>Ir para cadastro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rendaDisponivel = calcularRendaDisponivel(perfil);
  const mesAtual = new Date().toISOString().slice(0, 7);
  const comprometidoAtual = calcularComprometimentoNoMes(compras, mesAtual);
  const percentualAtual = rendaDisponivel > 0
    ? (comprometidoAtual / rendaDisponivel) * 100
    : 0;
  const proximosMeses = gerarProximosMeses(6);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Meu Cartão</Text>
        <TouchableOpacity
          style={styles.botaoNova}
          onPress={() => router.push('/nova-compra')}>
          <Text style={styles.botaoNovaTexto}>+ Nova compra</Text>
        </TouchableOpacity>
      </View>

      {/* Card resumo */}
      <View style={styles.card}>
        <View style={styles.cardLinha}>
          <Text style={styles.cardLabel}>Renda disponível</Text>
          <Text style={styles.cardValor}>
            R$ {rendaDisponivel.toFixed(2)}
          </Text>
        </View>

        <View style={styles.cardLinha}>
          <Text style={styles.cardLabel}>Comprometido este mês</Text>
          <Text style={[styles.cardValor, { color: getCorPercentual(percentualAtual) }]}>
            R$ {comprometidoAtual.toFixed(2)}
          </Text>
        </View>

        {/* Barra de progresso */}
        <View style={styles.barraContainer}>
          <View
            style={[
              styles.barra,
              {
                width: `${Math.min(percentualAtual, 100)}%`,
                backgroundColor: getCorPercentual(percentualAtual),
              },
            ]}
          />
        </View>

        <Text style={[styles.percentualTexto, { color: getCorPercentual(percentualAtual) }]}>
          {percentualAtual.toFixed(1)}% da renda comprometida
        </Text>
      </View>

      {/* Calendário financeiro */}
      <Text style={styles.secaoTitulo}>Próximos meses</Text>
      <View style={styles.card}>
        {proximosMeses.map((mes, index) => {
          const valor = calcularComprometimentoNoMes(compras, mes);
          const percentual = rendaDisponivel > 0 ? (valor / rendaDisponivel) * 100 : 0;
          return (
            <View
              key={mes}
              style={[
                styles.mesLinha,
                index < proximosMeses.length - 1 && styles.mesLinhaBorda,
              ]}>
              <Text style={styles.mesNome}>{formatarMes(mes)}</Text>
              <View style={styles.mesDireita}>
                <Text style={[styles.mesValor, { color: getCorPercentual(percentual) }]}>
                  R$ {valor.toFixed(2)}
                </Text>
                <Text style={[styles.mesPercentual, { color: getCorPercentual(percentual) }]}>
                  {percentual.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Lista de compras */}
      <Text style={styles.secaoTitulo}>Compras registradas</Text>
      {compras.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.semCompras}>Nenhuma compra registrada ainda.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {compras.map((compra, index) => (
            <View
              key={compra.id}
              style={[
                styles.compraLinha,
                index < compras.length - 1 && styles.compraLinhaBorda,
              ]}>
              <View style={styles.compraEsquerda}>
                <Text style={styles.compraCategoria}>{compra.categoria}</Text>
                <Text style={styles.compraData}>
                  {compra.numeroParcelas}x de R$ {compra.parcelaMensal.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.compraValor}>
                R$ {compra.valor.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Botão resetar (temporário para testes) */}
      <TouchableOpacity style={styles.botaoResetar} onPress={handleResetar}>
        <Text style={styles.botaoResetarTexto}>Resetar dados (teste)</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: { fontSize: 24, fontWeight: 'bold' },
  botaoNova: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoNovaTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  cardLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: { fontSize: 14, color: '#555' },
  cardValor: { fontSize: 14, fontWeight: 'bold' },
  barraContainer: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 12,
  },
  barra: { height: '100%', borderRadius: 5 },
  percentualTexto: { fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  mesLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  mesLinhaBorda: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  mesNome: { fontSize: 14, color: '#333' },
  mesDireita: { alignItems: 'flex-end' },
  mesValor: { fontSize: 14, fontWeight: 'bold' },
  mesPercentual: { fontSize: 12 },
  semCompras: { color: '#999', textAlign: 'center', paddingVertical: 8 },
  compraLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  compraLinhaBorda: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  compraEsquerda: {},
  compraCategoria: { fontSize: 14, fontWeight: '600' },
  compraData: { fontSize: 12, color: '#666', marginTop: 2 },
  compraValor: { fontSize: 14, fontWeight: 'bold' },
  botaoResetar: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
    marginTop: 16,
  },
  botaoResetarTexto: { color: '#dc2626', fontSize: 14 },
});