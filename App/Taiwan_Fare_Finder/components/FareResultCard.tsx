import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, ArrowRight, Heart } from 'lucide-react-native';
import { FareResult } from '@/types';

interface FareResultCardProps {
  result: FareResult;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
}

export default function FareResultCard({
  result,
  onPress,
  onToggleFavorite,
  isFavorite = false,
  showFavoriteButton = true,
}: FareResultCardProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const adultPrice = result.pricing.find(p => p.type === 'adult')?.price || 0;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: result.transportMode.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.transportInfo}>
          <View
            style={[styles.transportIcon, { backgroundColor: result.transportMode.color }]}
          >
            <Text style={styles.transportIconText}>
              {result.transportMode.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.transportName}>{result.transportMode.name}</Text>
        </View>
        
        {showFavoriteButton && (
          <TouchableOpacity
            onPress={onToggleFavorite}
            style={styles.favoriteButton}
          >
            <Heart
              size={20}
              color={isFavorite ? '#ef4444' : '#9ca3af'}
              fill={isFavorite ? '#ef4444' : 'none'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.routeInfo}>
        <Text style={styles.locationText}>{result.origin.name}</Text>
        <ArrowRight size={16} color="#6b7280" strokeWidth={2} />
        <Text style={styles.locationText}>{result.destination.name}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Adult</Text>
          <Text style={styles.price}>NT${adultPrice}</Text>
        </View>

        <View style={styles.timeContainer}>
          <Clock size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.timeText}>{formatTime(result.travelTime)}</Text>
        </View>
      </View>

      {result.pricing.length > 1 && (
        <View style={styles.pricingTiers}>
          {result.pricing
            .filter(p => p.type !== 'adult')
            .map((tier) => (
              <View key={tier.type} style={styles.tierItem}>
                <Text style={styles.tierType}>
                  {tier.type.charAt(0).toUpperCase() + tier.type.slice(1)}
                </Text>
                <Text style={styles.tierPrice}>NT${tier.price}</Text>
              </View>
            ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transportIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transportIconText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  transportName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  favoriteButton: {
    padding: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  pricingTiers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  tierItem: {
    alignItems: 'center',
  },
  tierType: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});