import { useRouter } from 'expo-router';

import { ImportarExtratoPanel } from '@/features/extrato/ui/importar-extrato-panel';
import type { ResultadoImportacaoExtrato } from '@/features/extrato/types';
import {
  carregarPerfil,
  mesclarLancamentosExtrato,
  salvarPerfil,
} from '@/shared/storage';
import { Screen, ScreenHeader } from '@/shared/ui';

export function ImportarExtratoScreen() {
  const router = useRouter();

  async function handleAplicar(resultado: ResultadoImportacaoExtrato) {
    await mesclarLancamentosExtrato(resultado.lancamentos);

    const { renda } = resultado;
    if (renda.salarioLiquido > 0) {
      const perfil = await carregarPerfil();
      if (perfil) {
        await salvarPerfil({
          ...perfil,
          salarioLiquido: renda.salarioLiquido,
          outrasRendas: renda.outrasRendas,
          historicoRendas: mergeHistorico(
            perfil.historicoRendas,
            renda.historicoRendas
          ),
        });
      }
    }

    router.replace('/dashboard');
  }

  return (
    <Screen>
      <ScreenHeader
        title="Importar extratos"
        subtitle="Adicione meses novos sem apagar os anteriores"
        onBack={() => router.back()}
      />
      <ImportarExtratoPanel
        onAplicar={handleAplicar}
        onCancelar={() => router.back()}
        labelConfirmar="Salvar no painel"
      />
    </Screen>
  );
}

function mergeHistorico(
  atuais: { mes: string; total: number }[],
  novos: { mes: string; total: number }[]
): { mes: string; total: number }[] {
  const mapa = new Map(atuais.map((h) => [h.mes, h.total]));
  for (const n of novos) {
    mapa.set(n.mes, n.total);
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));
}
