import { Fonts, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { gerarBackup, restaurarBackup } from '@/shared/storage';
import { Button, Screen, ScreenHeader, Section, Surface } from '@/shared/ui';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function BackupScreen() {
  const router = useRouter();
  const colors = useTheme();
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'ok' | 'erro' } | null>(null);
  const [confirmandoImport, setConfirmandoImport] = useState(false);

  async function handleExportar() {
    setExportando(true);
    setMensagem(null);
    try {
      const json = await gerarBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const data = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-meu-cartao-${data}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMensagem({ texto: 'Backup exportado com sucesso!', tipo: 'ok' });
    } catch (e) {
      setMensagem({ texto: 'Erro ao exportar o backup.', tipo: 'erro' });
    } finally {
      setExportando(false);
    }
  }

  async function handleImportar() {
    setImportando(true);
    setMensagem(null);
    setConfirmandoImport(false);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) { setImportando(false); return; }
        const texto = await file.text();
        try {
          await restaurarBackup(texto);
          setMensagem({ texto: 'Backup restaurado! Reiniciando o app...', tipo: 'ok' });
          setTimeout(() => router.replace('/'), 1500);
        } catch {
          setMensagem({ texto: 'Arquivo inválido. Verifique se é um backup correto.', tipo: 'erro' });
          setImportando(false);
        }
      };
      input.click();
    } catch {
      setMensagem({ texto: 'Erro ao importar o backup.', tipo: 'erro' });
      setImportando(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title="Backup"
        subtitle="Exportar e restaurar seus dados"
        onBack={() => router.back()}
      />

      <Section title="Exportar dados">
        <Surface>
          <Text style={{ color: colors.text, fontFamily: Fonts.sans, fontSize: Type.body, lineHeight: 22, marginBottom: Spacing.three }}>
            Gera um arquivo <Text style={{ fontFamily: Fonts.sansSemiBold }}>.json</Text> com
            todas as suas informações: perfil, compras, histórico de faturas e extratos.
            Guarde esse arquivo em um lugar seguro (Google Drive, iCloud, etc).
          </Text>
          <Button
            label={exportando ? 'Exportando...' : '⬇️  Exportar backup'}
            variant="primary"
            onPress={handleExportar}
          />
        </Surface>
      </Section>

      <Section title="Restaurar dados">
        <Surface tone="warning">
          <Text style={{ color: colors.warning, fontFamily: Fonts.sans, fontSize: Type.body, lineHeight: 22, marginBottom: Spacing.three }}>
            ⚠️ Restaurar um backup <Text style={{ fontFamily: Fonts.sansSemiBold }}>substitui todos os dados atuais</Text> do app.
            Esta ação não pode ser desfeita.
          </Text>

          {confirmandoImport ? (
            <View style={{ gap: Spacing.two }}>
              <Text style={{ color: colors.warning, fontFamily: Fonts.sansSemiBold, fontSize: Type.body, textAlign: 'center' }}>
                Tem certeza? Os dados atuais serão substituídos.
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <Button
                  label={importando ? 'Restaurando...' : 'Sim, restaurar'}
                  variant="warning"
                  onPress={handleImportar}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Cancelar"
                  variant="ghost"
                  onPress={() => setConfirmandoImport(false)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <Button
              label="⬆️  Restaurar backup"
              variant="warning"
              onPress={() => setConfirmandoImport(true)}
            />
          )}
        </Surface>
      </Section>

      {mensagem && (
        <Surface tone={mensagem.tipo === 'ok' ? 'success' : 'danger'} style={{ marginTop: Spacing.two }}>
          <Text style={{
            color: mensagem.tipo === 'ok' ? colors.success : colors.danger,
            fontFamily: Fonts.sansSemiBold,
            fontSize: Type.body,
            textAlign: 'center',
          }}>
            {mensagem.texto}
          </Text>
        </Surface>
      )}
    </Screen>
  );
}