import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { commitmentColor, Fonts, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { carregarHistorico } from '@/shared/storage';
import type { FaturaHistorico } from '@/shared/types';
import {
  DataRow,
  EmptyState,
  MoneyText,
  Screen,
  ScreenHeader,
  Surface,
} from '@/shared/ui';

function formatarMes(mesStr: string): string {
  const nomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const [ano, mes] = mesStr.split('-');
  return `${nomes[parseInt(mes, 10) - 1]} ${ano}`;
}

export function HistoricoScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [historico, setHistorico] = useState<FaturaHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    carregarHistorico().then((h) => {
      setHistorico([...h].reverse());
      setCarregando(false);
    });
  }, []);

  return (
    <Screen loading={carregando}>
      <ScreenHeader
        title="Histórico de faturas"
        subtitle="Faturas fechadas, da mais recente para a mais antiga"
        onBack={() => router.back()}
      />

      {historico.length === 0 ? (
        <EmptyState
          title="Nenhuma fatura fechada"
          description="As faturas aparecem aqui após o fechamento mensal."
          actionLabel="Voltar ao painel"
          onAction={() => router.back()}
        />
      ) : (
        <>
          {historico.map((fatura) => {
          const aberto = expandido === fatura.id;
          const pctColor = commitmentColor(fatura.percentualComprometido, colors);
          return (
            <Surface key={fatura.id} style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: aberto }}
                style={styles.cardHeader}
                onPress={() => setExpandido(aberto ? null : fatura.id)}>
                <View style={styles.cardLeft}>
                  <Text style={[styles.cardMes, { color: colors.text, fontFamily: Fonts.sansSemiBold }]}>
                    {formatarMes(fatura.mes)}
                  </Text>
                  <Text style={[styles.cardMeta, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                    Fechada em {new Date(fatura.fechadaEm).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.pct, { color: pctColor, fontFamily: Fonts.monoSemiBold }]}>
                    {fatura.percentualComprometido.toFixed(1)}%
                  </Text>
                  <MoneyText value={fatura.totalComprometido} size="sm" tone="secondary" />
                  {aberto ? (
                    <ChevronUp size={16} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={16} color={colors.textSecondary} />
                  )}
                </View>
              </Pressable>

              {aberto ? (
                <View style={styles.detalhes}>
                  <DataRow
                    label="Renda disponível"
                    value={<MoneyText value={fatura.rendaDisponivel} size="sm" />}
                  />
                  <DataRow
                    label="Total comprometido"
                    value={
                      <MoneyText
                        value={fatura.totalComprometido}
                        size="sm"
                        tone="commitment"
                        commitmentPercent={fatura.percentualComprometido}
                      />
                    }
                    last
                  />

                  <Text
                    style={[
                      styles.comprasTitulo,
                      { color: colors.text, fontFamily: Fonts.sansSemiBold },
                    ]}>
                    Compras desta fatura
                  </Text>
                  {fatura.compras.length === 0 ? (
                    <Text style={{ color: colors.textSecondary, fontFamily: Fonts.sans, fontSize: Type.body }}>
                      Nenhuma compra nesta fatura.
                    </Text>
                  ) : (
                    fatura.compras.map((compra, index) => (
                      <View
                        key={compra.id}
                        style={[
                          styles.compra,
                          index < fatura.compras.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.divider,
                          },
                        ]}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontFamily: Fonts.sansSemiBold, fontSize: Type.body }}>
                            {compra.categoria}
                          </Text>
                          <Text style={{ color: colors.textSecondary, fontFamily: Fonts.sans, fontSize: Type.caption }}>
                            {compra.numeroParcelas}x · R$ {compra.parcelaMensal.toFixed(2)}/mês
                          </Text>
                        </View>
                        <MoneyText value={compra.valor} size="sm" />
                      </View>
                    ))
                  )}
                </View>
              ) : null}
            </Surface>
          );
        })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  cardLeft: { flex: 1, marginRight: Spacing.two },
  cardMes: { fontSize: Type.bodyLg },
  cardMeta: { fontSize: Type.caption, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  pct: { fontSize: Type.title },
  detalhes: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: Type.body },
  comprasTitulo: { fontSize: Type.label, marginTop: Spacing.two },
  compra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
});
