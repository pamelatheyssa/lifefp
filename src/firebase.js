import { initializeApp }                          from 'firebase/app'
import { getAuth, GoogleAuthProvider,
         signInWithPopup, signInWithCredential,
         signOut }                                from 'firebase/auth'
import { getFirestore }                           from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyCZIWGFxrHG-PTXuk7teMBQBFgjk5OK9_E",
  authDomain:        "fpsales-4c6df.firebaseapp.com",
  projectId:         "fpsales-4c6df",
  storageBucket:     "fpsales-4c6df.firebasestorage.app",
  messagingSenderId: "445257694353",
  appId:             "1:445257694353:web:94c69e58e024a8bac75330"
}

export const isConfigured = true

const app             = initializeApp(firebaseConfig)
export const auth     = getAuth(app)
export const db       = getFirestore(app)
export const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

const WEB_CLIENT_ID = '445257694353-vjrcg7phbgf5ljkhh2u9m223vbqrvrd1.apps.googleusercontent.com'

const isNative = () =>
  typeof window !== 'undefined' &&
  window.Capacitor?.isNativePlatform?.() === true

export const loginWithGoogle = async () => {
  if (isNative()) {
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
    await GoogleAuth.initialize({
      clientId:           WEB_CLIENT_ID,
      scopes:             ['profile', 'email'],
      grantOfflineAccess: true,
    })
    const googleUser = await GoogleAuth.signIn()
    const credential = GoogleAuthProvider.credential(
      googleUser.authentication.idToken
    )
    return signInWithCredential(auth, credential)
  }
  // Web
  return signInWithPopup(auth, provider)
}

export const getLoginResult = () => Promise.resolve(null)
export const logout         = () => signOut(auth)
