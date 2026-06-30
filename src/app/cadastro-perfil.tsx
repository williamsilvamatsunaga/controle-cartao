import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { salvarPerfil } from '../storage/storage';

export default function CadastroPerfil() {
  const router = useRouter();

  const [salarioLiquido, setSalarioLiquido] = useState('');
  const [outrasRendas, setOutrasRendas] = useState('');
  const [reservaEmergencia, setReservaEmergencia] = useState('');
  const [investimentos, setInvestimentos] = useState('');

  function converterParaNumero(texto: string): number {
    const valor = parseFloat(texto.replace(',', '.'));
    return isNaN(valor) ? 0 : valor;
  }

  async function handleSalvar() {
    const salario = converterParaNumero(salarioLiquido);

    if (salario <= 0) {
      Alert.alert('Atenção', 'Informe um salário líquido válido.');
      return;
    }

    await salvarPerfil({
      salarioLiquido: salario,
      outrasRendas: converterParaNumero(outrasRendas),
      reservaEmergencia: converterParaNumero(reservaEmergencia),
      investimentos: converterParaNumero(investimentos),
    });

    router.replace('/nova-compra');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Vamos começar</Text>
      <Text style={styles.subtitulo}>Conte um pouco sobre sua renda mensal</Text>

      <Text style={styles.label}>Salário líquido mensal *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex: 3500"
        value={salarioLiquido}
        onChangeText={setSalarioLiquido}
      />

      <Text style={styles.label}>Outras rendas (opcional)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex: 500"
        value={outrasRendas}
        onChangeText={setOutrasRendas}
      />

      <Text style={styles.label}>Valor destinado à reserva de emergência</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex: 500"
        value={reservaEmergencia}
        onChangeText={setReservaEmergencia}
      />

      <Text style={styles.label}>Valor destinado a investimentos</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex: 200"
        value={investimentos}
        onChangeText={setInvestimentos}
      />

      <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
        <Text style={styles.botaoTexto}>Salvar e continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});