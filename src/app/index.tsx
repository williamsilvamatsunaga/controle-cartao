import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { carregarPerfil } from '../storage/storage';

export default function Index() {
  const [carregando, setCarregando] = useState(true);
  const [temPerfil, setTemPerfil] = useState(false);

  useEffect(() => {
    async function verificarPerfil() {
      const perfil = await carregarPerfil();
      setTemPerfil(perfil !== null);
      setCarregando(false);
    }
    verificarPerfil();
  }, []);

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return temPerfil
    ? <Redirect href="/dashboard" />
    : <Redirect href="/cadastro-perfil" />;
}