import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';

export default function Home() {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <View style={styles.lockBadge}>
          <Text style={styles.lockEmoji}>🔐</Text>
        </View>
        <Text style={styles.title}>Şifre Kutusu</Text>
        <Text style={styles.subtitle}>
          Kartlardan şifreyi çöz, telefona gir, final sorusunda rakibini geç.
        </Text>
      </View>

      <View style={styles.rules}>
        <RuleRow n="1" text="Öğretmen oyunu kurar." />
        <RuleRow n="2" text="Oyuncular kartlardan şifreyi çözer." />
        <RuleRow n="3" text="Doğru şifre final sorusunu açar." />
        <RuleRow n="4" text="Sözlü cevabı öğretmen değerlendirir." />
      </View>

      <View style={{ flex: 1 }} />

      <ActionButton
        label="Oyunu Kur"
        variant="primary"
        fullWidth
        onPress={() => router.push('/setup')}
      />
    </ScreenContainer>
  );
}

function RuleRow({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.rule}>
      <View style={styles.ruleNum}>
        <Text style={styles.ruleNumText}>{n}</Text>
      </View>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  lockBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.highlight,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lockEmoji: { fontSize: 48 },
  title: {
    fontSize: Font.title + 4,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Font.body,
    color: Colors.muted,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: Font.body * 1.4,
  },
  rules: { marginTop: Spacing.xl, gap: Spacing.md },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ruleNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumText: { color: '#fff', fontWeight: '800' },
  ruleText: { color: Colors.text, fontSize: Font.body, flex: 1 },
});
