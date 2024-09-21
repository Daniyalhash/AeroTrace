import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { auth, onAuthStateChanged } from './firebaseConfig'; // Adjust the path as necessary

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack>
      {/* Root Screen - Typically a home or entry screen */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Authenticated Screens */}
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" options={{ headerShown: false }} />
          <Stack.Screen name="Sidebar" options={{ headerShown: false }} />
          <Stack.Screen name="BlockA" options={{ headerShown: false }} />
          <Stack.Screen name="BlockB" options={{ headerShown: false }} />
          <Stack.Screen name="BlockB2" options={{ headerShown: false }} />
          <Stack.Screen name="BlockB3" options={{ headerShown: false }} />
          <Stack.Screen name="BlockC" options={{ headerShown: false }} />
          <Stack.Screen name="BlockCb" options={{ headerShown: false }} />
          <Stack.Screen name="BlockCb2" options={{ headerShown: false }} />
          <Stack.Screen name="BlockCb3" options={{ headerShown: false }} />
          <Stack.Screen name="ReportGenerator" options={{ headerShown: false }} />
          <Stack.Screen name="Traceability" options={{ headerShown: false }} />
          <Stack.Screen name="CheckboxGroup" options={{ headerShown: false }} />
          <Stack.Screen name="TraceabilityReport" options={{ headerShown: false }} />
          <Stack.Screen name="Users" options={{ headerShown: false }} />
          <Stack.Screen name="NotificationService" options={{ headerShown: false }} />
          <Stack.Screen name="Notification" options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" options={{ headerShown: false }} />
          <Stack.Screen name="Signup" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
