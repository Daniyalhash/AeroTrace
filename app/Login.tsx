import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TextInput, Button, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import { auth, signInWithEmailAndPassword } from './firebaseConfig'; // Adjust the path as necessary
import { StackActions } from '@react-navigation/native';
import Mybutton from '@/components/Mybutton';
import { useRouter } from 'expo-router';
import { getDatabase, ref, set, onValue, get, update, onDisconnect } from 'firebase/database';
import * as Notifications from "expo-notifications";




export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Load fonts and manage splash screen




  const handleLogin = async () => {
    try {
      if (email.length === 0 || password.length === 0) {
        setError('Please fill all fields');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Attempt to sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user data exists in the Firebase Realtime Database
      const db = getDatabase();
      const userRef = ref(db, `/users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        setError('User data not found in the database');
        setTimeout(() => setError(''), 3000);
        return; // Stop further execution if user data doesn't exist
      }

      // Only proceed to set device status if the user exists in the database
      const deviceInfo = Platform.OS;

      // Request push notification permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        setError('Notifications permission not granted');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Fetch Expo push token
      const projectId = '7665a91d-1b8d-4e0c-9769-b70a62e01c74'; // Your project ID
      const { data: deviceToken } = await Notifications.getExpoPushTokenAsync({ projectId });

      // Update user's status to online and set device info and token
      await update(userRef, {
        status: 'online',
        device: deviceInfo,
        deviceToken,
        lastLogin: new Date().toISOString(),
      });

    
      // Redirect to Home after successful login
      setError('');
      router.push('/Home');
    } catch (error) {
      // Handle Firebase authentication errors
      if (error.code === 'auth/user-not-found') {
        setError('User not found. Please check your credentials or sign up.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(error.message);
      }
      setTimeout(() => setError(''), 3000);
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
          <Text style={styles.accText}>Signing in to your account</Text>
        </View>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.inputTop}
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

        <Mybutton title={'Log In'} onPress={handleLogin} />
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.container2}>
        <TouchableOpacity onPress={() => router.push('/Signup')}>
          <Text style={styles.signupText}>
            Not a member? <Text style={styles.loginText}>Create an account</Text>
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
    width: '100%',
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
  inputBottom: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
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
    fontWeight: 'bold',
    textAlign: 'center',
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

  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,

  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  container2: {
    marginTop: 20,
    alignItems: 'center',
  },

  heading: {
    color: '#00031E',
    fontSize: 60,
    letterSpacing: -10,
    textAlign: 'center',
  },
  highlight: {
    color: '#00031E',
  },
  accHead: {
    marginVertical: 20,
    alignItems: 'center',
  },
  accText: {
    color: '#000000',
    fontSize: 24,
    letterSpacing: -1,

    fontWeight: 'bold',

  },
  forgotP: {
    marginVertical: 2,
    color: '#00031E',

    alignItems: 'center',
    textDecorationLine: 'underline',

  }
});
//#F1F1F1 for grey
//#E2E2E2 for dark grey
//#96ACC0 for blue