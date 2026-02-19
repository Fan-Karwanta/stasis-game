export const LEARNING_GOALS = [
  "The body must stay in balance to survive.",
  "Body systems use feedback mechanisms to maintain stability.",
  "Homeostasis is a process of dynamic balance, not a fixed state.",
  "Identify components: stimulus → receptor → control center → effector → response.",
  "Understand negative feedback loops that restore balance.",
  "Analyze consequences when regulation fails.",
];

export const LEVELS = [
  {
    id: 1,
    name: 'Thermoregulation',
    description: 'Maintain normal body temperature',
    icon: '🌡️',
    normalRange: { min: 36.5, max: 37.5 },
    unit: '°C',
  },
  {
    id: 2,
    name: 'Water Balance',
    description: 'Maintain proper hydration',
    icon: '💧',
    normalRange: { min: 40, max: 60 },
    unit: '%',
  },
  {
    id: 3,
    name: 'Blood Sugar',
    description: 'Stabilize blood glucose levels',
    icon: '🍬',
    normalRange: { min: 70, max: 100 },
    unit: 'mg/dL',
  },
  {
    id: 4,
    name: 'System Interaction',
    description: 'Manage multiple systems with failures',
    icon: '⚡',
    normalRange: { min: 40, max: 60 },
    unit: '%',
  },
];

export const STIMULI = {
  temperature: [
    { text: "The character runs under the hot sun.", effect: 2, type: 'increase' },
    { text: "The character enters a cold room.", effect: -2, type: 'decrease' },
    { text: "The character exercises vigorously.", effect: 1.5, type: 'increase' },
    { text: "The character drinks cold water.", effect: -0.5, type: 'decrease' },
    { text: "The character has a fever.", effect: 1, type: 'increase' },
    { text: "The character is in an air-conditioned room.", effect: -1, type: 'decrease' },
  ],
  hydration: [
    { text: "The character sweats heavily.", effect: -15, type: 'decrease' },
    { text: "The character is in a dry environment.", effect: -10, type: 'decrease' },
    { text: "The character exercises without water.", effect: -20, type: 'decrease' },
    { text: "The character eats salty food.", effect: -8, type: 'decrease' },
    { text: "The character drinks excess water.", effect: 15, type: 'increase' },
  ],
  glucose: [
    { text: "The character eats a large meal.", effect: 40, type: 'increase' },
    { text: "The character skips breakfast.", effect: -20, type: 'decrease' },
    { text: "The character exercises intensely.", effect: -30, type: 'decrease' },
    { text: "The character drinks sugary soda.", effect: 35, type: 'increase' },
    { text: "The character is stressed.", effect: 15, type: 'increase' },
    { text: "The character fasts for hours.", effect: -25, type: 'decrease' },
  ],
};

export const ACTIONS = {
  temperature: [
    { id: 'sweat', name: 'Sweat', icon: '💦', effect: -1, description: 'Release heat through sweating' },
    { id: 'shiver', name: 'Shiver', icon: '🥶', effect: 1, description: 'Generate heat through shivering' },
    { id: 'rest', name: 'Rest', icon: '😌', effect: 0, description: 'Allow natural regulation' },
  ],
  hydration: [
    { id: 'drink', name: 'Drink Water', icon: '🥤', effect: 20, description: 'Increase hydration' },
    { id: 'reduce', name: 'Reduce Activity', icon: '🧘', effect: 5, description: 'Conserve water' },
    { id: 'rest', name: 'Rest', icon: '😌', effect: 0, description: 'Allow natural regulation' },
  ],
  glucose: [
    { id: 'eat', name: 'Eat', icon: '🍎', effect: 25, description: 'Increase blood sugar' },
    { id: 'insulin', name: 'Release Insulin', icon: '💉', effect: -30, description: 'Lower blood sugar' },
    { id: 'rest', name: 'Rest', icon: '😌', effect: 0, description: 'Allow natural regulation' },
  ],
};

