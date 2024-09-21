// import { firebase } from '@react-native-firebase/messaging';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text, View, TextInput, Modal, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useRouter } from 'expo-router';
import { faArrowRight, faCross, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Notifications from "expo-notifications";

import { getDatabase, database, push, onDisconnect, update, get, remove } from './firebaseConfig'; // Import Firebase Realtime Database
import { ref, set } from 'firebase/database';

import { useLocalSearchParams } from 'expo-router';
import Checkbox from 'expo-checkbox';
import Mybutton from "@/components/Mybutton";
import useUsers from '@/components/useUser';
import CustomPicker from "@/components/CustomPicker";
// Notification handler configuration
import { getAuth } from 'firebase/auth';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
// Function to sanitize tokens
const sanitizeToken = (token) => {
  return token.replace(/[.#$[\]]/g, '_'); // Replace invalid characters with underscores
};

export default function BlockB3() {
  // State for all the form inputs

  // const [approval, setApproval] = useState('');
  // const [endorsed, setEndorsed] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter(); // Use the Expo Router hook
  const [pushToken, setPushToken] = useState();
  const [selectedUserToken, setSelectedUserToken] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [isModalVisible2, setIsModalVisible2] = useState(false); // Modal visibility state
  const [approved, setApproved] = useState('');

  const [loading, setLoading] = useState(false);
  const [blockAData, setBlockAData] = useState(null);
  const [blockAData2, setBlockAData2] = useState(null);

  const userData = useUsers();  // Get the object with 'activeCount' and 'users'
  const users = userData?.users || [];
  const [fontsLoaded, setFontsLoaded] = useState(false);

  //important thing
  const [receivedNotifications, setReceivedNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const sanitizedToken = user ? sanitizeToken(user.uid) : null;

  //block A fetching

  const fetchBlockAData = async () => {
    if (!reportId) {
      Alert.alert('Error', 'No report ID found.');
      return;
    }

    setLoading(true);
    try {
      // Reference to the 'blockA' data in Firebase
      const blockARef1 = ref(database, `/cannibalizationReports/${reportId}/blockA`);

      // Fetch the data from Firebase
      const snapshot1 = await get(blockARef1);
      if (snapshot1.exists()) {
        const data = snapshot1.val();
        console.log('Fetched BlockA data:', data);
        setBlockAData(data); // Set the fetched data to state
      } else {
        Alert.alert('Error', 'No data found for this report ID.');
      }
    } catch (error) {
      console.error('Error fetching BlockA data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  //block b fetching

  const fetchBlockAData2 = async () => {
    if (!reportId) {
      Alert.alert('Error', 'No report ID found.');
      return;
    }

    setLoading(true);
    try {
      // Reference to the 'blockA' data in Firebase
      const blockARef2 = ref(database, `/cannibalizationReports/${reportId}/blockB`);

      // Fetch the data from Firebase
      const snapshot2 = await get(blockARef2);
      if (snapshot2.exists()) {
        const data2 = snapshot2.val();
        console.log('Fetched BlockB data:', data2);
        setBlockAData2(data2); // Set the fetched data to state
      } else {
        Alert.alert('Error', 'No data found for this report ID.');
      }
    } catch (error) {
      console.error('Error fetching BlockB data:', error);
      Alert.alert('Error', 'Failed to fetch data of Block B. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // checking current user
  useEffect(() => {
    // Track user presence in the database
    const trackUserPresence = () => {
      if (user) {

        const userStatusRef = ref(database, `/status/${user.uid}`);
        set(userStatusRef, { online: true });
        onDisconnect(userStatusRef).set({ online: false });
      }
    };

    trackUserPresence();
  }, [user]);
  //notification
  //notification
  useEffect(() => {
    if (user) {
      setCurrentUserId(user.uid);
      setCurrentUserEmail(user.email);


      const registerForPushNotificationsAsync = async () => {
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== "granted") {
            throw new Error("Permission not granted for push notifications.");
          }

          const { data: token } = await Notifications.getExpoPushTokenAsync();
          setPushToken(token);
          console.log("Push token:", token);
        } catch (error) {
          console.error("Failed to get push token:", error);
        }
      };

      registerForPushNotificationsAsync();
      const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const { screen, reportId } = response.notification.request.content.data;

        if (screen && reportId) {
          console.log('Navigating to:', screen, 'with reportId:', reportId);
          router.push({ pathname: screen, params: { reportId } });
        }
      });

      const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

      return () => {
        backgroundSubscription.remove();
        foregroundSubscription.remove();
      };
    } else {
      Alert.alert("Error", "User not authenticated.");
    }
  }, []);


  const clearFields = () => {
    setApproved('');

    // setApproval('');
    // setEndorsed('');

  };
  const validateForm = () => {
    // List of fields to validate
    const fields = [
      approved
    ];
    // Check if any field is empty
    for (let field of fields) {
      if (!field || !field.trim()) {
        return false;
      }
    }

    if (!selectedUserToken) {
      setError("Select an Officer!")
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    return true;
  };
  const { reportId } = useLocalSearchParams();
  // Log to check if reportId is received
  useEffect(() => {
    console.log("Received reportId:", reportId);
    if (reportId) {
      fetchBlockAData();
      fetchBlockAData2();
    } // Fetch data whenever the reportId changes

  }, [reportId]); // This will receive the reportId from Block A
  const solve = () => {
    console.log("reopot", reportId)
  }
  //submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('All fields are required.');

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);

      return; // Prevent further execution if there's an error
    }
    try {
      if (!reportId) {
        console.error("Report ID is not defined");
        return;
      }
      const newReportRef = ref(database, `/cannibalizationReports/${reportId}/blockB`);
      await update(newReportRef, {
        approved,
        timestamp: new Date(),
      });

      console.log('Submitting form with data:', {
        approved,
      });
      // Ensure the notification is sent after reportId is set
      if (selectedUserToken && reportId) {
        await triggerNotificationHandler(reportId); // Pass reportId to the function
      }
      setSuccess('Form submitted successfully!');
      clearFields();
      // router.push({ pathname: './BlockC', params: { reportId } }); // Navigate to BlockB
      router.push({ pathname: './Home' }); // Navigate to BlockB

    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'There was an error submitting the form. Please try again.');
    }
  };
  //delete form
  const handleExit = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to stop the cannibalization process? This will discard all values and exit.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Discard',
          onPress: () => deleteBlockAData(),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteBlockAData = async () => {
    if (!reportId) {
      Alert.alert('Error', 'No report ID found.');
      return;
    }

    try {
      const blockARef = ref(database, `/cannibalizationReports/${reportId}`);
      await remove(blockARef);

      console.log('All Block data deleted successfully.');
      router.push('./Home'); // Adjust to the desired route
    } catch (error) {
      console.error('Error deleting Block A data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    }
  };

  //send a notification
  const triggerNotificationHandler = async (reportId: string) => {
    if (!selectedUserToken || !selectedUserName || !selectedUserId) {
      Alert.alert("Error", "Please select a user to send the notification.");
      return;
    }
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedUserToken,
          sound: 'default',
          title: `Cannibalization Form :${reportId}`,
          body: `Mr. ${selectedUserName} Block C process starts, Now Complete Block C DONOR SECTION,  from ${currentUserEmail}: Click to open the specific form.`,
          data: {
            screen: "BlockC",
            reportId: reportId, // Pass the reportId correctly
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send push notification.");
      }

      // Save notification details to the selected user's database path
      const db = getDatabase();
      const notificationId = Date.now().toString(); // Unique ID for the notification
      await set(ref(db, `users/${sanitizeToken(selectedUserId)}/notifications/${notificationId}`), {
        title: `Cannibalization Form :${reportId}`,
        body: `Mr. ${selectedUserName} Block C process starts, Now Complete Block C DONOR SECTION,  from ${currentUserEmail}: Click to open the specific form.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        formId: reportId,
        sender: currentUserEmail, // Add sender information
      });
    }
    catch (error) {
      console.error("Error sending push notification:", error);
      Alert.alert("Error", "Failed to send push notification.");
    }
  };
  return (
    <ScrollView style={styles.container}>

      <View style={styles.row}>

        <Text style={styles.heading}>
          Aero
          <Text style={styles.highlight}>Trace</Text>
        </Text>
        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => handleExit()}>
          <FontAwesomeIcon icon={faTimes} size={24} color="red" />
        </TouchableOpacity>
      </View>
      {/* Google Button to Open Modal */}

      <TouchableOpacity style={styles.googleButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Show Previous Block A </Text>
      </TouchableOpacity>

      {/* Modal to Show Previous Block A Values */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Previous Block A Values</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {blockAData ? (
              <View>
                {/* Display fetched data from Block A */}
                <Text>Nomenclature: {blockAData.nomenclature}</Text>
                <Text>Part Number: {blockAData.partNo}</Text>
                <Text>Aircraft Registration: {blockAData.aircraftRegistration}</Text>
                <Text>Recipient Station: {blockAData.recipientStation}</Text>
                <Text>Voucher No: {blockAData.voucherNo}</Text>
                <Text>Reason: {blockAData.reason}</Text>
                <Text>ATLB Ref No: {blockAData.atlbRefNo}</Text>
                <Text>Signature: {blockAData.signature}</Text>
              </View>
            ) : (
              <Text>No previous values available.</Text>
            )}
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Google Button to Open Modal */}

      <TouchableOpacity style={styles.googleButton} onPress={() => setIsModalVisible2(true)}>
        <Text style={styles.buttonText}>Show Previous Block B </Text>
      </TouchableOpacity>

      {/* Modal to Show Previous Block B Values */}
      <Modal visible={isModalVisible2} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Previous Block B Values</Text>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {blockAData2 ? (
              <View>
                {/* Display fetched data from Block A */}
                <Text>donorAircraftRegistration: {blockAData2?.donorAircraftRegistration || 'N/A'}</Text>
                <Text>
                  Aircraft is adequately preserved, if required: {blockAData2.isPreserved === true ? 'Yes' : blockAData2.isPreserved === false ? 'No' : 'N/A'}
                </Text>
                <Text>
                  C of A is Valid: {blockAData2.isCoAValid === true ? 'Yes' : blockAData2.isCoAValid === false ? 'No' : 'N/A'}
                </Text>
                <Text>remarks: {blockAData2.remarks || 'N/A'}</Text>
                <Text>DCE(Situation Room)/EMOD: {blockAData2.situationroom || 'N/A'}</Text>
                <Text>Approval Ref No{blockAData2.approval}</Text>
                <Text>Endorsed By: DCE Rotable Planning (Signature/Date/Stamp) {blockAData2.endorsed}</Text>

              </View>
            ) : (
              <Text>No previous values available.</Text>
            )}
            <TouchableOpacity onPress={() => setIsModalVisible2(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.row2}>
        <Text style={styles.heading3}> BLOCK B CANNIBALIZATION PERMISSION</Text>
      </View>
      <View style={styles.formContainer}>

        <Text style={styles.label}>Approved By:</Text>
        <Text style={styles.label}>Chief Engineer MOC:</Text>
        <TextInput
          style={styles.input}
          value={approved}
          onChangeText={(text) => setApproved(text)}
          placeholder="Enter Approved By"
          placeholderTextColor="#96ACC0"

        />

        <Text style={styles.labelPicker}>Select an Officer to Send for Verification:</Text>

        <View style={styles.pickerContainer}>
          <CustomPicker
            selectedValue={selectedUserToken}
            onValueChange={(value) => {
              const selectedUser = users.find(user => user.deviceToken === value);
              setSelectedUserToken(value);
              setSelectedUserName(selectedUser ? selectedUser.name : null);
              setSelectedUserId(selectedUser ? selectedUser.id : null);
            }}
            items={users.map(user => ({
              label: `${user.name} ${user.email}`,
              value: user.deviceToken,
              textColor: user.status === 'online' ? '#90EE90' : '#721C24', // Text color based on status
              backgroundColor: user.status === 'online' ? '#E0FFD1' : '#F8D7DA', // Background color based on status

            }))}
            style={styles.picker}
          />

        </View>
      </View>
      <View style={styles.spacer} />
      <View>

        <TouchableOpacity style={styles.button}
          onPress={() => {
            handleSubmit();
          }}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.spacer} />
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
    borderWidth:2,
  },picker: {
    height: 150,
    width: '100%',
  },
  labelPicker: {
    fontSize: 16,
    color: '#00031E', // Light grey color for labels
    marginBottom: 10,
    fontWeight: 'bold',


    textAlign: 'left',
  },

  googleButton: {
    backgroundColor: '#4285F4', padding: 10, borderRadius: 5, marginBottom: 10,
    marginTop: 20
  },
  buttonText: { color: '#fff', textAlign: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { color: 'red', marginTop: 10, textAlign: 'center' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20, // Adjusted marginTop for the row
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#E2E2E2',
    paddingTop: 40,
    paddingHorizontal: 20,
  },


  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#EEEEEE',
    borderWidth: 0,
    borderWidth: 2,
    cursor: 'pointer',
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  }, row2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Adjusted marginTop for the row
  },
  heading3: {
    color: '#007BFF',
    fontSize: 20,
    textAlign: 'center',
  }, title: {
    color: '#007BFF',
    fontSize: 15,
    fontWeight: 'light',
    marginBottom: 30,
    textAlign: 'center',
  },
  heading: {
    color: '#00031E',
    fontSize: 50,
    fontWeight: "100",
    letterSpacing: -6,
    textAlign: 'center',
  },
  heading2: {
    color: '#00031E',
    fontSize: 20,
    textAlign: 'center',
  },
  highlight: {
    color: '#00031E',
  },
  formContainer: {
    flex: 1,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: '#00031E', // Light grey color for labels
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    padding: 10,
    fontSize: 18,
    borderColor: '#00031E', // Light grey border for inputs
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#E2E2E2', // Dark blue background for inputs
    color: '#00031E', // Light grey text color for inputs
  },
  input2: {
    padding: 10,
    fontSize: 18,
    borderColor: '#BDC3C7', // Light grey border for inputs
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#E2E2E2', // Dark blue background for inputs
    color: '#00031E', // Light grey text color for inputs
    height: 50, // Adjust the height for dropdown compatibility
  },
  buttonContainer: {
    marginTop: 10, // Adjusted marginTop to create a gap after the button
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconArrow: {
    color: '#00031E',
    opacity: 0.8,
  },


  spacer: {
    flex: 1,
    height: 73,// Makes the spacer take up available space, pushing the button to the bottom
  },
  iconArrow2: {
    color: '#00031E',
    opacity: 0.8, // Makes the icon slightly lighter to give a thin effect

  },
  iconCircle2: {
    marginLeft: 10, // Space between the text and the icon
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // Position the icon circle absolutely
    right: 10, // Align to the right edge of the button
    top: '50%', // Center vertically within the button
  },
  errorContainer: {
    backgroundColor: "red",
    marginTop: 20,
    borderRadius: 6,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#000',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: "green",
    marginTop: 20,
    borderRadius: 6,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    color: "#00031E",
  },
  checkboxLabel: {
    marginLeft: 20,
    fontSize: 16,
    color: '#00031E',
  },
  checkboxBox: {
    marginLeft: 10,
    fontSize: 16,
    color: '#00031E',
  }
  , button: {
    marginTop: 20, // Increased marginTop to create more space between picker and button
    backgroundColor: '#00031E', // Updated to match your color scheme
    paddingVertical: 12, // Slightly increased padding for a better look
    paddingHorizontal: 20, // Adjusted padding for a better look
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
    fontSize: 18, // Slightly increased font size for better readability
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
//#F1F1F1 for grey
//#E2E2E2 for dark grey
//#96ACC0 for blue