// ==========================================
// WatchWise — Watch Providers
// ==========================================
// Where to stream, rent, or buy a movie, by country. Data comes
// from JustWatch via TMDB, which requires attribution wherever
// this data is shown.

import { IMAGE_SIZES } from '@/constants/config';
import { DEFAULT_REGION, REGIONS } from '@/constants/regions';
import { useThemeContext } from '@/context/ThemeContext';
import { getSavedWatchRegion, saveWatchRegion } from '@/services/preferences';
import { WatchProvider, WatchProviderRegion, getWatchProviders } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface WatchProvidersProps {
  movieId: number;
}

const SECTIONS: { key: keyof WatchProviderRegion; label: string }[] = [
  { key: 'flatrate', label: 'Stream' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
];

export default function WatchProviders({ movieId }: WatchProvidersProps) {
  const { colors } = useThemeContext();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [data, setData] = useState<WatchProviderRegion | null>(null);
  const [loading, setLoading] = useState(true);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSavedWatchRegion().then((saved) => {
      if (!cancelled && saved) setRegion(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const result = await getWatchProviders(movieId, region);
        if (!cancelled) setData(result);
      } catch (err) {
        console.error('Error loading watch providers:', err);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId, region]);

  const handleSelectRegion = useCallback((code: string) => {
    setRegion(code);
    setRegionPickerOpen(false);
    saveWatchRegion(code);
  }, []);

  const regionName = REGIONS.find((r) => r.code === region)?.name ?? region;
  const hasAnyProvider = data && SECTIONS.some((s) => (data[s.key] as WatchProvider[] | undefined)?.length);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Where to Watch</Text>
        <Pressable
          onPress={() => setRegionPickerOpen(true)}
          style={[styles.regionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={`Region: ${regionName}. Tap to change.`}
          hitSlop={8}
        >
          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
          <Text style={[styles.regionButtonText, { color: colors.textSecondary }]}>{regionName}</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : !hasAnyProvider ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No streaming info available for {regionName} yet.
        </Text>
      ) : (
        <View style={styles.sections}>
          {SECTIONS.map(({ key, label }) => {
            const providers = data?.[key] as WatchProvider[] | undefined;
            if (!providers || providers.length === 0) return null;
            return (
              <View key={key} style={styles.providerSection}>
                <Text style={[styles.providerLabel, { color: colors.textMuted }]}>{label}</Text>
                <View style={styles.logoRow}>
                  {providers.map((provider) => (
                    <View
                      key={provider.provider_id}
                      style={[styles.logoContainer, { backgroundColor: colors.surfaceLight }]}
                    >
                      <Image
                        source={{ uri: `${IMAGE_SIZES.logo.small}${provider.logo_path}` }}
                        style={styles.logo}
                        contentFit="cover"
                        accessibilityLabel={provider.provider_name}
                      />
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          <Text style={[styles.attribution, { color: colors.textMuted }]}>
            Streaming data provided by JustWatch
          </Text>
        </View>
      )}

      <Modal
        visible={regionPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRegionPickerOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setRegionPickerOpen(false)}
          accessibilityLabel="Close region picker"
        >
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose a region</Text>
            <ScrollView style={styles.modalList}>
              {REGIONS.map((r) => {
                const active = r.code === region;
                return (
                  <Pressable
                    key={r.code}
                    onPress={() => handleSelectRegion(r.code)}
                    style={styles.modalOption}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: active ? colors.primary : colors.text },
                        active && styles.modalOptionTextActive,
                      ]}
                    >
                      {r.name}
                    </Text>
                    {active && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  regionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loading: {
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sections: {
    gap: 14,
  },
  providerSection: {
    gap: 8,
  },
  providerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  logoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  logoContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  attribution: {
    fontSize: 10,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalList: {
    maxHeight: 360,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  modalOptionText: {
    fontSize: 15,
  },
  modalOptionTextActive: {
    fontWeight: '700',
  },
});
