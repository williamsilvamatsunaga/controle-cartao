import { useCapturaNotificacoes } from '../hooks/use-captura-notificacoes';

/** Mantém o listener Android ativo enquanto o app estiver aberto. No-op em __DEV__. */
export function BankNotificationBridge() {
  useCapturaNotificacoes();
  return null;
}
