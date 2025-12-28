/**
 * Nostr TV App
 */

import { TextEncoder, TextDecoder } from 'text-encoding';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// ---- Polyfills ----
global.Buffer = global.Buffer || Buffer;
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

// ---- React / RN ----
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ---- Navigation ----
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ---- Screens ----
import AppContent from './AppContent';
import TopicNotesScreen from './screens/TopicNotesScreen';

export type RootStackParamList = {
  Topics: undefined;
  TopicNotes: { tag: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // TV looks nicer without headers
          }}
        >
          <Stack.Screen name="Topics" component={AppContent} />
          <Stack.Screen name="TopicNotes" component={TopicNotesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
