import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { Bell, Calendar, ChevronLeft, ChevronRight, FileUp, History, RotateCcw } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  agregarFluxoMes,
  calcularComprometimentoHibrido,
  listarMesesComLancamentos,
} from '@/features/extrato';
import type { LancamentoPersistido } from '@/features/extrato/types';
import {
  commitmentColor,
  Fonts,
  Radius,
  Spacing,
  Type,
} from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import {
  calcularRendaDisponivel,
  calcularRendaMediaFutura,
  compraIncideNoMes,
} from '@/shared/lib/calculos';
import {
  carregarCompras,
  carregarExtratos,
  carregarPerfil,
  contarPendentes,
  fecharFatura,
  limparTudo,
  removerCompra,
} from '@/shared/storage';
import type { Categoria, Compra, PerfilFinanceiro } from '@/shared/types';
import {
  Button,
  CommitmentGauge,
  DataRow,
  EmptyState,
  MoneyText,
  Screen,
  ScreenHeader,
  Section,
  Surface,
} from '@/shared/ui';

const CORES_CATEGORIA: Record<Categoria, string> = {
  Mercado: '#15803D',
  Combustível: '#C2410C',
  Saúde: '#B91C1C',
  Contas: '#5B21B6',
  Moradia: '#155E75',
  Educação: '#0E7490',
  Transporte: '#4D7C0F',
  Academia: '#BE185D',
  Internet: '#0F766E',
  Telefonia: '#4338CA',
  Lazer: '#B45309',
  Streaming: '#6D28D9',
  Restaurantes: '#991B1B',
  Compras: '#0369A1',
  Games: '#047857',
  Presentes: '#BE123C',
  Outros: '#64748B',
};

