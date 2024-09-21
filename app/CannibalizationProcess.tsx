import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { ProgressBar } from 'react-native-paper'; // Import ProgressBar from react-native-paper

export default function CannibalizationProcess() {
  const router = useRouter();
  const database = getDatabase();
  const [currentStep, setCurrentStep] = useState(1); // Assume step 1 is starting
  const [totalSteps] = useState(9); // Total number of steps in the process
  const [currentUser, setCurrentUser] = useState('');
  const [processCompleted, setProcessCompleted] = useState(false);

  useEffect(() => {
    // Listen to process status updates from Firebase
    const processRef = ref(database, '/cannibalizationProcess/currentStep');
    const unsubscribe = onValue(processRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentStep(data.step);
        setCurrentUser(data.user);
        setProcessCompleted(data.completed);
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [database]);

  const handleCompleteStep = () => {
    // Logic to mark current step as completed and move to next step
    const nextStep = currentStep + 1;
    const updates = {
      step: nextStep,
      user: "NextUser", // Set the next user
      completed: nextStep > totalSteps ? true : false,
    };

    // Update Firebase
    update(ref(database, '/cannibalizationProcess'), updates);
  };

  // Calculate the progress percentage
  const progress = currentStep / totalSteps;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cannibalization Process</Text>
      <Text style={styles.info}>Current Step: {currentStep} of {totalSteps}</Text>
      <Text style={styles.info}>Current User: {currentUser}</Text>

      {/* Progress Bar */}
      <ProgressBar progress={progress} color="#6200ee" style={styles.progressBar} />

      {!processCompleted ? (
        <Button title="Complete Step" onPress={handleCompleteStep} />
      ) : (
        <Text style={styles.completedText}>The process is complete! A report has been generated.</Text>
      )}

      <Button title="Back to Home" onPress={() => router.push('/Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 18,
    marginVertical: 10,
  },
  progressBar: {
    width: '100%',
    height: 10,
    marginVertical: 20,
  },
  completedText: {
    fontSize: 18,
    color: 'green',
    marginVertical: 10,
  },
});
