import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationScreen = ({ apiUrl, onBack }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }

    Alert.alert(
      'Confirm Send',
      'Are you sure you want to send this notification to ALL registered devices?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${apiUrl}/api/notifications/send-custom`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title: title.trim(),
                  body: message.trim(),
                  secret: 'ipo_alert_2025' // Matching backend secret
                }),
              });

              const result = await response.json();

              if (result.success) {
                Alert.alert(
                  'Success', 
                  `Notification sent successfully!\nDevices: ${result.stats.devices}\nSent: ${result.stats.sent}`
                );
                setTitle('');
                setMessage('');
              } else {
                throw new Error(result.error || 'Failed to send notification');
              }
            } catch (error) {
              console.error('Send error:', error);
              Alert.alert('Error', error.message || 'Failed to send notification');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#0d6efd" />
          <Text style={styles.infoText}>
            This message will be sent instantly to all users who have registered their devices for notifications.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notification Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. New IPO Alert! 📢"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message Body</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your custom message here..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.disabledButton]}
          onPress={handleSendNotification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.sendButtonText}>Send to All Devices</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Note: Please be careful with custom messages. Ensure they are professional and helpful to the users.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#e7f1ff',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#b6d4fe',
  },
  infoText: {
    color: '#084298',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 120,
  },
  sendButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buttonIcon: {
    marginRight: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerNote: {
    marginTop: 30,
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  }
});

export default NotificationScreen;
