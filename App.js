import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import IPOListScreen from './screens/IPOListScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationScreen from './screens/NotificationScreen';

import { getApiBaseUrl } from './config';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('IPOList');

  const apiUrl = getApiBaseUrl();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : currentScreen === 'IPOList' ? (
        <IPOListScreen 
          apiUrl={apiUrl} 
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      ) : currentScreen === 'Notifications' ? (
        <NotificationScreen 
          apiUrl={apiUrl} 
          onBack={() => setCurrentScreen('IPOList')}
        />
      ) : (
        <SettingsScreen 
          apiUrl={apiUrl} 
          onBack={() => setCurrentScreen('IPOList')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
