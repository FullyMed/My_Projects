import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { History, Trash2, Search } from 'lucide-react-native';
import { SearchHistoryItem } from '@/types';
import { getSearchHistory, clearSearchHistory } from '@/services/storage';
import FareResultCard from '@/components/FareResultCard';

export default function HistoryScreen() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setLoading(true);
    try {
      const historyList = await getSearchHistory();
      setHistory(historyList);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearSearchHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.searchInfo}>
          <Text style={styles.searchDate}>
            {new Date(item.searchDate).toLocaleDateString()} at{' '}
            {new Date(item.searchDate).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={styles.transportMode}>
            {item.transportMode.name}
          </Text>
        </View>
      </View>

      {item.result ? (
        <FareResultCard 
          result={item.result} 
          showFavoriteButton={false}
        />
      ) : (
        <View style={styles.noResultCard}>
          <Text style={styles.routeText}>
            {item.origin.name} → {item.destination.name}
          </Text>
          <Text style={styles.noResultText}>Search failed or no result</Text>
        </View>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <History size={64} color="#e5e7eb" strokeWidth={1} />
      <Text style={styles.emptyTitle}>No Search History</Text>
      <Text style={styles.emptySubtitle}>
        Your recent fare searches will appear here
      </Text>
      <TouchableOpacity style={styles.searchButton}>
        <Search size={20} color="#2563eb" strokeWidth={2} />
        <Text style={styles.searchButtonText}>Start Searching</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <History size={32} color="#2563eb" strokeWidth={2} />
          <Text style={styles.title}>Search History</Text>
        </View>
        
        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.clearButton}
          >
            <Trash2 size={20} color="#ef4444" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {history.length} Recent Search{history.length !== 1 ? 'es' : ''}
            </Text>
          </View>

          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyHeader: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchDate: {
    fontSize: 14,
    color: '#64748b',
  },
  transportMode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  noResultCard: {
    padding: 16,
    alignItems: 'center',
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  noResultText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  searchButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
});