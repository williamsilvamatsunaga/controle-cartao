import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { carregarPerfil, verificarPrimeiraVez } from '../storage/storage';

export default function Index() {
  const [carregando, setCarregando] = useState(true);
  const [destino, setDestino] = useState<'bem-vindo' | 'cadastro-perfil' | 'dashboard'>('dashboard');

  useEffect(() => {
    async function verificar() {
      const primeiraVez = await verificarPrimeiraVez();
      if (primeiraVez) {
        setDestino('bem-vindo');
      } else {
        const perfil = await carregarPerfil();
        setDestino(perfil ? 'dashboard' : 'cadastro-perfil');
      }
      setCarregando(false);
    }
    verificar();
  }, []);

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Redirect href={`/${destino}`} />;
}