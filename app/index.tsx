import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Alert,ImageBackground, ActivityIndicator, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, onAuthStateChanged } from './firebaseConfig'; // Adjust the path as necessary
import * as Notifications from "expo-notifications";


// Notification handler configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  // const [fontsLoaded, setFontsLoaded] = useState(false);
  const planeAnimation = useRef(new Animated.Value(300)).current;
  const router = useRouter();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Start the plane animation
    Animated.timing(planeAnimation, {
      toValue: 0, // Final position
      duration: 1000, // Duration of the animation in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start();

   
    // Check authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false); // Stop loading animation once the auth state is determined

      // Delay navigation for 2 seconds
      setTimeout(() => {
        if (user) {
          router.replace('/Home'); // Redirect to Home if authenticated
        } else {
          router.replace('/Login'); // Redirect to Login if not authenticated
        }
      }, 2000); // 2-second delay
    });

    return () => unsubscribe(); // Clean up the auth state listener
  }, [planeAnimation, router]);
  
  if (loading) {
    // Show a loading spinner while checking the authentication state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <ImageBackground
      source={require('../assets/images/clouds.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Centered Heading */}
        <View style={styles.textContainer}>
          <Text style={styles.heading}>
            Aero
            <Text style={styles.highlight}>Trace</Text>
          </Text>
        </View>

        {/* Spacer to push the button to the bottom */}
        <View style={styles.spacer} />

        {/* Plane Image in Front */}
        <Animated.Image
          source={require('../assets/images/plane.png')}
          style={[styles.planeImage, { transform: [{ translateX: planeAnimation }] }]}
        />

        {/* Optional: Manual navigation button */}
        {/* <TouchableOpacity style={styles.button} onPress={() => router.push('/Login')}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity> */}
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', // Pushes items to the top and bottom
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center', // Centers the text vertically
    alignItems: 'center', // Centers the text horizontally
  },
  heading: {
    color: '#00031E',
    fontSize: 90,
    letterSpacing: -13,
    fontWeight: 'Bold',
  },
  highlight: {
    color: '#00031E',
  },
  spacer: {
    flex: 1,
  },
  planeImage: {
    resizeMode: 'contain', // Ensures the full image is visible without cropping
    width: 600, // Increase width to accommodate the full size
    height: 600, // Increase height accordingly to maintain aspect ratio
    position: 'absolute',
    bottom: 100, // Adjust to position the image correctly
    left: 0,   // Starting position (off-screen)
    zIndex: 1,
  },
  button: {
    backgroundColor: '#F1F1F1',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    cursor: 'pointer',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#00031E',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  iconArrow: {
    color: '#00031E',
  },
  iconCircle: {
    marginLeft: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00031E',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: '50%',
  },
});