# STASIS: Balance Within

A game-based learning mobile app for teaching homeostasis concepts to Grade 8-9 Science students (MATATAG-aligned).

## Overview

**STASIS** (Balance Within) is an educational management/simulation game that helps learners understand:
- Homeostasis as a process of dynamic balance
- Components of feedback mechanisms (stimulus → receptor → control center → effector → response)
- Negative feedback loops
- Effects of imbalance in body systems

## Features

### Game Levels

1. **Level 1: Thermoregulation** - Maintain normal body temperature (36.5-37.5°C)
2. **Level 2: Water Balance** - Maintain proper hydration levels
3. **Level 3: Blood Sugar Regulation** - Stabilize blood glucose levels
4. **Level 4: System Interaction** - Manage multiple systems with simulated failures (e.g., insulin response disabled)

### Visual Design

- **Flat 2D** clean, minimal interface
- **Color-coded states** for learning:
  - 🟢 Green = Normal/Balanced
  - 🔴 Red = High/Excess
  - 🔵 Blue = Low/Deficiency

### Gameplay Mechanics

- Dynamic meters that change even without player input (reinforces continuous nature of homeostasis)
- Real-time feedback with educational messages
- Hint system (reduces star score when used)
- 3 stability lives per level
- Star-based scoring (1-3 stars)

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: React Navigation
- **Animations**: React Native Reanimated
- **Storage**: AsyncStorage (offline support)
- **Haptics**: Expo Haptics

## Installation

```bash
# Navigate to project directory
cd balance-within

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Project Structure

```
balance-within/
├── App.js                 # Main app entry with navigation
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AnimatedButton.js
│   │   ├── ActionButton.js
│   │   ├── BodySilhouette.js
│   │   ├── Confetti.js
│   │   ├── LivesDisplay.js
│   │   ├── StarsDisplay.js
│   │   └── StatusMeter.js
│   ├── constants/
│   │   ├── colors.js      # Color definitions
│   │   └── gameData.js    # Game content & stimuli
│   ├── context/
│   │   └── GameContext.js # Game state management
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LearningGoalsScreen.js
│   │   ├── InstructionsScreen.js
│   │   ├── SystemSelectScreen.js
│   │   ├── Level1Screen.js (Thermoregulation)
│   │   ├── Level2Screen.js (Water Balance)
│   │   ├── Level3Screen.js (Blood Sugar)
│   │   ├── Level4Screen.js (System Interaction)
│   │   └── ResultsScreen.js
│   └── utils/
│       └── storage.js     # AsyncStorage helpers
└── assets/                # App icons and images
```

## Learning Outcomes

After playing, students should be able to:
1. Explain homeostasis as continuous regulation, not a fixed state
2. Identify stimuli and responses in body systems
3. Apply negative feedback mechanisms correctly
4. Analyze consequences when regulation fails

## Offline Support

The app works completely offline using AsyncStorage for:
- Game progress
- Level completion status
- Star scores
- Time balanced records

## License

Educational use only.
