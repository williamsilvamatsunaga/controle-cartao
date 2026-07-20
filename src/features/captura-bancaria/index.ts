export { CapturaBancariaScreen } from './screens/CapturaBancariaScreen';
export { ConfirmarMovimentoScreen } from './screens/ConfirmarMovimentoScreen';
export { BankNotificationBridge } from './components/BankNotificationBridge';
export { useCapturaNotificacoes } from './hooks/use-captura-notificacoes';
export { useStatusCaptura } from './hooks/use-status-captura';
export { PACKAGES_PERMITIDOS, LABELS_INSTITUICAO } from './data/instituicoes';
export { parseNotificacaoBancaria } from './lib/parse-notificacao';
export type { NotificacaoBruta, MovimentoCapturado, InstituicaoBancaria } from './types';
