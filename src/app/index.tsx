import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { carregarPerfil, verificarPrimeiraVez } from '@/shared/storage';
import { Screen } from '@/shared/ui';

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
    return <Screen loading />;
  }

  return <Redirect href={`/${destino}`} />;
}
