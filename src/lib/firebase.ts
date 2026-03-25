import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAEiwd_NrddrTkBPDY-lcqGWA3u3YDO1CI',
  authDomain: 'multiplecultures-97fd8.firebaseapp.com',
  projectId: 'multiplecultures-97fd8',
  storageBucket: 'multiplecultures-97fd8.firebasestorage.app',
  messagingSenderId: '525090679521',
  appId: '1:525090679521:web:eeeb67148b5dcc2bfde5a0',
  measurementId: 'G-NRE36C72LY',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
