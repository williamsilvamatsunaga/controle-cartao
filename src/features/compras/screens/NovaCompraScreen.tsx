import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { AlertTriangle, Ban, CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { analisarNovaCompra } from '@/shared/lib/calculos';
import { Fonts, Radius, Spacing, Type, commitmentColor } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { adicionarCompra, carregarCompras, carregarPerfil } from '@/shared/storage';
import type { ResultadoAnaliseCompra } from '@/shared/types';
import {
  Button,
  Chip,
  DataRow,
  Field,
  MoneyText,
  Screen,
  ScreenHeader,
  Surface,
} from '@/shared/ui';
import {
  CATEGORIAS,
  compraFormSchema,
  type CompraFormInput,
  type CompraFormValues,
} from '../schemas/compra.schema';

const PARCELAS_PRESET = [1, 2, 3, 6, 10, 12, 18, 24];

export function NovaCompraScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [dataCompra] = useState(new Date().toISOString().slice(0, 10));
  const [resultado, setResultado] = useState<ResultadoAnaliseCompra | null>(null);
  const [analisando, setAnalisando] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CompraFormInput, unknown, CompraFormValues>({
    resolver: zodResolver(compraFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      valor: '',
      parcelas: '1',
      categoria: 'Outros',
    },
  });

  const parcelas = useWatch({ control, name: 'parcelas' });
  const categoria = useWatch({ control, name: 'categoria' });
  const valorWatch = useWatch({ control, name: 'valor' });

  async function onAnalisar(data: CompraFormValues) {
    setAnalisando(true);
    try {
      const perfil = await carregarPerfil();
      const compras = await carregarCompras();

      if (!perfil) {
        Alert.alert('Erro', 'Perfil não encontrado. Recadastre seus dados.');
        router.replace('/cadastro-perfil');
        return;
      }

      setResultado(
        analisarNovaCompra(perfil, compras, data.valor, data.parcelas, dataCompra),
      );
    } finally {
      setAnalisando(false);
    }
  }

  async function handleConfirmar() {
    if (!resultado) return;
    const parsed = compraFormSchema.safeParse(getValues());
    if (!parsed.success) return;

    await adicionarCompra({
      id: Date.now().toString(),
      valor: parsed.data.valor,
      numeroParcelas: parsed.data.parcelas,
      categoria: parsed.data.categoria,
      dataCompra,
      parcelaMensal: resultado.parcelaMensal,
    });
    router.replace('/dashboard');
  }

  function getTextoClassificacao() {
    if (!resultado) return '';
    if (resultado.classificacao === 'ok') return 'Compra dentro do orçamento';
    if (resultado.classificacao === 'moderado') return 'Atenção ao orçamento';
    return 'Esta compra comprometerá grande parte da sua renda';
  }

  const classColor = resultado
    ? commitmentColor(resultado.comprometimentoApos, colors)
    : colors.text;

  return (
    <Screen>
      <ScreenHeader
        title={resultado ? 'Aprovar compra' : 'Nova compra'}
        subtitle={
          resultado
            ? 'Revise o impacto e confirme para salvar'
            : 'Informe os dados e analise o impacto na renda'
        }
        onBack={() => (resultado ? setResultado(null) : router.back())}
        backLabel={resultado ? 'Editar dados' : 'Voltar'}
      />

      {!resultado ? (
        <>
          <Surface>
            <Controller
              control={control}
              name="valor"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Valor total *"
                  keyboardType="numeric"
                  placeholder="Ex: 2400"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(t) => {
                    onChange(t);
                    setResultado(null);
                  }}
                  error={errors.valor?.message}
                  flush
                />
              )}
            />

            <Text style={[styles.label, { color: colors.text, fontFamily: Fonts.sansSemiBold }]}>
              Parcelas *
            </Text>
            <View style={styles.chips}>
              {PARCELAS_PRESET.map((n) => (
                <Chip
                  key={n}
                  label={`${n}x`}
                  selected={parcelas === String(n)}
                  onPress={() => {
                    setValue('parcelas', String(n), { shouldValidate: true });
                    setResultado(null);
                  }}
                />
              ))}
            </View>
            <Controller
              control={control}
              name="parcelas"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: errors.parcelas ? colors.danger : colors.border,
                      backgroundColor: colors.background,
                      fontFamily: Fonts.sans,
                    },
                  ]}
                  keyboardType="numeric"
                  placeholder="Ou digite outro valor (ex: 36)"
                  value={PARCELAS_PRESET.includes(parseInt(value, 10)) ? '' : value}
                  onBlur={onBlur}
                  onChangeText={(t) => {
                    onChange(t);
                    setResultado(null);
                  }}
                />
              )}
            />
            {errors.parcelas?.message ? (
              <Text style={{ color: colors.danger, fontFamily: Fonts.sans, fontSize: Type.label, marginTop: 6 }}>
                {errors.parcelas.message}
              </Text>
            ) : null}

            <Text style={[styles.label, { color: colors.text, fontFamily: Fonts.sansSemiBold }]}>
              Categoria
            </Text>
            <Controller
              control={control}
              name="categoria"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chips}>
                  {CATEGORIAS.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      selected={value === cat}
                      onPress={() => onChange(cat)}
                    />
                  ))}
                </View>
              )}
            />
          </Surface>

          <Button
            label={analisando ? 'Analisando...' : 'Analisar impacto'}
            loading={analisando}
            onPress={handleSubmit(onAnalisar)}
          />
        </>
      ) : (
        <>
          <Surface>
            <DataRow
              label="Valor total"
              value={
                <MoneyText
                  value={Number(String(valorWatch).replace(',', '.')) || 0}
                  size="sm"
                />
              }
            />
            <DataRow label="Parcelas" valueText={`${parcelas}x`} />
            <DataRow label="Categoria" valueText={categoria} />
            <DataRow
              label="Parcela mensal"
              value={<MoneyText value={resultado.parcelaMensal} size="sm" />}
              emphasis
            />
            <DataRow
              label="Comprometimento atual"
              valueText={`${resultado.comprometimentoAtual.toFixed(1)}%`}
            />
            <DataRow
              label="Após a compra"
              valueText={`${resultado.comprometimentoApos.toFixed(1)}%`}
              valueColor={classColor}
              emphasis
              last
            />

            <View style={[styles.barra, { backgroundColor: colors.track }]}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.min(resultado.comprometimentoAtual, 100)}%`,
                  backgroundColor: colors.textSecondary,
                }}
              />
              <View
                style={{
                  height: '100%',
                  width: `${Math.min(
                    resultado.comprometimentoApos - resultado.comprometimentoAtual,
                    100 - resultado.comprometimentoAtual,
                  )}%`,
                  backgroundColor: classColor,
                }}
              />
            </View>

            <View style={styles.classificacao}>
              {resultado.classificacao === 'ok' ? (
                <CheckCircle2 size={18} color={classColor} strokeWidth={2} />
              ) : resultado.classificacao === 'moderado' ? (
                <AlertTriangle size={18} color={classColor} strokeWidth={2} />
              ) : (
                <Ban size={18} color={classColor} strokeWidth={2} />
              )}
              <Text
                style={{
                  flex: 1,
                  color: classColor,
                  fontFamily: Fonts.sansSemiBold,
                  fontSize: Type.body,
                }}>
                {getTextoClassificacao()}
              </Text>
            </View>
          </Surface>

          <Button label="Confirmar e salvar compra" onPress={handleConfirmar} />
          <Button
            label="Voltar e editar"
            variant="ghost"
            onPress={() => setResultado(null)}
            style={{ marginTop: Spacing.two }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: Type.body,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.twoHalf,
    fontSize: Type.bodyLg,
    minHeight: 48,
    marginTop: Spacing.two,
  },
  barra: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  classificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
