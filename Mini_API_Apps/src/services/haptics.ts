// ==========================================
// WatchWise — Haptics Helper
// ==========================================
// Thin wrapper so call sites don't each need a Platform check —
// expo-haptics throws/no-ops unpredictably on web.

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const tapFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export const successFeedback = () => {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};
