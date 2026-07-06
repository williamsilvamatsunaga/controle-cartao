import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { marcarPrimeiraVezConcluida } from '../storage/storage';

export default function BemVindo() {
  const router = useRouter();

  async function handleContinuar() {
    await marcarPrimeiraVezConcluida();
    router.replace('/cadastro-perfil');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>💳</Text>
      <Text style={styles.titulo}>Seja bem-vindo!</Text>
      <Text style={styles.subtitulo}>Antes de começar, uma dica valiosa:</Text>

      <View style={styles.card}>
        <Text style={styles.cardTexto}>
          Ao receber seu salário, transfira o valor para uma conta que rende automaticamente —
          como um CDB de liquidez diária ou uma conta remunerada. Assim, seu dinheiro trabalha
          por você durante todo o mês enquanto você usa o cartão de crédito. 📈
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTexto}>
          Se você está no <Text style={styles.destaque}>"loop do cartão"</Text> — usando
          o crédito para cobrir o mês porque o salário já foi — não se preocupe.
          A saída é gradual: com disciplina e acompanhamento, você reserva um valor por mês
          até ter o suficiente para quitar a fatura e recomeçar com o pé direito. 💪
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTexto}>
          Este aplicativo vai te mostrar, em tempo real, quanto da sua renda está comprometida
          com o cartão — mês a mês, parcela a parcela. O objetivo não é cortar o crédito,
          mas usá-lo de forma <Text style={styles.destaque}>consciente e estratégica</Text>. 🎯
        </Text>
      </View>

      <TouchableOpacity style={styles.botao} onPress={handleContinuar}>
        <Text style={styles.botaoTexto}>Entendi, vamos começar →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, paddingBottom: 48, paddingTop: 60 },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  titulo: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitulo: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: 16,
    marginBottom: 14,
  },
  cardTexto: { fontSize: 15, color: '#0c4a6e', lineHeight: 22 },
  destaque: { fontWeight: 'bold', color: '#0369a1' },
  botao: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});