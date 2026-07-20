import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Fonts, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import {
  adicionarCompra,
  atualizarStatusMovimento,
  buscarMovimentoPorId,
  carregarPerfil,
  removerMovimento,
  salvarPerfil,
} from '@/shared/storage';
import type { MovimentoCapturado } from '@/shared/types';
import {
  Button,
  DataRow,
  MoneyText,
  Screen,
  ScreenHeader,
  Surface,
} from '@/shared/ui';
import { LABELS_INSTITUICAO } from '../data/instituicoes';

export function ConfirmarMovimentoScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movimento, setMovimento] = useState<MovimentoCapturado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!id) {
        setCarregando(false);
        return;
      }
      const m = await buscarMovimentoPorId(id);
      if (ativo) {
        setMovimento(m && m.status === 'pendente' ? m : null);
        setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  async function handleConfirmar() {
    if (!movimento) return;
    setSalvando(true);
    try {
      if (movimento.tipo === 'gasto') {
        const dataCompra = movimento.capturadoEm.slice(0, 10);
        await adicionarCompra({
          id: Date.now().toString(),
          valor: movimento.valor,
          numeroParcelas: 1,
          categoria: 'Outros',
          dataCompra,
          parcelaMensal: movimento.valor,
        });
      } else {
        const perfil = await carregarPerfil();
        if (!perfil) {
          Alert.alert('Erro', 'Perfil não encontrado. Cadastre seus dados primeiro.');
          router.replace('/cadastro-perfil');
          return;
        }
        await salvarPerfil({
          ...perfil,
          outrasRendas: perfil.outrasRendas + movimento.valor,
        });
      }
      await atualizarStatusMovimento(movimento.id, 'confirmado');
      await removerMovimento(movimento.id);
      router.replace('/dashboard');
    } finally {
      setSalvando(false);
    }
  }

  async function handleDescartar() {
    if (!movimento) return;
    await atualizarStatusMovimento(movimento.id, 'descartado');
    await removerMovimento(movimento.id);
    router.back();
  }

  if (carregando) return <Screen loading />;

  if (!movimento) {
    return (
      <Screen>
        <ScreenHeader
          title="Movimento"
          onBack={() => router.back()}
        />
        <Text style={{ color: colors.textSecondary, fontFamily: Fonts.sans }}>
          Este movimento não está mais pendente.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Confirmar movimento"
        subtitle="Confira o valor e confirme ou descarte"
        onBack={() => router.back()}
      />

      <Surface>
        <DataRow
          label="Instituição"
          valueText={LABELS_INSTITUICAO[movimento.instituicao]}
        />
        <DataRow
          label="Tipo"
          valueText={movimento.tipo === 'gasto' ? 'Gasto' : 'Recebimento'}
        />
        <DataRow
          label="Valor"
          value={<MoneyText value={movimento.valor} size="sm" />}
          emphasis
        />
        <DataRow label="Descrição" valueText={movimento.descricao} last />
      </Surface>

      <Text
        style={[
          styles.hint,
          { color: colors.textSecondary, fontFamily: Fonts.sans },
        ]}>
        {movimento.tipo === 'gasto'
          ? 'Ao confirmar, cria uma compra à vista (1x) na categoria Outros. Você pode ajustar depois no painel se precisar.'
          : 'Ao confirmar, o valor é somado em Outras rendas do seu perfil.'}
      </Text>

      <View style={styles.actions}>
        <Button
          label={
            movimento.tipo === 'gasto'
              ? 'Exportar como compra'
              : 'Exportar como renda'
          }
          onPress={handleConfirmar}
          loading={salvando}
        />
        <Button
          label="Descartar"
          variant="ghost"
          onPress={handleDescartar}
          disabled={salvando}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: Type.label,
    lineHeight: 18,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
  },
});
