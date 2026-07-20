export type {
  InstituicaoBancaria,
  MovimentoCapturado,
  TipoMovimentoBancario as TipoMovimento,
} from '@/shared/types';

export interface NotificacaoBruta {
  packageName: string;
  title: string | null;
  text: string | null;
  bigText?: string | null;
  postTime: number;
}
