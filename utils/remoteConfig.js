import remoteConfig from '@react-native-firebase/remote-config';

export const setupRemoteConfig = async () => {
  try {
    // Set default values
    await remoteConfig().setDefaults({
      backend_api_url: 'https://ipo-backend-zzjb.onrender.com/api',
    });

    // For testing and reliability, fetch and activate instantly
    // In production, consider a longer interval
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: 0, 
    });

    const fetched = await remoteConfig().fetchAndActivate();
    if (fetched) {
      console.log('✅ [Admin] Remote Config fetched and activated');
    } else {
      console.log('ℹ️ [Admin] Remote Config already up to date');
    }
  } catch (error) {
    console.error('❌ [Admin] Remote Config error:', error);
  }
};

export const getApiBaseUrl = () => {
  const url = remoteConfig().getValue('backend_api_url').asString();
  return url;
};
