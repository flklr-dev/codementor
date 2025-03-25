import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 64,
  },
  // Add more font variants as needed
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // Indigo
    secondary: '#EC4899', // Pink
    background: '#FFFFFF',
    surface: '#F9FAFB',
    error: '#EF4444',
    text: '#111827',
    onSurface: '#374151',
    outline: '#E5E7EB',
    surfaceVariant: '#F3F4F6',
  },
  fonts: configureFonts({ config: fontConfig }),
}; 