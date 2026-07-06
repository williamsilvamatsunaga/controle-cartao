import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { salvarPerfil } from '../storage/storage';

export default function CadastroPerfil() {
  const router = useRouter();

  const [salarioLiquido, setSalarioLiquido] = useState('');
  const [outrasRendas, setOutrasRendas] = useState('');
  const [deducoesMensais, setDeducoesMensais] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarAviso, setMostrarAviso] = useState(false);

  function converterParaNumero(texto: string): number {
    const valor = parseFloat(texto.replace(',', '.'));
    return isNaN(valor) ? 0 : valor;
  }

  async function handleSalvar() {
    const salario = converterParaNumero(salarioLiquido);
    const dia = parseInt(diaFechamento);

    if (salario <= 0) {
      setErro('Informe um salário líquido válido.');
      return;
    }
    if (!dia || dia < 1 || dia > 31) {
      setErro('Informe um dia de fechamento válido (entre 1 e 31).');
      return;
    }

    const hoje = new Date().toISOString().slice(0, 10);

    await salvarPerfil({
      salarioLiquido: salario,
      outrasRendas: converterParaNumero(outrasRendas),
      deducoesMensais: converterParaNumero(deducoesMensais),
      diaFechamento: dia,
      ultimoFechamento: hoje,
      historicoRendas: [],
    });

    setMostrarAviso(true);
  }

  if (mostrarAviso) {
    return (
      <View style={styles.avisoContainer}>
        <Text style={styles.avisoEmoji}>🎉</Text>
        <Text style={styles.avisoTitulo}>Perfil salvo!</Text>
        <Text style={styles.avisoTexto}>
          Caso já tenha feito alguma compra após o fechamento da sua última fatura,
          adicione-a em "Nova Compra" assim que entrar no app.
        </Text>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.replace('/dashboard')}>
          <Text style={styles.botaoTexto}>Entendi, ir para o app →</Text>
        </TouchableOpacity>
      </View>
    );
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
        onChangeText={(t) => { setSalarioLiquido(t); setErro(''); }}
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
        onChangeText={(t) => { setDiaFechamento(t); setErro(''); }}
      />

      {erro !== '' && (
        <Text style={styles.erroTexto}>{erro}</Text>
      )}

      <View style={styles.dica}>
        <Text style={styles.dicaTexto}>
          💡 No dia do fechamento, o app vai arquivar a fatura e te pedir para
          confirmar o salário do próximo mês.
        </Text>
      </View>

      <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
        <Text style={styles.botaoTexto}>Salvar e continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    paddingTop: 48,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  erroTexto: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 8,
  },
  dica: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  dicaTexto: {
    fontSize: 13,
    color: '#1d4ed8',
    lineHeight: 18,
  },
  botao: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    marginTop: 28,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avisoContainer: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisoEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  avisoTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  avisoTexto: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});