import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import IPOListScreen from './screens/IPOListScreen';
import SettingsScreen from './screens/SettingsScreen';

const API_BASE_URL = 'https://ipo-backend-d8nv.onrender.com/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('IPOList');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : currentScreen === 'IPOList' ? (
        <IPOListScreen 
          apiUrl={API_BASE_URL} 
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      ) : (
        <SettingsScreen 
          apiUrl={API_BASE_URL} 
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
