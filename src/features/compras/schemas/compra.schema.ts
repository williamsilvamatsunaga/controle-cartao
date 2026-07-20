import type { Categoria } from '@/shared/types';
import { parseMoneyInput } from '@/shared/lib/money';
import { z } from 'zod';

export const CATEGORIAS: Categoria[] = [
  'Mercado',
  'Combustível',
  'Saúde',
  'Contas',
  'Moradia',
  'Educação',
  'Transporte',
  'Academia',
  'Internet',
  'Telefonia',
  'Lazer',
  'Streaming',
  'Restaurantes',
  'Compras',
  'Games',
  'Presentes',
  'Outros',
];

export const compraFormSchema = z.object({
  valor: z.string().transform((s, ctx) => {
    const n = parseMoneyInput(s.trim());
    if (Number.isNaN(n) || n <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um valor válido para a compra.',
      });
      return z.NEVER;
    }
    return n;
  }),
  parcelas: z.string().transform((s, ctx) => {
    const n = parseInt(s, 10);
    if (!n || n < 1 || Number.isNaN(n)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um número de parcelas válido.',
      });
      return z.NEVER;
    }
    return n;
  }),
  categoria: z.enum(CATEGORIAS as [Categoria, ...Categoria[]]),
});

export type CompraFormInput = z.input<typeof compraFormSchema>;
export type CompraFormValues = z.output<typeof compraFormSchema>;
