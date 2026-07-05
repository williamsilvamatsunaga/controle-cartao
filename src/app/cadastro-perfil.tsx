import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { salvarPerfil } from '../storage/storage';

export default function CadastroPerfil() {
  const router = useRouter();
  const [salarioLiquido, setSalarioLiquido] = useState('');
  const [outrasRendas, setOutrasRendas] = useState('');
  const [deducoesMensais, setDeducoesMensais] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('');

  function converterParaNumero(texto: string): number {
    const valor = parseFloat(texto.replace(',', '.'));
    return isNaN(valor) ? 0 : valor;
  }

  async function handleSalvar() {
    const salario = converterParaNumero(salarioLiquido);
    const dia = parseInt(diaFechamento);

    if (salario <= 0) {
      Alert.alert('Atenção', 'Informe um salário líquido válido.');
      return;
    }
    if (!dia || dia < 1 || dia > 31) {
      Alert.alert('Atenção', 'Informe um dia de fechamento válido (entre 1 e 31).');
      return;
    }

    await salvarPerfil({
      salarioLiquido: salario,
      outrasRendas: converterParaNumero(outrasRendas),
      deducoesMensais: converterParaNumero(deducoesMensais),
      diaFechamento: dia,
      ultimoFechamento: null,
      historicoRendas: [],
    });

    router.replace('/nova-compra');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Text style={styles.label}>Deduções mensais (opcional)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Reserva de emergência + Investimentos"
        value={deducoesMensais}
        onChangeText={setDeducoesMensais}
      />

      <Text style={styles.label}>Dia de fechamento do cartão *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex: 2"
        value={diaFechamento}
        onChangeText={setDiaFechamento}
      />

      <View style={styles.dica}>
        <Text style={styles.dicaTexto}>
          💡 No dia do fechamento, o app vai arquivar a fatura e te pedir para confirmar o salário do próximo mês.
        </Text>
      </View>

      <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
        <Text style={styles.botaoTexto}>Salvar e continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48, paddingTop: 48 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dica: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  dicaTexto: { fontSize: 13, color: '#1d4ed8', lineHeight: 18 },
  botao: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    marginTop: 28,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});