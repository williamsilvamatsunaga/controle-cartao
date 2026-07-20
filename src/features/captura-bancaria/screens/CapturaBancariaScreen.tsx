import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, BellOff } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fonts, Radius, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import {
  Button,
  EmptyState,
  MoneyText,
  Screen,
  ScreenHeader,
  Section,
  Surface,
} from '@/shared/ui';
import { LABELS_INSTITUICAO } from '../data/instituicoes';
import { useStatusCaptura } from '../hooks/use-status-captura';

export function CapturaBancariaScreen() {
  const router = useRouter();
  const colors = useTheme();
  const {
    suportado,
    moduloDisponivel,
    hasPermission,
    openSettings,
    pendentes,
    refresh,
  } = useStatusCaptura();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <Screen>
      <ScreenHeader
        title="Captura bancária"
        subtitle="Nubank, Inter e Sicoob via notificações"
        onBack={() => router.back()}
      />

      {!suportado ? (
        <EmptyState
          icon={<BellOff size={28} color={colors.textSecondary} />}
          title="Disponível só no Android"
          description="O iOS e a web não permitem ler notificações de outros apps. Use o app no Android com build nativa."
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      ) : (
        <>
          <Surface>
            <View style={styles.permRow}>
              <Bell size={20} color={hasPermission ? colors.success : colors.warning} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: Fonts.sansSemiBold,
                    fontSize: Type.body,
                  }}>
                  {hasPermission
                    ? 'Acesso a notificações ativo'
                    : 'Permissão necessária'}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: Fonts.sans,
                    fontSize: Type.label,
                    lineHeight: 18,
                  }}>
                  {moduloDisponivel
                    ? 'O app lê só Nubank, Inter e Sicoob. Nada é gravado sem a sua confirmação.'
                    : 'É preciso um development build / APK (não funciona no Expo Go).'}
                </Text>
              </View>
            </View>
            {!hasPermission ? (
              <Button
                label="Abrir configuração de acesso"
                onPress={openSettings}
                style={{ marginTop: Spacing.two }}
              />
            ) : null}
          </Surface>

          <Section title="Pendentes de confirmação">
            {pendentes.length === 0 ? (
              <EmptyState
                title="Nenhum movimento ainda"
                description="Quando chegar uma notificação de gasto ou recebimento, ela aparece aqui."
              />
            ) : (
              <Surface>
                {pendentes.map((m, index) => (
                  <Pressable
                    key={m.id}
                    onPress={() =>
                      router.push({
                        pathname: '/confirmar-movimento',
                        params: { id: m.id },
                      })
                    }
                    style={[
                      styles.item,
                      index < pendentes.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.divider,
                      },
                    ]}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontFamily: Fonts.sans,
                          fontSize: Type.caption,
                        }}>
                        {LABELS_INSTITUICAO[m.instituicao]} ·{' '}
                        {m.tipo === 'gasto' ? 'Gasto' : 'Recebimento'}
                      </Text>
                      <Text
                        style={{
                          color: colors.text,
                          fontFamily: Fonts.sans,
                          fontSize: Type.body,
                        }}
                        numberOfLines={2}>
                        {m.descricao}
                      </Text>
                    </View>
                    <MoneyText value={m.valor} size="sm" />
                  </Pressable>
                ))}
              </Surface>
            )}
          </Section>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  permRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    minHeight: 56,
    borderRadius: Radius.sm,
  },
});
