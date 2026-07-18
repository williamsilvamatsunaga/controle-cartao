import {
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { BankNotificationBridge } from '@/features/captura-bancaria';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <View />;
  }

  return (
    <>
      <BankNotificationBridge />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F0F4F3' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="bem-vindo" />
        <Stack.Screen name="cadastro-perfil" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="nova-compra" />
        <Stack.Screen name="historico" />
        <Stack.Screen name="importar-extrato" />
        <Stack.Screen name="captura-bancaria" />
        <Stack.Screen name="confirmar-movimento" />
      </Stack>
    </>
  );
}
