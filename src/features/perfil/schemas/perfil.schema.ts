import { parseMoneyInput } from '@/shared/lib/money';
import { z } from 'zod';

function moneyOptional(message: string) {
  return z.string().transform((s, ctx) => {
    const trimmed = s.trim();
    if (trimmed === '') return 0;
    const n = parseMoneyInput(trimmed);
    if (Number.isNaN(n) || n < 0) {
      ctx.addIssue({ code: 'custom', message });
      return z.NEVER;
    }
    return n;
  });
}

function moneyRequired(message: string) {
  return z.string().transform((s, ctx) => {
    const n = parseMoneyInput(s.trim());
    if (Number.isNaN(n) || n <= 0) {
      ctx.addIssue({ code: 'custom', message });
      return z.NEVER;
    }
    return n;
  });
}

export const perfilFormSchema = z.object({
  salarioLiquido: moneyRequired('Informe um salário líquido válido.'),
  outrasRendas: moneyOptional('Informe um valor válido para outras rendas.'),
  deducoesMensais: moneyOptional('Informe um valor válido para deduções.'),
  diaFechamento: z.string().transform((s, ctx) => {
    const dia = parseInt(s, 10);
    if (!dia || dia < 1 || dia > 31) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um dia de fechamento válido (entre 1 e 31).',
      });
      return z.NEVER;
    }
    return dia;
  }),
});

export type PerfilFormInput = z.input<typeof perfilFormSchema>;
export type PerfilFormValues = z.output<typeof perfilFormSchema>;
