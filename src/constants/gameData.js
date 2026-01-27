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
