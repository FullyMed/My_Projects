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
import { Heart, Plus, Trash2 } from 'lucide-react-native';
import { FavoriteRoute } from '@/types';
import { getFavorites, removeFavorite } from '@/services/storage';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoritesList = await getFavorites();
      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this favorite route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(favoriteId);
            loadFavorites();
          },
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteRoute }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteHeader}>
        <Heart size={20} color="#ef4444" fill="#ef4444" strokeWidth={2} />
        <Text style={styles.favoriteName}>{item.name}</Text>
        <TouchableOpacity
          onPress={() => handleRemoveFavorite(item.id)}
          style={styles.removeButton}
        >
          <Trash2 size={18} color="#ef4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.routeInfo}>
        <Text style={styles.routeText}>
          {item.origin.name} → {item.destination.name}
        </Text>
        <Text style={styles.cityText}>
          {item.origin.city} to {item.destination.city}
        </Text>
      </View>

      <View style={styles.transportModes}>
        {item.transportModes.map((modeId, index) => (
          <View key={modeId} style={styles.modeTag}>
            <Text style={styles.modeTagText}>
              {modeId.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.favoriteFooter}>
        <Text style={styles.dateText}>
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.dateText}>
          Last used: {new Date(item.lastUsed).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Heart size={64} color="#e5e7eb" strokeWidth={1} />
      <Text style={styles.emptyTitle}>No Favorite Routes</Text>
      <Text style={styles.emptySubtitle}>
        Save your frequently used routes for quick access
      </Text>
      <TouchableOpacity style={styles.addButton}>
        <Plus size={20} color="#2563eb" strokeWidth={2} />
        <Text style={styles.addButtonText}>Add Your First Favorite</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Heart size={32} color="#ef4444" fill="#ef4444" strokeWidth={2} />
        <Text style={styles.title}>My Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {favorites.length} Saved Route{favorites.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
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
  favoriteCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoriteName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  routeInfo: {
    marginBottom: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  transportModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  modeTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  modeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dateText: {
    fontSize: 12,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
});