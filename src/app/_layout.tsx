import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro-perfil" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="nova-compra" />
      <Stack.Screen name="historico" />
    </Stack>
  );
}