import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  const colors = useColors();
  return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /><Text style={[styles.muted, { color: colors.mutedForeground }]}>{label}</Text></View>;
}
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const colors = useColors();
  return <View style={styles.center}><Feather name="cloud-off" size={30} color={colors.mutedForeground} /><Text style={[styles.heading, { color: colors.foreground }]}>Couldn’t load that</Text><Text style={[styles.muted, { color: colors.mutedForeground }]}>Check your connection and try again.</Text><Button title="Try again" onPress={onRetry} /></View>;
}
export function EmptyState({ title = 'No coaches found' }: { title?: string }) {
  const colors = useColors();
  return <View style={styles.center}><Feather name="search" size={30} color={colors.secondary} /><Text style={[styles.heading, { color: colors.foreground }]}>{title}</Text><Text style={[styles.muted, { color: colors.mutedForeground }]}>Try a different activity or area.</Text></View>;
}
export function Button({ title, onPress, disabled, secondary = false, testID }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; testID?: string }) {
  const colors = useColors();
  return <Pressable testID={testID} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: secondary ? colors.muted : colors.primary, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}><Text style={[styles.buttonText, { color: secondary ? colors.foreground : colors.primaryForeground }]}>{title}</Text></Pressable>;
}
export const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 28 },
  heading: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  muted: { fontSize: 14, textAlign: 'center' },
  button: { minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, marginTop: 8 },
  buttonText: { fontSize: 15, fontWeight: '700' },
});