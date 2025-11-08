import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, ArrowUpDown } from 'lucide-react-native';
import { Location, TransportMode, FareResult } from '@/types';
import { tdxApi } from '@/services/tdxApi';
import { getSettings } from '@/services/storage';
import { getTranslation } from '@/utils/i18n';
import LocationPicker from '@/components/LocationPicker';
import FareResultCard from '@/components/FareResultCard';

export default function CompareScreen() {
  const [origin, setOrigin] = useState<Location | undefined>();
  const [destination, setDestination] = useState<Location | undefined>();
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [results, setResults] = useState<FareResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'zh' | 'id'>('en');

  useEffect(() => {
    loadTransportModes();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setLanguage(settings.language);
  };

  const loadTransportModes = async () => {
    const response = await tdxApi.getTransportModes();
    if (response.success && response.data) {
      setTransportModes(response.data);
      // Select first 3 modes by default
      setSelectedModes(response.data.slice(0, 3).map(m => m.id));
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const toggleTransportMode = (modeId: string) => {
    setSelectedModes(prev => {
      if (prev.includes(modeId)) {
        return prev.filter(id => id !== modeId);
      } else {
        return [...prev, modeId];
      }
    });
  };

  const handleCompare = async () => {
    if (!origin || !destination || selectedModes.length === 0) {
      Alert.alert('Error', 'Please select origin, destination, and at least one transport mode');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const selectedTransportModes = transportModes.filter(mode => 
        selectedModes.includes(mode.id)
      );

      const response = await tdxApi.getMultiModalFares(
        origin,
        destination,
        selectedTransportModes
      );

      if (response.success && response.data) {
        // Sort by adult price (ascending)
        const sortedResults = response.data.sort((a, b) => {
          const priceA = a.pricing.find(p => p.type === 'adult')?.price || 0;
          const priceB = b.pricing.find(p => p.type === 'adult')?.price || 0;
          return priceA - priceB;
        });
        setResults(sortedResults);
      } else {
        Alert.alert('Error', response.error || 'Failed to compare fares');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to compare fares');
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string) => getTranslation(language, key as any);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BarChart3 size={32} color="#2563eb" strokeWidth={2} />
          <Text style={styles.title}>Fare Comparison</Text>
        </View>

        <View style={styles.searchForm}>
          <View style={styles.locationInputs}>
            <View style={styles.locationRow}>
              <Text style={styles.label}>{t('from')}</Text>
              <LocationPicker
                value={origin}
                placeholder={t('selectOrigin')}
                onSelect={setOrigin}
              />
            </View>

            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwapLocations}
            >
              <ArrowUpDown size={20} color="#2563eb" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.locationRow}>
              <Text style={styles.label}>{t('to')}</Text>
              <LocationPicker
                value={destination}
                placeholder={t('selectDestination')}
                onSelect={setDestination}
              />
            </View>
          </View>

          <View style={styles.transportModeSection}>
            <Text style={styles.label}>Select Transport Modes</Text>
            <View style={styles.transportModeGrid}>
              {transportModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.transportModeCard,
                    selectedModes.includes(mode.id) && {
                      backgroundColor: mode.color,
                      borderColor: mode.color,
                    },
                  ]}
                  onPress={() => toggleTransportMode(mode.id)}
                >
                  <View
                    style={[
                      styles.modeIcon,
                      selectedModes.includes(mode.id) 
                        ? { backgroundColor: 'rgba(255,255,255,0.3)' }
                        : { backgroundColor: mode.color }
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeIconText,
                        selectedModes.includes(mode.id) && styles.modeIconTextActive
                      ]}
                    >
                      {mode.name.charAt(0)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.modeCardText,
                      selectedModes.includes(mode.id) && styles.modeCardTextActive,
                    ]}
                  >
                    {mode.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.compareButton,
              (!origin || !destination || selectedModes.length === 0 || loading) && 
              styles.compareButtonDisabled,
            ]}
            onPress={handleCompare}
            disabled={!origin || !destination || selectedModes.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <BarChart3 size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.compareButtonText}>Compare Fares</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Comparison Results</Text>
              <Text style={styles.resultSubtitle}>
                Sorted by price (lowest first)
              </Text>
            </View>
            
            {results.map((result, index) => (
              <View key={result.id} style={styles.resultItemContainer}>
                {index === 0 && (
                  <View style={styles.bestPriceBadge}>
                    <Text style={styles.bestPriceText}>Best Price</Text>
                  </View>
                )}
                <FareResultCard
                  result={result}
                  showFavoriteButton={false}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  searchForm: {
    padding: 20,
  },
  locationInputs: {
    marginBottom: 24,
  },
  locationRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  swapButton: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2563eb',
    marginVertical: 8,
  },
  transportModeSection: {
    marginBottom: 24,
  },
  transportModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  transportModeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modeIconTextActive: {
    color: '#ffffff',
  },
  modeCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  modeCardTextActive: {
    color: '#ffffff',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  compareButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  compareButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultSection: {
    marginTop: 20,
  },
  resultHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  resultItemContainer: {
    position: 'relative',
  },
  bestPriceBadge: {
    position: 'absolute',
    top: 0,
    right: 24,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  bestPriceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});