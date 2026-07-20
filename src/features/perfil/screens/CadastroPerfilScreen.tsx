import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ImportarExtratoPanel } from '@/features/extrato/ui/importar-extrato-panel';
import type { ResultadoImportacaoExtrato } from '@/features/extrato/types';
import { Fonts, Radius, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { mesclarLancamentosExtrato, salvarPerfil } from '@/shared/storage';
import type { RendaMensal } from '@/shared/types';
import { Button, Field, Screen, ScreenHeader, Surface } from '@/shared/ui';

import {
  perfilFormSchema,
  type PerfilFormInput,
  type PerfilFormValues,
} from '../schemas/perfil.schema';

type ModoEntrada = 'manual' | 'importar';

export function CadastroPerfilScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [modo, setModo] = useState<ModoEntrada>('manual');
  const [historicoRendas, setHistoricoRendas] = useState<RendaMensal[]>([]);
  const [origemImportacao, setOrigemImportacao] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PerfilFormInput, unknown, PerfilFormValues>({
    resolver: zodResolver(perfilFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      salarioLiquido: '',
      outrasRendas: '',
      deducoesMensais: '',
      diaFechamento: '',
    },
  });

  async function handleAplicarExtrato(resultado: ResultadoImportacaoExtrato) {
    const { renda, lancamentos } = resultado;
    await mesclarLancamentosExtrato(lancamentos);
    if (renda.salarioLiquido > 0) {
      setValue('salarioLiquido', String(renda.salarioLiquido), {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue(
        'outrasRendas',
        renda.outrasRendas > 0 ? String(renda.outrasRendas) : '',
        { shouldValidate: true, shouldDirty: true },
      );
      setHistoricoRendas(renda.historicoRendas);
    }
    setOrigemImportacao(true);
    setModo('manual');
  }

  async function onSubmit(data: PerfilFormValues) {
    const hoje = new Date().toISOString().slice(0, 10);
    await salvarPerfil({
      salarioLiquido: data.salarioLiquido,
      outrasRendas: data.outrasRendas,
      deducoesMensais: data.deducoesMensais,
      diaFechamento: data.diaFechamento,
      ultimoFechamento: hoje,
      historicoRendas,
    });
    setMostrarAviso(true);
  }

  if (mostrarAviso) {
    return (
      <Screen scroll={false} contentContainerStyle={styles.avisoWrap}>
        <ScreenHeader
          title="Perfil salvo"
          subtitle="Tudo certo para acompanhar o cartão"
        />
        <Surface tone="success" style={styles.avisoCard}>
          <Text style={[styles.avisoTexto, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
            Se já fez alguma compra após o fechamento da última fatura, registre-a em Nova compra
            assim que entrar no painel.
          </Text>
        </Surface>
        <Button
          label="Ir para o painel"
          onPress={() => router.replace('/dashboard')}
          style={styles.avisoBotao}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Sua renda"
        subtitle="Preencha os valores para calcular o comprometimento"
      />

      <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]}>
        {(['manual', 'importar'] as const).map((tab) => {
          const ativo = modo === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setModo(tab)}
              style={[styles.tab, ativo && { backgroundColor: colors.surface }]}>
              <Text
                style={{
                  fontFamily: Fonts.sansSemiBold,
                  fontSize: Type.label,
                  color: ativo ? colors.accent : colors.textSecondary,
                }}>
                {tab === 'manual' ? 'Digitar' : 'Importar extrato'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {modo === 'importar' ? (
        <ImportarExtratoPanel
          onAplicar={handleAplicarExtrato}
          onCancelar={() => setModo('manual')}
        />
      ) : (
        <>
          {origemImportacao ? (
            <Surface tone="success">
              <Text
                style={{
                  color: colors.success,
                  fontFamily: Fonts.sans,
                  fontSize: Type.caption,
                  lineHeight: 18,
                }}>
                Valores preenchidos a partir dos extratos
                {historicoRendas.length > 0
                  ? ` · ${historicoRendas.length} mês(es) no histórico`
                  : ''}
                . Ajuste se precisar antes de salvar.
              </Text>
            </Surface>
          ) : null}

          <Surface>
            <Controller
              control={control}
              name="salarioLiquido"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Salário líquido *"
                  keyboardType="numeric"
                  placeholder="Ex: 3500"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.salarioLiquido?.message}
                  flush
                />
              )}
            />
            <Controller
              control={control}
              name="outrasRendas"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Outras rendas (opcional)"
                  keyboardType="numeric"
                  placeholder="Ex: 500"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.outrasRendas?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="deducoesMensais"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Deduções mensais (opcional)"
                  keyboardType="numeric"
                  placeholder="Reserva + investimentos"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.deducoesMensais?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="diaFechamento"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Dia de fechamento *"
                  keyboardType="numeric"
                  placeholder="Ex: 2"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.diaFechamento?.message}
                />
              )}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: Fonts.sans,
                fontSize: Type.label,
                lineHeight: 18,
                marginTop: Spacing.three,
              }}>
              No dia do fechamento, o app arquiva a fatura e pede confirmação do salário do próximo
              mês.
            </Text>
          </Surface>

          <Button
            label="Salvar e continuar"
            onPress={handleSubmit(onSubmit)}
            style={styles.submit}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderRadius: Radius.sm,
    padding: 4,
    gap: 4,
    marginBottom: Spacing.three,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.twoHalf,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  submit: { marginTop: Spacing.two },
  avisoWrap: {
    justifyContent: 'center',
    gap: Spacing.two,
  },
  avisoCard: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  avisoTexto: {
    fontSize: Type.bodyLg,
    textAlign: 'center',
    lineHeight: 22,
  },
  avisoBotao: { alignSelf: 'stretch' },
});
