import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import {
  carregarMovimentosPendentes,
  contarPendentes,
} from '@/shared/storage';
import type { MovimentoCapturado } from '@/shared/types';

type ListenerModule = {
  isNotificationPermissionGranted: () => boolean;
  openNotificationListenerSettings: () => void;
  setAllowedPackages: (packages: string[]) => void;
  addListener: (
    event: 'onNotificationReceived',
    cb: (event: {
      packageName: string;
      title: string;
      text: string;
      bigText: string;
      postTime: number;
    }) => void,
  ) => { remove: () => void };
};

/**
 * Em __DEV__ (Expo Go / Metro) o módulo nativo não existe — no-op.
 * Em production (EAS / dev client com native build) o autolink carrega o módulo.
 */
export function loadNotificationListenerModule(): ListenerModule | null {
  if (__DEV__ || Platform.OS !== 'android') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-android-notification-listener-service')
      .default as ListenerModule;
  } catch {
    return null;
  }
}

export function useStatusCaptura() {
  const suportado = Platform.OS === 'android';
  const [hasPermission, setHasPermission] = useState(false);
  const [pendentes, setPendentes] = useState<MovimentoCapturado[]>([]);
  const [moduloDisponivel, setModuloDisponivel] = useState(false);

  const refresh = useCallback(async () => {
    const lista = await carregarMovimentosPendentes();
    setPendentes(lista);
    const mod = loadNotificationListenerModule();
    setModuloDisponivel(Boolean(mod));
    if (mod) setHasPermission(mod.isNotificationPermissionGranted());
  }, []);

  const openSettings = useCallback(() => {
    const mod = loadNotificationListenerModule();
    if (mod) {
      mod.openNotificationListenerSettings();
      return;
    }
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return {
    suportado,
    moduloDisponivel,
    hasPermission,
    openSettings,
    pendentes,
    refresh,
    contarPendentes,
  };
}