export const LEVEL_TUTORIALS = {
  1: {
    title: 'Thermoregulation',
    icon: '🌡️',
    color: '#F97316',
    goal: 'Keep body temperature between 36.5°C and 37.5°C for 30 seconds.',
    screens: [
      {
        type: 'intro',
        title: 'Welcome to Thermoregulation!',
        subtitle: 'Your body must maintain a stable temperature to survive.',
        description: 'The hypothalamus acts as your body\'s thermostat. When temperature goes too high or too low, it triggers responses to bring it back to normal.',
        visual: '🌡️',
      },
      {
        type: 'meter',
        title: 'The Temperature Bar',
        description: 'This bar shows your current body temperature. The green zone (36.5–37.5°C) is the safe range. Keep the indicator inside it!',
        meterConfig: {
          value: 37.0,
          minValue: 34,
          maxValue: 42,
          normalMin: 36.5,
          normalMax: 37.5,
          label: '🌡️ Body Temperature',
          unit: '°C',
        },
      },
      {
        type: 'stimulus',
        title: 'Random Events Happen!',
        description: 'Situations will appear that push your temperature up or down. You must respond with the right action!',
        examples: [
          { text: 'Running under hot sun', icon: '☀️', effect: '↑ Temperature rises' },
          { text: 'Entering a cold room', icon: '❄️', effect: '↓ Temperature drops' },
          { text: 'Exercising vigorously', icon: '🏃', effect: '↑ Temperature rises' },
        ],
      },
      {
        type: 'actions',
        title: 'Your Action Buttons',
        description: 'Tap these buttons to regulate temperature. Each one affects the bar differently:',
        actions: [
          { icon: '💦', name: 'Sweat', effect: -0.8, unit: '°C', direction: 'down', explanation: 'Cools the body by releasing heat through sweat glands' },
          { icon: '🥶', name: 'Shiver', effect: +0.8, unit: '°C', direction: 'up', explanation: 'Warms the body by generating heat through muscle contractions' },
          { icon: '😌', name: 'Rest', effect: 0, unit: '°C', direction: 'neutral', explanation: 'Allows natural regulation — use when already balanced' },
        ],
      },
      {
        type: 'demo',
        title: 'Watch How It Works',
        description: 'Temperature is HIGH (38.5°C). Pressing "Sweat" brings it down:',
        demoSteps: [
          { label: 'Temperature rises to 38.5°C', value: 38.5, status: 'HIGH' },
          { label: 'You press 💦 Sweat', value: 38.5, action: 'Sweat', actionIcon: '💦' },
          { label: 'Temperature drops to 37.7°C', value: 37.7, status: 'HIGH' },
          { label: 'Press 💦 Sweat again', value: 37.7, action: 'Sweat', actionIcon: '💦' },
          { label: 'Back to normal! 36.9°C ✓', value: 36.9, status: 'NORMAL' },
        ],
        meterConfig: {
          minValue: 34,
          maxValue: 42,
          normalMin: 36.5,
          normalMax: 37.5,
          unit: '°C',
        },
      },
      {
        type: 'tips',
        title: 'Pro Tips',
        tips: [
          '⚠️ If temperature goes below 35°C or above 40°C, you lose a heart!',
          '💡 Use hints (2 per level) if you\'re unsure which action to take.',
          '⏱️ You have 30 seconds — keep the bar balanced as long as possible!',
          '⭐ More time balanced = more stars earned!',
        ],
      },
    ],
  },
  2: {
    title: 'Water Balance',
    icon: '💧',
    color: '#0EA5E9',
    goal: 'Keep hydration between 40% and 60% for 30 seconds.',
    screens: [
      {
        type: 'intro',
        title: 'Welcome to Water Balance!',
        subtitle: 'Your body is about 60% water — keeping it balanced is vital.',
        description: 'The kidneys regulate water balance. Too little water causes dehydration; too much dilutes your electrolytes.',
        visual: '💧',
      },
      {
        type: 'meter',
        title: 'The Hydration Bar',
        description: 'This bar shows your hydration level. The green zone (40–60%) is the safe range. Your body naturally loses water over time!',
        meterConfig: {
          value: 50,
          minValue: 0,
          maxValue: 100,
          normalMin: 40,
          normalMax: 60,
          label: '💧 Hydration Level',
          unit: '%',
        },
      },
      {
        type: 'stimulus',
        title: 'Dehydration Threats!',
        description: 'Events will drain your water levels. Stay alert and hydrate!',
        examples: [
          { text: 'Sweating heavily', icon: '💦', effect: '↓ Hydration drops fast' },
          { text: 'Dry environment', icon: '🏜️', effect: '↓ Hydration drops' },
          { text: 'Drinking excess water', icon: '🚰', effect: '↑ Hydration rises too much' },
        ],
      },
      {
        type: 'actions',
        title: 'Your Action Buttons',
        description: 'Tap these buttons to manage hydration. Each one affects the bar differently:',
        actions: [
          { icon: '🥤', name: 'Drink', effect: +15, unit: '%', direction: 'up', explanation: 'Replenishes body fluids — use when hydration is low' },
          { icon: '🧘', name: 'Conserve', effect: +3, unit: '%', direction: 'up', explanation: 'Reduces water loss through reduced activity' },
          { icon: '💦', name: 'Sweat', effect: -8, unit: '%', direction: 'down', explanation: 'Releases excess water — use when overhydrated' },
        ],
      },
      {
        type: 'demo',
        title: 'Watch How It Works',
        description: 'Hydration is LOW (32%). Pressing "Drink" brings it up:',
        demoSteps: [
          { label: 'Hydration drops to 32%', value: 32, status: 'LOW' },
          { label: 'You press 🥤 Drink', value: 32, action: 'Drink', actionIcon: '🥤' },
          { label: 'Hydration rises to 47%', value: 47, status: 'NORMAL' },
          { label: 'Balanced! Keep monitoring.', value: 47, status: 'NORMAL' },
        ],
        meterConfig: {
          minValue: 0,
          maxValue: 100,
          normalMin: 40,
          normalMax: 60,
          unit: '%',
        },
      },
      {
        type: 'tips',
        title: 'Pro Tips',
        tips: [
          '⚠️ Below 20% or above 85% = lose a heart!',
          '💧 Your body naturally loses water — you must actively drink!',
          '⏱️ You have 30 seconds — balance hydration as long as possible!',
          '⭐ More time balanced = more stars earned!',
        ],
      },
    ],
  },
  3: {
    title: 'Blood Sugar',
    icon: '🍬',
    color: '#A855F7',
    goal: 'Keep blood glucose between 70 and 100 mg/dL for 30 seconds.',
    screens: [
      {
        type: 'intro',
        title: 'Welcome to Blood Sugar!',
        subtitle: 'Glucose is your body\'s primary energy source.',
        description: 'The pancreas releases insulin (to lower sugar) and glucagon (to raise it). This is a classic negative feedback loop.',
        visual: '🍬',
      },
      {
        type: 'meter',
        title: 'The Glucose Bar',
        description: 'This bar shows blood glucose level. The green zone (70–100 mg/dL) is the safe range. Glucose naturally drops as cells use energy.',
        meterConfig: {
          value: 85,
          minValue: 30,
          maxValue: 180,
          normalMin: 70,
          normalMax: 100,
          label: '🍬 Blood Glucose',
          unit: 'mg/dL',
        },
      },
      {
        type: 'stimulus',
        title: 'Blood Sugar Swings!',
        description: 'Events will cause your blood sugar to spike or crash:',
        examples: [
          { text: 'Eating a large meal', icon: '🍔', effect: '↑ Glucose spikes' },
          { text: 'Skipping breakfast', icon: '⏰', effect: '↓ Glucose drops' },
          { text: 'Intense exercise', icon: '🏋️', effect: '↓ Glucose drops fast' },
        ],
      },
      {
        type: 'actions',
        title: 'Your Action Buttons',
        description: 'Tap these buttons to regulate blood sugar:',
        actions: [
          { icon: '🍎', name: 'Eat', effect: +20, unit: 'mg/dL', direction: 'up', explanation: 'Raises blood sugar by providing glucose from food' },
          { icon: '💉', name: 'Insulin', effect: -25, unit: 'mg/dL', direction: 'down', explanation: 'Lowers blood sugar by helping cells absorb glucose' },
          { icon: '😌', name: 'Rest', effect: -5, unit: 'mg/dL', direction: 'down', explanation: 'Slight decrease as cells slowly consume glucose' },
        ],
      },
      {
        type: 'demo',
        title: 'Watch How It Works',
        description: 'Glucose is HIGH (130 mg/dL). Using insulin brings it down:',
        demoSteps: [
          { label: 'Glucose spikes to 130 mg/dL', value: 130, status: 'HIGH' },
          { label: 'You press 💉 Insulin', value: 130, action: 'Insulin', actionIcon: '💉' },
          { label: 'Glucose drops to 105 mg/dL', value: 105, status: 'HIGH' },
          { label: 'Press 😌 Rest', value: 105, action: 'Rest', actionIcon: '😌' },
          { label: 'Glucose at 100 mg/dL — Normal! ✓', value: 100, status: 'NORMAL' },
        ],
        meterConfig: {
          minValue: 30,
          maxValue: 180,
          normalMin: 70,
          normalMax: 100,
          unit: 'mg/dL',
        },
      },
      {
        type: 'tips',
        title: 'Pro Tips',
        tips: [
          '⚠️ Below 50 or above 140 mg/dL = lose a heart!',
          '🍎 Eat raises sugar, 💉 Insulin lowers it — learn the balance!',
          '⏱️ You have 30 seconds — keep glucose stable!',
          '⭐ More time balanced = more stars earned!',
        ],
      },
    ],
  },
  4: {
    title: 'System Interaction',
    icon: '⚡',
    color: '#EC4899',
    goal: 'Manage ALL three systems simultaneously with insulin disabled!',
    screens: [
      {
        type: 'intro',
        title: 'The Ultimate Challenge!',
        subtitle: 'Manage temperature, hydration, AND glucose at once.',
        description: 'In real life, body systems work together. When one fails, others are affected. Here, your insulin response is DISABLED — simulating diabetes.',
        visual: '⚡',
      },
      {
        type: 'actions',
        title: '🌡️ Temperature Controls',
        description: 'Same as Level 1 — keep temperature between 36.5–37.5°C:',
        actions: [
          { icon: '💦', name: 'Sweat', effect: -0.8, unit: '°C', direction: 'down', explanation: 'Cools the body down' },
          { icon: '🥶', name: 'Shiver', effect: +0.8, unit: '°C', direction: 'up', explanation: 'Warms the body up' },
        ],
      },
      {
        type: 'actions',
        title: '💧 Hydration Controls',
        description: 'Same as Level 2 — keep hydration between 40–60%:',
        actions: [
          { icon: '🥤', name: 'Drink', effect: +15, unit: '%', direction: 'up', explanation: 'Replenishes fluids' },
          { icon: '🧘', name: 'Conserve', effect: +3, unit: '%', direction: 'up', explanation: 'Reduces water loss' },
        ],
      },
      {
        type: 'actions',
        title: '🍬 Glucose Controls (⚠️ No Insulin!)',
        description: 'Insulin is DISABLED! You can only use Eat and Rest:',
        actions: [
          { icon: '🍎', name: 'Eat', effect: +20, unit: 'mg/dL', direction: 'up', explanation: 'Raises blood sugar' },
          { icon: '💉', name: 'Insulin', effect: -25, unit: 'mg/dL', direction: 'disabled', explanation: '❌ DISABLED — simulates diabetes' },
          { icon: '😌', name: 'Rest', effect: -5, unit: 'mg/dL', direction: 'down', explanation: 'Slowly lowers glucose' },
        ],
      },
      {
        type: 'demo',
        title: 'The Challenge',
        description: 'All three bars drift simultaneously. Without insulin, glucose tends to RISE:',
        demoSteps: [
          { label: '🌡️ Temp drifts randomly', value: 38.0, status: 'HIGH' },
          { label: '💧 Hydration drops naturally', value: 35, status: 'LOW' },
          { label: '🍬 Glucose RISES without insulin!', value: 125, status: 'HIGH' },
          { label: 'You must juggle all three!', value: 85, status: 'NORMAL' },
        ],
        meterConfig: {
          minValue: 0,
          maxValue: 100,
          normalMin: 40,
          normalMax: 60,
          unit: '%',
        },
      },
      {
        type: 'tips',
        title: 'Pro Tips',
        tips: [
          '⚠️ Critical thresholds on ANY system = lose a heart!',
          '🔄 Prioritize the system that\'s most out of balance.',
          '💉 Without insulin, glucose rises fast — use Rest often!',
          '⏱️ You have 30 seconds — ALL systems must be balanced to earn time!',
          '⭐ This is the hardest level — good luck!',
        ],
      },
    ],
  },
};

export const FEEDBACK_MESSAGES = {
  temperature: {
    high: "Body temperature is too high! The hypothalamus detects this and triggers sweating to cool down.",
    low: "Body temperature is too low! The hypothalamus triggers shivering to generate heat.",
    normal: "Body temperature is in the normal range. Homeostasis maintained!",
    corrected: "Negative feedback activated: body temperature is returning to normal.",
  },
  hydration: {
    high: "Hydration level is too high! Kidneys will increase urine output.",
    low: "Dehydration detected! The body signals thirst to encourage water intake.",
    normal: "Hydration level is balanced. Water homeostasis maintained!",
    corrected: "Maintaining balance in one system can affect another.",
  },
  glucose: {
    high: "Blood glucose is too high! Pancreas releases insulin to lower it.",
    low: "Blood glucose is too low! Pancreas releases glucagon to raise it.",
    normal: "Blood glucose is stable. This is an example of negative feedback.",
    corrected: "This is an example of negative feedback regulation.",
  },
};
