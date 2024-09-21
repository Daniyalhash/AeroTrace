
import React, { useState, useEffect } from 'react';
import { Text, Image, View, ActivityIndicator, StyleSheet, AppState, TouchableOpacity, Alert, BackHandler, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import { auth, database, onAuthStateChanged, signOut } from './firebaseConfig'; // Ensure correct import
import { getDatabase, ref, set, get, update, onValue } from 'firebase/database';
import { useRouter } from 'expo-router';
import Sidebar from './Sidebar';
import Mybutton from '@/components/Mybutton';
import * as Notifications from "expo-notifications";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

export default function Home() {
  const router = useRouter(); // Use the Expo Router hook
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const database = getDatabase();
  const user = auth.currentUser; // Get the current user
  const [appState, setAppState] = useState(AppState.currentState);

  const db = getDatabase();



  // Set user status and handle offline/online logic
  const handleSetUserStatus = async (status) => {
    if (user) {
      try {
        const userRef = ref(database, `/users/${user.uid}`);
        const userStatusRef = ref(database, `/status/${user.uid}`);

        if (status === 'online') {
          const deviceInfo = Platform.OS;
          const projectId = '7665a91d-1b8d-4e0c-9769-b70a62e01c74'; // Your project ID
          const { data: deviceToken } = await Notifications.getExpoPushTokenAsync({ projectId }); // Pass projectId her


          await update(userRef, {
            status: 'online',
            deviceToken: deviceToken,
            device: deviceInfo,
            lastLogin: new Date().toISOString(),
          });
          await update(userStatusRef, { online: true });
        } else {
          await update(userRef, {
            status: 'offline',
            deviceToken: null,
            device: null,
          });
          await update(userStatusRef, { online: false });
        }
        console.log(`User status set to ${status}`);
      } catch (error) {
        console.error(`Error updating user status: ${status}`, error);
      }
    }
  };
  
// Handle app state changes
useEffect(() => {
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
      handleSetUserStatus('offline');
    } else if (nextAppState === 'active') {
      handleSetUserStatus('online');
    }
    setAppState(nextAppState);
  };

  const appStateListener = AppState.addEventListener('change', handleAppStateChange);
  return () => appStateListener.remove();
}, []);

// Handle user logout
const handleLogout = async () => {
  handleSetUserStatus('offline'); // Set status to offline
  signOut(auth).then(() => {
    router.push('/Login'); // Redirect to login
  }).catch((error) => {
    console.error('Error during logout:', error);
  });
};

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is logged in
      const userRef = ref(database, `/users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserName(snapshot.val().name);
      } else {
        setUserName(user.email);
      }
      setLoading(false);
      handleSetUserStatus('online'); // Mark user as online when app is opened

    } else {
      // User is logged out
      console.log("Redirecting to login");
      router.push('/Login');
    }
  });
  return () => unsubscribe();
}, [auth]);

useEffect(() => {
  const backAction = () => {
    Alert.alert('Exit App', 'Are you sure you want to exit?', [
      { text: 'Cancel', onPress: () => null, style: 'cancel' },
      {
        text: 'YES', onPress: () => {

          BackHandler.exitApp();
        }
      },
    ]);
    return true;
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  return () => backHandler.remove();
}, []);

if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00031E" />
      <Text>Loading user data...</Text>
    </View>
  );
}


return (
  <View style={styles.container}>
    <View style={styles.row}>
      <Text style={styles.heading}>
        Aero<Text style={styles.highlight}>Trace</Text>
      </Text>
      <TouchableOpacity style={styles.iconCircle} onPress={() => setSidebarVisible(true)}>
        <FontAwesomeIcon icon={faBars} size={25} color="#00031E" />
      </TouchableOpacity>
    </View>

    <View style={styles.buttonContainer}>

      <Mybutton title="Cannibalization Process" onPress={() => router.push('./BlockA')} />
      <Mybutton title="Traceability Process" onPress={() => router.push('./Traceability')} />
      <Mybutton title="Crew Members" onPress={() => router.push('./Users')} />
    </View>

    <Sidebar
      visible={isSidebarVisible}
      onClose={() => setSidebarVisible(false)}
      userName={userName}
      onSignOut={handleLogout}
    />
  </View>
);
}



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E2E2E2',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: "10%",
    width: '100%',

  },
  heading: {
    color: '#00031E',
    fontSize: 50,
    fontWeight: "100",
    letterSpacing: -6,
    textAlign: 'center',
  },
  highlight: {
    color: '#00031E',
  },
  buttonContainer:{
    marginBottom:20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#EEEEEE',
    borderWidth: 0,
    cursor: 'pointer',
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  button: {
    marginTop: 15,
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Chillax',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E2E2',
  },
 
});

// //#F1F1F1 for grey
// //#E2E2E2 for dark grey
// //#96ACC0 for blue
