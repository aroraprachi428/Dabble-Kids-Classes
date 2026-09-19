import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRecommendClasses, useListCoaches } from '@workspace/api-client-react';
import type { Coach, RecommendationIntent } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useBooking } from '@/context/BookingContext';
import { EmptyState, Button } from '@/components/AppUI';

type ChipKey = 'childAge' | 'activity' | 'area' | 'day' | 'timeOfDay' | 'maxPrice';
const chipLabels: Record<ChipKey, string> = {
  childAge: 'Age', activity: 'Activity', area: 'Area', day: 'Day', timeOfDay: 'Time', maxPrice: 'Budget',
};

export default function Results() {
  const params = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof params.q === 'string' ? params.q : '';
  const [q, setQ] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [intent, setIntent] = useState<RecommendationIntent | null>(null);
  const [editing, setEditing] = useState<ChipKey | null>(null);
  const [editValue, setEditValue] = useState('');
  const colors = useColors();
  const router = useRouter();
  const { selectCoach } = useBooking();
  const recommend = useRecommendClasses();
  const catalog = useListCoaches({});

  const runRecommendation = useCallback(async (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSubmittedQuery(clean);
    setQ(clean);
    try {
      const response = await recommend.mutateAsync({ data: { query: clean } });
      setIntent(response.intent);
    } catch {
      // The mutation state provides the visible error and retry affordance.
    }
  }, [recommend]);

  useEffect(() => {
    void runRecommendation(initialQuery);
    // The initial route query is intentionally submitted once only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    const byId = new Map((catalog.data ?? []).map((coach) => [coach.id, coach]));
    return (recommend.data?.results ?? [])
      .map((result) => ({ ...result, coach: byId.get(result.id) }))
      .filter((item): item is typeof item & { coach: Coach } => Boolean(item.coach))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [catalog.data, recommend.data]);

  const haptic = () => { void Haptics.selectionAsync(); };
  const intentChips = (Object.keys(chipLabels) as ChipKey[]).filter((key) => {
    const value = intent?.[key];
    return value !== null && value !== undefined && String(value).trim() !== '';
  });

  const queryFromIntent = (next: RecommendationIntent) => {
    const parts = [
      next.childAge ? `for my ${next.childAge} year old` : '',
      next.activity, next.area, next.day, next.timeOfDay,
      next.maxPrice ? `under ${next.maxPrice} rupees` : '',
    ].filter(Boolean);
    return parts.join(', ');
  };

  const openEditor = (key: ChipKey) => {
    haptic();
    setEditing(key);
    setEditValue(String(intent?.[key] ?? ''));
  };
  const saveChip = () => {
    if (!editing || !intent) return;
    const value = editValue.trim();
    const next = { ...intent };
    if (editing === 'childAge' || editing === 'maxPrice') {
      const number = Number(value);
      next[editing] = value && Number.isFinite(number) ? number : null;
    } else {
      next[editing] = value;
    }
    setEditing(null);
    haptic();
    void runRecommendation(queryFromIntent(next));
  };
  const removeChip = (key: ChipKey) => {
    if (!intent) return;
    haptic();
    const next = { ...intent, [key]: key === 'childAge' || key === 'maxPrice' ? null : '' };
    void runRecommendation(queryFromIntent(next));
  };
  const submit = () => { haptic(); void runRecommendation(q); };
  const retry = () => { haptic(); void runRecommendation(submittedQuery); };
  const refresh = () => { void Promise.all([runRecommendation(submittedQuery), catalog.refetch()]); };

  const loading = recommend.isPending || catalog.isLoading;
  const error = recommend.isError || catalog.isError;
  const listData = cards;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled={listData.length > 0}
        refreshControl={<RefreshControl refreshing={recommend.isPending || catalog.isFetching} onRefresh={refresh} tintColor={colors.primary} />}
        ListHeaderComponent={<>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>DABBLE MATCHES</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>A great fit for your child</Text>
          <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.input }]}>
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput testID="results-search" value={q} onChangeText={setQ} onSubmitEditing={submit} returnKeyType="search" style={[styles.input, { color: colors.foreground }]} placeholder="Tell us what you need" placeholderTextColor={colors.mutedForeground} />
            <Pressable testID="results-submit" accessibilityLabel="Search" onPress={submit} style={[styles.submit, { backgroundColor: colors.primary }]}><Feather name="arrow-up" size={17} color={colors.primaryForeground} /></Pressable>
          </View>
          {intentChips.length > 0 && <View style={styles.chips}>
            {intentChips.map((key) => <View key={key} style={[styles.chip, { backgroundColor: colors.accent }]}>
              <Pressable testID={`chip-edit-${key}`} onPress={() => openEditor(key)} style={styles.chipBody}>
                <Text style={[styles.chipText, { color: colors.accentForeground }]}>{chipLabels[key]}: {key === 'maxPrice' ? `≤ ₹${intent?.[key]}` : String(intent?.[key])}</Text>
                <Feather name="edit-2" size={12} color={colors.accentForeground} />
              </Pressable>
              <Pressable testID={`chip-remove-${key}`} onPress={() => removeChip(key)} hitSlop={8}><Feather name="x" size={15} color={colors.accentForeground} /></Pressable>
            </View>)}
          </View>}
          {loading && <LoadingCards colors={colors} />}
          {error && !loading && <View style={styles.state}><Feather name="cloud-off" size={28} color={colors.mutedForeground} /><Text style={[styles.stateTitle, { color: colors.foreground }]}>Couldn’t load matches</Text><Button testID="results-retry" title="Try again" onPress={retry} /></View>}
          {!loading && !error && listData.length > 0 && <Text style={[styles.count, { color: colors.mutedForeground }]}>{listData.length} vetted matches</Text>}
        </>}
        ListEmptyComponent={!loading && !error ? <EmptyState title="No recommendations yet" /> : null}
        renderItem={({ item }) => <CoachCard item={item.coach} reason={item.reason} matchScore={item.matchScore} colors={colors} onPress={() => { haptic(); selectCoach(item.coach); router.push(`/coach/${item.coach.id}`); }} />}
      />
      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.modalBackdrop}><View style={[styles.modal, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit {editing ? chipLabels[editing] : ''}</Text>
          <TextInput autoFocus value={editValue} onChangeText={setEditValue} onSubmitEditing={saveChip} style={[styles.editInput, { color: colors.foreground, borderColor: colors.input }]} placeholder="Enter a value" placeholderTextColor={colors.mutedForeground} keyboardType={editing === 'childAge' || editing === 'maxPrice' ? 'numeric' : 'default'} />
          <View style={styles.modalActions}><Pressable onPress={() => setEditing(null)}><Text style={{ color: colors.mutedForeground }}>Cancel</Text></Pressable><Button title="Apply" onPress={saveChip} /></View>
        </View></View>
      </Modal>
    </View>
  );
}

