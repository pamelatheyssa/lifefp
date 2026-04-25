import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:   'com.lifeplanner.app',
  appName: 'Life Planner',
  webDir:  'dist',
  bundledWebRuntime: false,
  plugins: {
    GoogleAuth: {
      scopes:             ['profile', 'email'],
      serverClientId:     '445257694353-vjrcg7phbgf5ljkhh2u9m223vbqrvrd1.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    LocalNotifications: {
      smallIcon:  'ic_stat_icon_config_sample',
      iconColor:  '#534AB7',
      sound:      'default',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  android: {
    allowMixedContent:          false,
    captureInput:               true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset:  'automatic',
    scrollEnabled: true,
    scheme:        'Life Planner'
  }
}

export default config
