import 'react-native-gesture-handler';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameProvider } from './src/context/GameContext';
import { AudioProvider, useAudio } from './src/context/AudioContext';
import {
  SplashScreen,
  HomeScreen,
  LearningGoalsScreen,
  InstructionsScreen,
  SystemSelectScreen,
  Level1Screen,
  Level2Screen,
  Level3Screen,
  Level4Screen,
  ResultsScreen,
} from './src/screens';
import { COLORS } from './src/constants/colors';
import { HeartsModal, HeartLossAnimation } from './src/components';

const Stack = createNativeStackNavigator();

const HEARTS_HIDDEN_SCREENS = ['Splash', 'Home', 'LearningGoals', 'Instructions'];

const MusicManager = ({ currentRoute }) => {
  const { playMusic, stopMusic, pauseMusic, resumeMusic } = useAudio();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        pauseMusic();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        resumeMusic();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [pauseMusic, resumeMusic]);

  useEffect(() => {
    if (!currentRoute || currentRoute === 'Splash') return;
    playMusic();
  }, [currentRoute, playMusic]);

  return null;
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('Splash');
  const navigationRef = useRef(null);

  const onStateChange = () => {
    const route = navigationRef.current?.getCurrentRoute();
    if (route) setCurrentRoute(route.name);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AudioProvider>
        <GameProvider>
          <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'fade_from_bottom',
                animationDuration: 250,
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen 
                name="LearningGoals" 
                component={LearningGoalsScreen}
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerBackTitle: 'Back',
                  headerTransparent: true,
                  headerTintColor: COLORS.primary,
                }}
              />
              <Stack.Screen 
                name="Instructions" 
                component={InstructionsScreen}
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerBackTitle: 'Back',
                  headerTransparent: true,
                  headerTintColor: COLORS.primary,
                }}
              />
              <Stack.Screen 
                name="SystemSelect" 
                component={SystemSelectScreen}
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerBackTitle: 'Back',
                  headerTransparent: true,
                  headerTintColor: COLORS.primary,
                }}
              />
              <Stack.Screen name="Level1" component={Level1Screen} />
              <Stack.Screen name="Level2" component={Level2Screen} />
              <Stack.Screen name="Level3" component={Level3Screen} />
              <Stack.Screen name="Level4" component={Level4Screen} />
              <Stack.Screen 
                name="Results" 
                component={ResultsScreen}
                options={{
                  gestureEnabled: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <MusicManager currentRoute={currentRoute} />
          <HeartsModal visible={!HEARTS_HIDDEN_SCREENS.includes(currentRoute)} />
          <HeartLossAnimation />
        </GameProvider>
      </AudioProvider>
    </GestureHandlerRootView>
  );
}
