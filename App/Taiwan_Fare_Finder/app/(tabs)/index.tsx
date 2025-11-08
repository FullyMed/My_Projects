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
import { ArrowUpDown, Search } from 'lucide-react-native';
import { Location, TransportMode, FareResult } from '@/types';
import { tdxApi } from '@/services/tdxApi';
import { getSettings, addToSearchHistory, cacheResult } from '@/services/storage';
import { getTranslation } from '@/utils/i18n';
import LocationPicker from '@/components/LocationPicker';
import FareResultCard from '@/components/FareResultCard';

export default function SearchScreen() {
  const [origin, setOrigin] = useState<Location | undefined>();
  const [destination, setDestination] = useState<Location | undefined>();
  const [selectedMode, setSelectedMode] = useState<TransportMode | undefined>();
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [result, setResult] = useState<FareResult | undefined>();
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
      setSelectedMode(response.data[0]); // Default to first mode
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async () => {
    if (!origin || !destination || !selectedMode) {
      Alert.alert('Error', 'Please select origin, destination, and transport mode');
      return;
    }

    setLoading(true);
    setResult(undefined);

    try {
      const response = await tdxApi.searchFares(origin, destination, selectedMode);
      
      if (response.success && response.data) {
        setResult(response.data);
        
        // Save to history and cache
        await addToSearchHistory({
          id: `${Date.now()}`,
          origin,
          destination,
          transportMode: selectedMode,
          searchDate: new Date().toISOString(),
          result: response.data,
        });
        
        await cacheResult(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to search fares');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search fares');
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string) => getTranslation(language, key as any);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('fareSearch')}</Text>
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
            <Text style={styles.label}>{t('transportMode')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.transportModeList}
            >
              {transportModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.transportModeButton,
                    selectedMode?.id === mode.id && {
                      backgroundColor: mode.color,
                      borderColor: mode.color,
                    },
                  ]}
                  onPress={() => setSelectedMode(mode)}
                >
                  <Text
                    style={[
                      styles.transportModeText,
                      selectedMode?.id === mode.id && styles.transportModeTextActive,
                    ]}
                  >
                    {mode.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.searchButton,
              (!origin || !destination || !selectedMode || loading) && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!origin || !destination || !selectedMode || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Search size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.searchButtonText}>{t('searchFares')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Search Result</Text>
            <FareResultCard
              result={result}
              showFavoriteButton={false}
            />
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
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
  transportModeList: {
    marginTop: 8,
  },
  transportModeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  transportModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  transportModeTextActive: {
    color: '#ffffff',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  searchButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultSection: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
});