import { parseNotificacaoBancaria } from '../parse-notificacao';

describe('parseNotificacaoBancaria', () => {
  it('nubank_compra_retorna_gasto_com_valor', () => {
    const r = parseNotificacaoBancaria({
      packageName: 'com.nu.production',
      title: 'Nubank',
      text: 'Compra de R$ 32,50 em Padaria aprovada',
      postTime: 1700000000000,
    });
    expect(r).toMatchObject({
      instituicao: 'nubank',
      tipo: 'gasto',
      valor: 32.5,
    });
    expect(r?.rawKey).toContain('com.nu.production');
  });

  it('inter_recebimento_retorna_recebimento', () => {
    const r = parseNotificacaoBancaria({
      packageName: 'br.com.intermedium',
      title: 'Inter',
      text: 'Você recebeu um Pix de R$ 200,00',
      postTime: 1700000000001,
    });
    expect(r).toMatchObject({
      instituicao: 'inter',
      tipo: 'recebimento',
      valor: 200,
    });
  });

  it('sicoob_pagamento_retorna_gasto', () => {
    const r = parseNotificacaoBancaria({
      packageName: 'br.com.sicoob.mobile',
      title: 'Sicoob',
      text: 'Pagamento de R$ 15,00 aprovado',
      postTime: 1700000000002,
    });
    expect(r).toMatchObject({
      instituicao: 'sicoob',
      tipo: 'gasto',
      valor: 15,
    });
  });

  it('package_desconhecido_retorna_null', () => {
    expect(
      parseNotificacaoBancaria({
        packageName: 'com.whatsapp',
        title: 'Oi',
        text: 'R$ 10,00',
        postTime: 1,
      }),
    ).toBeNull();
  });

  it('ignorado_sem_valor_retorna_null', () => {
    expect(
      parseNotificacaoBancaria({
        packageName: 'br.com.intermedium',
        title: 'Inter',
        text: 'Bem-vindo ao Inter',
        postTime: 1,
      }),
    ).toBeNull();
  });
});