function LoadingCards({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={styles.loadingWrap}>{[1, 2].map((key) => <View key={key} style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.loadingPhoto, { backgroundColor: colors.muted }]} /><View style={{ flex: 1, gap: 8 }}><View style={[styles.loadingLine, { backgroundColor: colors.muted }]} /><View style={[styles.loadingLine, { width: '65%', backgroundColor: colors.muted }]} /><View style={[styles.loadingLine, { width: '45%', backgroundColor: colors.muted }]} /></View></View>)}</View>;
}

function CoachCard({ item, reason, matchScore, colors, onPress }: { item: Coach; reason: string; matchScore: number; colors: ReturnType<typeof useColors>; onPress: () => void }) {
  const slot = item.slots[0];
  return <Pressable testID={`coach-${item.id}`} onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
    <Image source={{ uri: item.imageUrl }} style={styles.photo} contentFit="cover" transition={150} />
    <View style={styles.cardContent}>
      <View style={styles.cardTop}><Text style={[styles.activity, { color: colors.primary }]}>{item.activity}</Text><Text style={[styles.match, { color: colors.secondaryForeground, backgroundColor: colors.secondary }]}>{Math.round(matchScore)}% match</Text></View>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.activity} class</Text>
      <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
      <Text style={[styles.venue, { color: colors.mutedForeground }]}>{item.venue} · {item.area}</Text>
      <View style={styles.meta}><Text style={[styles.rating, { color: colors.foreground }]}>★ {item.rating.toFixed(1)}</Text><Text style={[styles.price, { color: colors.foreground }]}>₹{item.price} / trial</Text></View>
      <Text style={[styles.slot, { color: colors.mutedForeground }]}>Next: {slot ? `${slot.day}, ${slot.label}` : 'Check availability'}</Text>
      <View style={[styles.reason, { backgroundColor: colors.accent }]}><Feather name="zap" size={14} color={colors.primary} /><Text style={[styles.reasonText, { color: colors.accentForeground }]}>{reason}</Text></View>
      <Text style={[styles.vetted, { color: colors.secondary }]}>Vetted ✓</Text>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, list: { padding: 20, paddingBottom: 36 }, eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 }, title: { fontSize: 28, fontWeight: '800', marginBottom: 18 }, search: { height: 52, borderWidth: 1, borderRadius: 18, paddingLeft: 14, flexDirection: 'row', alignItems: 'center', gap: 9 }, input: { flex: 1, fontSize: 14 }, submit: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 6 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }, chip: { borderRadius: 15, paddingVertical: 7, paddingLeft: 10, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }, chipBody: { flexDirection: 'row', alignItems: 'center', gap: 5 }, chipText: { fontSize: 12, fontWeight: '600' }, count: { fontSize: 12, marginTop: 18, marginBottom: 10 }, card: { borderWidth: 1, borderRadius: 22, marginBottom: 14, overflow: 'hidden', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }, photo: { width: '100%', height: 155 }, cardContent: { padding: 14 }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, activity: { fontSize: 12, fontWeight: '700' }, match: { fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 }, cardTitle: { fontSize: 18, fontWeight: '800', marginTop: 8 }, name: { fontSize: 14, fontWeight: '700', marginTop: 8 }, venue: { fontSize: 12, marginTop: 3 }, meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }, rating: { fontSize: 12, fontWeight: '700' }, price: { fontSize: 13, fontWeight: '800' }, slot: { fontSize: 12, marginTop: 7 }, vetted: { fontSize: 12, fontWeight: '800', marginTop: 10 }, reason: { flexDirection: 'row', gap: 7, alignItems: 'flex-start', borderRadius: 12, padding: 10, marginTop: 12 }, reasonText: { flex: 1, fontSize: 12, lineHeight: 17 }, state: { alignItems: 'center', padding: 30, gap: 10 }, stateTitle: { fontSize: 17, fontWeight: '700' }, loadingWrap: { gap: 12, marginTop: 18 }, loadingCard: { height: 140, borderWidth: 1, borderRadius: 22, padding: 14, flexDirection: 'row', gap: 12 }, loadingPhoto: { width: 112, borderRadius: 14 }, loadingLine: { height: 12, borderRadius: 6, width: '80%' }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 }, modal: { borderRadius: 22, padding: 20 }, modalTitle: { fontSize: 19, fontWeight: '800', marginBottom: 14 }, editInput: { height: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13 }, modalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 20, marginTop: 14 },
});