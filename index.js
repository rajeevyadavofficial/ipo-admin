import { registerRootComponent } from 'expo';
import App from './App';
import { setupRemoteConfig } from './utils/remoteConfig';

// Initialize Remote Config early
setupRemoteConfig();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
