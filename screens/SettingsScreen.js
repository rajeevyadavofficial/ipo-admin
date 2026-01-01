import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen({ apiUrl, onBack }) {
  const [morningTime, setMorningTime] = useState('10:00');
  const [eveningTime, setEveningTime] = useState('19:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/settings`);
      const data = await response.json();
      if (data.success && data.data) {
        setMorningTime(data.data.morningTime);
        setEveningTime(data.data.eveningTime);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      Alert.alert('Error', 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Basic validation
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(morningTime) || !timeRegex.test(eveningTime)) {
      Alert.alert('Invalid Format', 'Please use HH:mm format (e.g., 10:30)');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ morningTime, eveningTime }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Notification settings updated');
      } else {
        Alert.alert('Error', data.error || 'Failed to update settings');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#6200EE" />
            <Text style={styles.infoText}>
              Set the times when notifications will be sent to users about open IPOs. 
              Times are in Nepal Time (NPT).
            </Text>
          </View>

          <Text style={styles.label}>Morning Notification Time (NPT)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="sunny-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={morningTime}
              onChangeText={setMorningTime}
              placeholder="10:00"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <Text style={styles.helper}>Use 24-hour format HH:mm (e.g., 09:30)</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Evening Notification Time (NPT)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="moon-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={eveningTime}
              onChangeText={setEveningTime}
              placeholder="19:00"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <Text style={styles.helper}>Use 24-hour format HH:mm (e.g., 18:45)</Text>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.disabledButton]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Settings</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6200EE',
    lineHeight: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  helper: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
