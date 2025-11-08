import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { X, MapPin } from 'lucide-react-native';
import { Location } from '@/types';
import { tdxApi } from '@/services/tdxApi';

interface LocationPickerProps {
  value?: Location;
  placeholder: string;
  onSelect: (location: Location) => void;
}

export default function LocationPicker({ value, placeholder, onSelect }: LocationPickerProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      searchLocations();
    } else {
      setLocations([]);
    }
  }, [query]);

  const searchLocations = async () => {
    setLoading(true);
    try {
      const response = await tdxApi.searchLocations(query);
      if (response.success && response.data) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (location: Location) => {
    onSelect(location);
    setVisible(false);
    setQuery('');
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleSelect(item)}
    >
      <MapPin size={20} color="#6b7280" strokeWidth={2} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationCity}>{item.city}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setVisible(true)}
      >
        <MapPin size={20} color="#6b7280" strokeWidth={2} />
        <Text style={value ? styles.selectedText : styles.placeholderText}>
          {value ? value.name : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{placeholder}</Text>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search locations..."
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={locations}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.id}
            style={styles.locationList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  placeholderText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  modal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  locationCity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});