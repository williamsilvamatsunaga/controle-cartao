import { useEffect } from 'react';
import { Platform } from 'react-native';
import { PACKAGES_PERMITIDOS } from '../data/instituicoes';
import { parseNotificacaoBancaria } from '../lib/parse-notificacao';
import type { NotificacaoBruta } from '../types';
import { enfileirarMovimento } from '@/shared/storage';
import { loadNotificationListenerModule } from './use-status-captura';

/** Inscreve o listener Android uma vez (usar só no root). */
export function useCapturaNotificacoes() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const mod = loadNotificationListenerModule();
    if (!mod) return;

    mod.setAllowedPackages(PACKAGES_PERMITIDOS);

    const subscription = mod.addListener('onNotificationReceived', async (event) => {
      const bruta: NotificacaoBruta = {
        packageName: event.packageName,
        title: event.title ?? null,
        text: event.text ?? null,
        bigText: event.bigText ?? null,
        postTime: event.postTime ?? Date.now(),
      };
      const parsed = parseNotificacaoBancaria(bruta);
      if (!parsed) return;
      await enfileirarMovimento(parsed);
    });

    return () => subscription.remove();
  }, []);
}
