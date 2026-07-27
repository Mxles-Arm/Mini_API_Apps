import { Redirect } from 'expo-router';

export default function RedirectHome() {
  return <Redirect href="/(tabs)" />;
}
