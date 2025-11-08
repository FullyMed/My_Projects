import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Globe, Bell, WifiOff, Palette } from 'lucide-react-native';
import { AppSettings } from '@/types';
import { getSettings, saveSettings } from '@/services/storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    currency: 'TWD',
    notifications: true,
    offlineMode: false,
    theme: 'auto',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const currentSettings = await getSettings();
    setSettings(currentSettings);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'zh', label: '繁體中文', flag: '🇹🇼' },
    { value: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  ];

  const themeOptions = [
    { value: 'auto', label: 'Auto', icon: '⚡' },
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
  ];

  const showLanguagePicker = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        ...languageOptions.map(option => ({
          text: `${option.flag} ${option.label}`,
          onPress: () => updateSetting('language', option.value as 'en' | 'zh' | 'id'),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showThemePicker = () => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred theme',
      [
        ...themeOptions.map(option => ({
          text: `${option.icon} ${option.label}`,
          onPress: () => updateSetting('theme', option.value as 'auto' | 'light' | 'dark'),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getCurrentLanguageLabel = () => {
    const current = languageOptions.find(opt => opt.value === settings.language);
    return current ? `${current.flag} ${current.label}` : 'English';
  };

  const getCurrentThemeLabel = () => {
    const current = themeOptions.find(opt => opt.value === settings.theme);
    return current ? `${current.icon} ${current.label}` : 'Auto';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Settings size={32} color="#2563eb" strokeWidth={2} />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.settingsContainer}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={showLanguagePicker}
          >
            <View style={styles.settingLeft}>
              <Globe size={24} color="#2563eb" strokeWidth={2} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingDescription}>
                  Choose your preferred language
                </Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {getCurrentLanguageLabel()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={showThemePicker}
          >
            <View style={styles.settingLeft}>
              <Palette size={24} color="#2563eb" strokeWidth={2} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingDescription}>
                  Choose your preferred theme
                </Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {getCurrentThemeLabel()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={24} color="#2563eb" strokeWidth={2} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates and alerts
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: '#f3f4f6', true: '#93c5fd' }}
              thumbColor={settings.notifications ? '#2563eb' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <WifiOff size={24} color="#2563eb" strokeWidth={2} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Offline Mode</Text>
                <Text style={styles.settingDescription}>
                  Use cached data when offline
                </Text>
              </View>
            </View>
            <Switch
              value={settings.offlineMode}
              onValueChange={(value) => updateSetting('offlineMode', value)}
              trackColor={{ false: '#f3f4f6', true: '#93c5fd' }}
              thumbColor={settings.offlineMode ? '#2563eb' : '#9ca3af'}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data Source</Text>
            <Text style={styles.infoValue}>TDX (Transportation Data Exchange)</Text>
          </View>
        </View>
      </View>
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
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingRight: {
    marginLeft: 16,
  },
  settingValue: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
  },
});