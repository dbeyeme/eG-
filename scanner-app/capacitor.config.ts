import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.voyageur241.scanner',
  appName: 'Voyageur241 Scanner',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    BarcodeScanner: {},
  },
  ios: {
    // Manual safe-area handling via CSS env(safe-area-inset-*)
    contentInset: 'never',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
  },
};

export default config;
