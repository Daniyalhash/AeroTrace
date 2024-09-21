
import React, { useState, useEffect } from 'react';
import { View, TextInput, ActivityIndicator, Button, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import { getToken } from 'firebase/messaging';
import { auth, createUserWithEmailAndPassword } from './firebaseConfig';
import { getDatabase, set, ref, onValue, orderByChild, equalTo, get, update, onDisconnect } from 'firebase/database';
import { useRouter } from 'expo-router';
import * as Notifications from "expo-notifications";

import Mybutton from '@/components/Mybutton';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Repassword, setRePassword] = useState('');
  const [pushToken, setPushToken] = useState();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter()

  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      try {
        // Check for existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permission if not already granted
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          throw new Error("Permission not granted for push notifications.");
        }

        // Get the Expo push token
        const { data: token } = await Notifications.getExpoPushTokenAsync();
        setPushToken(token);
        console.log(token)
        console.log("Push token:", token);
      } catch (error) {
        console.error("Failed to get push token:", error);
      }
    };

    registerForPushNotificationsAsync();

    // Set up notification listeners
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response received:", response);
    });

    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    // Clean up listeners on component unmount
    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    };
  }, []);


  const handleSignUp = async () => {
    if (email.length === 0 || password.length === 0 || name.length === 0) {
      setError('Please fill all fields');
      setTimeout(() => setError(''), 1000);
      return;
    }
    if (password.length !== Repassword.length) {
      setError('Password lengths should be the same');
      setTimeout(() => setError(''), 1000);
      return;
    }

    if (password !== Repassword) {
      setError('Passwords should match');
      setTimeout(() => setError(''), 1000);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      console.log('Registered with:', userCredential.user.uid);

      const db = getDatabase();
      const deviceInfo = Platform.OS;
      const projectId = '7665a91d-1b8d-4e0c-9769-b70a62e01c74'; // Your project ID
      const { data: deviceToken } = await Notifications.getExpoPushTokenAsync({ projectId }); // Pass projectId here

      await set(ref(db, `/users/${userCredential.user.uid}`), {
        name,
        email,
        password,
        deviceToken: deviceToken || '',
        status: 'online', // Set user status to online upon registration
        device: deviceInfo,
        lastLogin: new Date().toISOString(), // Optionally store the registration time
      });
      //update the status
      const userStatusRef = ref(db, `/status/${userCredential.user.uid}`);
      // Set user status to online
      set(userStatusRef, { online: true });
      
        // Debug log to check if user status is being set correctly
        onValue(userStatusRef, (snapshot) => {
          console.log('User status updated:', snapshot.val());
        });

      // Set the status to offline when the user disconnects or the app closes
      const userRef = ref(db, `/users/${userCredential.user.uid}`);
      onDisconnect(userRef).update({ status: 'offline', device: null, deviceToken: null });
      onDisconnect(userStatusRef).set({ online: false });

      router.push('/Home'); // Correct usage of navigation
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/clouds.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.mainContainer}>
        <View style={styles.container1}>
          <Text style={styles.heading}>
            Aero
            <Text style={styles.highlight}>Trace</Text>
          </Text>
          <View style={styles.accHead}>
            <Text style={styles.accText}>Create your account</Text>
          </View>
          <TextInput
            placeholder="Name"
            value={name}
            placeholderTextColor="#888" // Ensure this color is visible against the background

            onChangeText={setName}
            style={styles.inputTop}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#888" // Ensure this color is visible against the background

          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.inputBottom}
            placeholderTextColor="#888" // Ensure this color is visible against the background

          />
          <TextInput
            placeholder="Re - Password"
            value={Repassword}
            onChangeText={setRePassword}
            secureTextEntry
            placeholderTextColor="#888" // Ensure this color is visible against the background

            style={styles.inputDown}
          />
          <View style={styles.spacer} />

          <Mybutton title="Sign Up" onPress={handleSignUp} />

          <View style={styles.spacer} />
          <View style={styles.errorContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
        <View style={styles.container2}>
          <TouchableOpacity onPress={() => router.navigate('./Login')}>
            <Text style={styles.signupText}>
              Already have an account? <Text style={styles.loginText}>Login</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container1: {
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
  },
  inputTop: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: -1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,

    marginBottom: -1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputBottom: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  }, inputDown: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    marginBottom: -1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  container2: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    marginTop: 15,
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    height: 15,
  },
  heading: {
    color: '#00031E',
    fontSize: 60,
    letterSpacing: -13,
    textAlign: 'center',
    fontWeight: 'regular',
  },
  highlight: {
    color: '#00031E',
  },
  signupText: {
    color: '#00031E',
    fontSize: 12,
  },
  loginText: {
    color: '#007BFF',
    fontSize: 13,
    fontWeight: 'bold',
    textDecorationLine: 'underline',

  }, accHead: {
    marginVertical: 20,
    alignItems: 'center',
  },
  accText: {
    color: '#000000',
    fontSize: 24,
    letterSpacing: -1,

    fontWeight: 'bold',

  },
});
