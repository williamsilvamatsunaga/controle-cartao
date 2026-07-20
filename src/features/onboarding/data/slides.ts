import type { LucideIcon } from 'lucide-react-native';
import { CreditCard, LineChart, TrendingUp } from 'lucide-react-native';

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
};

export const ONBOARDING_DATA: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Bem-vindo ao Meu Cartão',
    description:
      'Veja quanto da sua renda está no cartão, mês a mês, e use o crédito com mais clareza.',
    Icon: CreditCard,
  },
  {
    id: '2',
    title: 'Faça o dinheiro render',
    description:
      'Deixe o salário em uma conta que rende. Ele trabalha por você enquanto você usa o cartão no dia a dia.',
    Icon: TrendingUp,
  },
  {
    id: '3',
    title: 'Saia do loop do cartão',
    description:
      'Acompanhe o comprometimento e, com disciplina, reconstrua o fôlego financeiro.',
    Icon: LineChart,
  },
];
