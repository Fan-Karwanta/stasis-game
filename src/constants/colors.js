export const COLORS = {
  // Homeostasis state colors (VERY IMPORTANT for learning)
  normal: '#10B981', // Green - Normal/Balanced state
  high: '#EF4444', // Red - High/Excess
  low: '#3B82F6', // Blue - Low/Deficiency
  
  // UI Colors
  primary: '#6366F1', // Indigo
  secondary: '#8B5CF6', // Purple
  accent: '#F472B6', // Pink
  
  // Background colors
  background: '#FAFBFF',
  cardBackground: '#FFFFFF',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Game specific
  starFilled: '#FBBF24',
  starEmpty: '#D1D5DB',
  heartFull: '#EF4444',
  heartEmpty: '#FCA5A5',
  
  // Level colors
  levelLocked: '#9CA3AF',
  levelUnlocked: '#6366F1',
  levelCompleted: '#10B981',
  
  // Body system colors
  temperature: '#F97316', // Orange for temperature
  hydration: '#0EA5E9', // Sky blue for water
  glucose: '#A855F7', // Purple for glucose
  system: '#EC4899', // Pink for system interaction
};

// Meter color based on value
export const getMeterColor = (value, normalMin, normalMax) => {
  if (value < normalMin) return COLORS.low;
  if (value > normalMax) return COLORS.high;
  return COLORS.normal;
};