function gerarProximosMeses(quantidade: number): string[] {
  const meses: string[] = [];
  const hoje = new Date();
  for (let i = 0; i < quantidade; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    meses.push(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
  }
  return meses;
}

function formatarMes(mesStr: string): string {
  const nomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const [ano, mes] = mesStr.split('-');
  return `${nomes[parseInt(mes, 10) - 1]} ${ano}`;
}

function deveFecharFatura(perfil: PerfilFinanceiro): boolean {
  const hoje = new Date();
  const diaHoje = hoje.getDate();
  if (diaHoje < perfil.diaFechamento) return false;
  if (!perfil.ultimoFechamento) return false;
  const ultimoFech = new Date(perfil.ultimoFechamento);
  const mesAtual = hoje.getFullYear() * 12 + hoje.getMonth();
  const mesUltimoFech = ultimoFech.getFullYear() * 12 + ultimoFech.getMonth();
  return mesAtual > mesUltimoFech;
}

function resolverMesInicial(
  lancamentos: LancamentoPersistido[],
  preferido: string
): string {
  const meses = listarMesesComLancamentos(lancamentos);
  if (meses.length === 0) return preferido;
  if (meses.includes(preferido)) return preferido;
  return meses[meses.length - 1];
}

export function DashboardScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [perfil, setPerfil] = useState<PerfilFinanceiro | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostraFormFechamento, setMostraFormFechamento] = useState(false);
  const [novoSalario, setNovoSalario] = useState('');
  const [novasOutrasRendas, setNovasOutrasRendas] = useState('');
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState<string | null>(null);
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const [pendentesCaptura, setPendentesCaptura] = useState(0);
  const [lancamentosExtrato, setLancamentosExtrato] = useState<LancamentoPersistido[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState(
    () => new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    carregarDados();
  }, []);

  useFocusEffect(
    useCallback(() => {
      contarPendentes().then(setPendentesCaptura);
      carregarExtratos().then((l) => {
        setLancamentosExtrato(l);
        setMesSelecionado((atual) => resolverMesInicial(l, atual));
      });
    }, []),
  );

  async function carregarDados() {
    const [p, c, pendentes, extratos] = await Promise.all([
      carregarPerfil(),
      carregarCompras(),
      contarPendentes(),
      carregarExtratos(),
    ]);
    setPerfil(p);
    setCompras(c);
    setPendentesCaptura(pendentes);
    setLancamentosExtrato(extratos);
    setMesSelecionado(resolverMesInicial(extratos, new Date().toISOString().slice(0, 7)));
    setCarregando(false);
  }

  async function handleFecharFatura() {
    if (!perfil) return;
    const salNum = parseFloat(novoSalario.replace(',', '.'));
    const outNum = parseFloat(novasOutrasRendas.replace(',', '.'));
    const novosDados = novoSalario
      ? {
          salarioLiquido: isNaN(salNum) ? perfil.salarioLiquido : salNum,
          outrasRendas: isNaN(outNum) ? perfil.outrasRendas : outNum,
        }
      : undefined;
    await fecharFatura(perfil, compras, novosDados);
    setMostraFormFechamento(false);
    setNovoSalario('');
    setNovasOutrasRendas('');
    carregarDados();
  }

  async function handleCancelarCompra(id: string) {
    await removerCompra(id);
    setConfirmandoCancelamento(null);
    carregarDados();
  }

  async function handleResetar() {
    await limparTudo();
    // Index reavalia storage e manda para bem-vindo (fluxo normal).
    router.replace('/');
  }

  const mesesExtrato = useMemo(
    () => listarMesesComLancamentos(lancamentosExtrato),
    [lancamentosExtrato]
  );
  const fluxoMes = useMemo(
    () => agregarFluxoMes(lancamentosExtrato, mesSelecionado),
    [lancamentosExtrato, mesSelecionado]
  );

  if (!carregando && !perfil) {
    return (
      <Screen>
        <EmptyState
          title="Perfil não encontrado"
          description="Cadastre sua renda para começar a acompanhar o cartão."
          actionLabel="Ir para cadastro"
          onAction={() => router.replace('/cadastro-perfil')}
        />
      </Screen>
    );
  }

  if (carregando || !perfil) {
    return <Screen loading />;
  }

  const rendaDisponivel = calcularRendaDisponivel(perfil);
  const comprometidoAtual = calcularComprometimentoHibrido(
    compras,
    lancamentosExtrato,
    mesSelecionado
  );
  const percentualAtual = rendaDisponivel > 0 ? (comprometidoAtual / rendaDisponivel) * 100 : 0;
  const proximosMeses = gerarProximosMeses(6);
  const precisaFechar = deveFecharFatura(perfil);

  const idxMes = mesesExtrato.indexOf(mesSelecionado);
  const podeVoltarMes = idxMes > 0 || (idxMes < 0 && mesesExtrato.length > 0);
  const podeAvancarMes =
    (idxMes >= 0 && idxMes < mesesExtrato.length - 1) ||
    (idxMes < 0 && mesesExtrato.length > 0);

  function irMesAnterior() {
    if (idxMes > 0) {
      setMesSelecionado(mesesExtrato[idxMes - 1]);
      return;
    }
    if (idxMes < 0 && mesesExtrato.length > 0) {
      setMesSelecionado(mesesExtrato[mesesExtrato.length - 1]);
    }
  }

  function irMesProximo() {
    if (idxMes >= 0 && idxMes < mesesExtrato.length - 1) {
      setMesSelecionado(mesesExtrato[idxMes + 1]);
      return;
    }
    if (idxMes < 0 && mesesExtrato.length > 0) {
      setMesSelecionado(mesesExtrato[0]);
    }
  }

  const gastosPorCategoria = Object.entries(CORES_CATEGORIA)
    .map(([cat]) => {
      const total = compras
        .filter((c) => c.categoria === cat && compraIncideNoMes(c, mesSelecionado))
        .reduce((sum, c) => sum + c.parcelaMensal, 0);
      return { categoria: cat as Categoria, total };
    })
    .filter((g) => g.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <Screen>
      <ScreenHeader
        title="Painel"
        subtitle={formatarMes(mesSelecionado)}
        right={
          <Button
            label="Nova compra"
            onPress={() => router.push('/nova-compra')}
            style={styles.headerCta}
          />
        }
      />

      <View style={styles.mesNav}>
        <Pressable
          onPress={irMesAnterior}
          disabled={!podeVoltarMes}
          style={[styles.mesNavBtn, !podeVoltarMes && { opacity: 0.35 }]}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontFamily: Fonts.sansSemiBold, fontSize: Type.bodyLg }}>
          {formatarMes(mesSelecionado)}
        </Text>
        <Pressable
          onPress={irMesProximo}
          disabled={!podeAvancarMes}
          style={[styles.mesNavBtn, !podeAvancarMes && { opacity: 0.35 }]}>
          <ChevronRight size={22} color={colors.text} />
        </Pressable>
      </View>

      <Section title="Fluxo do extrato" spaced={false}>
        <Surface>
          {lancamentosExtrato.length === 0 ? (
            <EmptyState
              title="Nenhum extrato ainda"
              description="Importe CSV, OFX ou Excel para ver entradas e saídas por mês."
              actionLabel="Importar extrato"
              onAction={() => router.push('/importar-extrato' as Href)}
            />
          ) : (
            <>
              <DataRow
                label="Entradas"
                value={<MoneyText value={fluxoMes.entradas} size="sm" />}
                emphasis
              />
              <DataRow
                label="Saídas"
                value={<MoneyText value={fluxoMes.saidas} size="sm" />}
                emphasis
              />
              <DataRow
                label="Saldo do mês"
                value={<MoneyText value={fluxoMes.saldo} size="sm" />}
                last={fluxoMes.rendaExtrato <= 0 && fluxoMes.saidasCartao <= 0}
              />
              {fluxoMes.rendaExtrato > 0 ? (
                <DataRow
                  label="Renda no extrato"
                  value={<MoneyText value={fluxoMes.rendaExtrato} size="sm" />}
                  last={fluxoMes.saidasCartao <= 0}
                />
              ) : null}
              {fluxoMes.saidasCartao > 0 ? (
                <DataRow
                  label="Cartão no extrato"
                  value={<MoneyText value={fluxoMes.saidasCartao} size="sm" tone="commitment" commitmentPercent={percentualAtual} />}
                  last
                />
              ) : null}
            </>
          )}
        </Surface>
        <Button
          label="Importar / adicionar mês"
          variant="secondary"
          icon={<FileUp size={16} color={colors.accent} />}
          onPress={() => router.push('/importar-extrato' as Href)}
          style={{ marginTop: Spacing.two }}
        />
      </Section>

      <Section title="Comprometimento do cartão" spaced={false}>
      <Surface>
        <DataRow
          label="Renda disponível"
          value={<MoneyText value={rendaDisponivel} size="sm" />}
          emphasis
        />
        <DataRow
          label="Comprometido (parcelas + cartão no extrato)"
          value={
            <MoneyText
              value={comprometidoAtual}
              size="sm"
              tone="commitment"
              commitmentPercent={percentualAtual}
            />
          }
          emphasis
          last={perfil.deducoesMensais <= 0}
        />
        {perfil.deducoesMensais > 0 ? (
          <DataRow
            label="Reserva / investimentos"
            value={<MoneyText value={perfil.deducoesMensais} size="sm" />}
            last
          />
        ) : null}

        <CommitmentGauge
          percent={percentualAtual}
          label={`${percentualAtual.toFixed(1)}% da renda comprometida`}
        />
      </Surface>
      </Section>

      {precisaFechar ? (
        <Surface tone="warning">
          <View style={styles.bannerTitulo}>
            <Calendar size={18} color={colors.warning} strokeWidth={2} />
            <Text style={[styles.bannerTitle, { color: colors.warning, fontFamily: Fonts.sansSemiBold }]}>
              Dia {perfil.diaFechamento}: hora de fechar a fatura
            </Text>
          </View>
          <Text style={{ color: colors.warning, fontFamily: Fonts.sans, fontSize: Type.label, lineHeight: 18, marginBottom: Spacing.two }}>
            A fatura será arquivada. Parcelas em andamento seguem no próximo mês.
          </Text>

          {mostraFormFechamento ? (
            <View style={{ gap: Spacing.two }}>
              <Text style={{ color: colors.warning, fontFamily: Fonts.sansSemiBold, fontSize: Type.label }}>
                Novo salário líquido (deixe em branco para manter)
              </Text>
              <TextInput
                placeholderTextColor={colors.textSecondary}
                style={[styles.bannerInput, { borderColor: colors.warningBorder, color: colors.text, backgroundColor: colors.surface, fontFamily: Fonts.sans }]}
                keyboardType="numeric"
                placeholder={`Atual: R$ ${perfil.salarioLiquido}`}
                value={novoSalario}
                onChangeText={setNovoSalario}
              />
              <Text style={{ color: colors.warning, fontFamily: Fonts.sansSemiBold, fontSize: Type.label }}>
                Outras rendas
              </Text>
              <TextInput
                placeholderTextColor={colors.textSecondary}
                style={[styles.bannerInput, { borderColor: colors.warningBorder, color: colors.text, backgroundColor: colors.surface, fontFamily: Fonts.sans }]}
                keyboardType="numeric"
                placeholder={`Atual: R$ ${perfil.outrasRendas}`}
                value={novasOutrasRendas}
                onChangeText={setNovasOutrasRendas}
              />
              <Button label="Confirmar fechamento" variant="warning" onPress={handleFecharFatura} />
              <Button label="Cancelar" variant="ghost" onPress={() => setMostraFormFechamento(false)} />
            </View>
          ) : (
            <Button label="Fechar fatura agora" variant="warning" onPress={() => setMostraFormFechamento(true)} />
          )}
        </Surface>
      ) : null}

      <Section title="Próximos meses">
      <Surface>
        {proximosMeses.map((mes, index) => {
          const valor = calcularComprometimentoHibrido(compras, lancamentosExtrato, mes);
          const renda = index === 0 ? rendaDisponivel : calcularRendaMediaFutura(perfil);
          const percentual = renda > 0 ? (valor / renda) * 100 : 0;
          const cor = commitmentColor(percentual, colors);
          return (
            <View
              key={mes}
              style={[
                styles.mesLinha,
                index < proximosMeses.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.divider,
                },
              ]}>
              <Text style={{ color: colors.text, fontFamily: Fonts.sans, fontSize: Type.body }}>
                {formatarMes(mes)}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <MoneyText value={valor} size="sm" tone="commitment" commitmentPercent={percentual} />
                <Text style={{ color: cor, fontFamily: Fonts.mono, fontSize: Type.caption }}>
                  {percentual.toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        })}
      </Surface>
      </Section>

      {gastosPorCategoria.length > 0 ? (
        <Section title="Gastos por categoria este mês">
          <Surface>
            <View style={[styles.stacked, { backgroundColor: colors.track }]}>
              {gastosPorCategoria.map((g) => {
                const largura = comprometidoAtual > 0 ? (g.total / comprometidoAtual) * 100 : 0;
                return (
                  <View
                    key={g.categoria}
                    style={{
                      width: `${largura}%`,
                      height: '100%',
                      backgroundColor: CORES_CATEGORIA[g.categoria],
                    }}
                  />
                );
              })}
            </View>
            <View style={styles.legenda}>
              {gastosPorCategoria.map((g) => (
                <View key={g.categoria} style={styles.legendaItem}>
                  <View style={styles.legendaLeft}>
                    <View style={[styles.dot, { backgroundColor: CORES_CATEGORIA[g.categoria] }]} />
                    <Text
                      numberOfLines={1}
                      style={{ flex: 1, color: colors.text, fontFamily: Fonts.sans, fontSize: Type.caption }}>
                      {g.categoria}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontFamily: Fonts.monoSemiBold,
                      fontSize: Type.caption,
                    }}>
                    R$ {g.total.toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>
        </Section>
      ) : null}

      <Section title="Compras registradas">
      <Surface density="compact">
        {compras.length === 0 ? (
          <EmptyState
            title="Nenhuma compra ainda"
            description="Registre a primeira compra para ver o impacto no orçamento."
            actionLabel="Nova compra"
            onAction={() => router.push('/nova-compra')}
          />
        ) : (
          compras.map((compra, index) => (
            <View
              key={compra.id}
              style={[
                styles.compraLinha,
                index < compras.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.divider,
                },
              ]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.dot, { backgroundColor: CORES_CATEGORIA[compra.categoria] }]} />
                  <Text style={{ color: colors.text, fontFamily: Fonts.sansSemiBold, fontSize: Type.body }}>
                    {compra.categoria}
                  </Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontFamily: Fonts.sans, fontSize: Type.caption, marginTop: 2 }}>
                  {compra.numeroParcelas}x de R$ {compra.parcelaMensal.toFixed(2)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <MoneyText value={compra.valor} size="sm" />
                {confirmandoCancelamento === compra.id ? (
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={{ color: colors.danger, fontFamily: Fonts.sansSemiBold, fontSize: Type.caption }}>
                      Cancelar compra?
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Pressable
                        style={[styles.miniBtn, { backgroundColor: colors.danger }]}
                        onPress={() => handleCancelarCompra(compra.id)}>
                        <Text style={{ color: colors.onAccent, fontFamily: Fonts.sansBold, fontSize: Type.caption }}>
                          Sim
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.miniBtn, { backgroundColor: colors.surfaceMuted }]}
                        onPress={() => setConfirmandoCancelamento(null)}>
                        <Text style={{ color: colors.text, fontFamily: Fonts.sansSemiBold, fontSize: Type.caption }}>
                          Não
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={[styles.miniBtn, { backgroundColor: colors.dangerSurface }]}
                    onPress={() => setConfirmandoCancelamento(compra.id)}>
                    <Text style={{ color: colors.danger, fontFamily: Fonts.sansSemiBold, fontSize: Type.caption }}>
                      Cancelar
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </Surface>
      </Section>

      <Button
        label={
          pendentesCaptura > 0
            ? `Captura bancária (${pendentesCaptura})`
            : 'Captura bancária'
        }
        variant="secondary"
        icon={<Bell size={16} color={colors.accent} />}
        onPress={() => router.push('/captura-bancaria')}
        style={{ marginBottom: Spacing.two }}
      />

      <Button
        label="Ver histórico de faturas"
        variant="secondary"
        icon={<History size={16} color={colors.accent} />}
        onPress={() => router.push('/historico')}
        style={{ marginBottom: Spacing.two }}
      />

      {__DEV__ ? (
        <Section title="Desenvolvimento">
          {confirmandoReset ? (
            <Surface tone="danger">
              <Text
                style={{
                  color: colors.danger,
                  fontFamily: Fonts.sans,
                  fontSize: Type.body,
                  lineHeight: 20,
                  textAlign: 'center',
                  marginBottom: Spacing.three,
                }}>
                Isso apaga perfil, compras, histórico e o flag de onboarding. Você volta ao fluxo
                inicial (bem-vindo → cadastro).
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <Button
                  label="Resetar e reiniciar"
                  variant="danger"
                  onPress={handleResetar}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => setConfirmandoReset(false)}
                  style={{ flex: 1 }}
                />
              </View>
            </Surface>
          ) : (
            <Button
              label="DEV · Resetar app"
              variant="ghost"
              icon={<RotateCcw size={16} color={colors.danger} />}
              onPress={() => setConfirmandoReset(true)}
              style={undefined}
            />
          )}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCta: {
    minHeight: 40,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  mesNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  mesNavBtn: {
    padding: Spacing.two,
  },
  bannerTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  bannerTitle: { flex: 1, fontSize: Type.bodyLg },
  bannerInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.twoHalf,
    fontSize: Type.bodyLg,
    minHeight: 44,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  metricLabel: { fontSize: Type.body },
  secao: {
    fontSize: Type.bodyLg,
    marginBottom: Spacing.two,
  },
  mesLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.twoHalf,
  },
  stacked: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  legendaItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  legendaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  compraLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.twoHalf,
  },
  miniBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
});
