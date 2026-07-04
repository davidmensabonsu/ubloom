import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.despia.ubloom',
  appName: 'uBloom',
  webDir: 'dist',
  server: {
    url: 'https://58d2bcb3-c13a-4994-b922-28eaa0fecbae.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;