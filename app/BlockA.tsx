// import { firebase } from '@react-native-firebase/messaging';
import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Notifications from "expo-notifications";

import { getDatabase, database, push, onDisconnect } from './firebaseConfig'; // Import Firebase Realtime Database
import { ref, set } from 'firebase/database';
import * as SplashScreen from 'expo-splash-screen';
import { Picker } from '@react-native-picker/picker';
import Mybutton from "@/components/Mybutton";
import useUsers from '@/components/useUser';
import CustomPicker from "@/components/CustomPicker";
// Notification handler configuration

import { getAuth } from 'firebase/auth';

// Notification handler configuration
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

export default function BlockA() {
  const [nomenclature, setNomenclature] = useState('');
  const [partNo, setPartNo] = useState('');
  const [aircraftRegistration, setAircraftRegistration] = useState('');
  const [recipientStation, setRecipientStation] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [reason, setReason] = useState('');
  const [atlbRefNo, setAtlbRefNo] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [pushToken, setPushToken] = useState();
  const [reportId, setReportId] = useState<string | null>(null);
  //main
  const [selectedUserToken, setSelectedUserToken] = useState(null);
  const [receivedNotifications, setReceivedNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const router = useRouter();
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const sanitizedToken = user ? sanitizeToken(user.uid) : null;
  // Load custom fonts
  const userData = useUsers();  // Get the object with 'activeCount' and 'users'
  const users = userData?.users || []; // Safely access the array of users

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
  //notification // permission
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
          console.log("Navigating to screen:", screen, "with reportId:", reportId);
          router.push({ pathname: screen, params: { reportId } }); // Corrected to use 'router.push'
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
    setNomenclature('');
    setPartNo('');
    setAircraftRegistration('');
    setRecipientStation('');
    setVoucherNo('');
    setReason('');
    setAtlbRefNo('');
    setSignature('');
  };
  const handleSubmit = async () => {
    setLoading(true);

    if (!nomenclature || !partNo || !aircraftRegistration || !recipientStation || !voucherNo || !reason || !atlbRefNo || !signature) {
      setError('All fields are required.');

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);

      return; // Prevent further execution if there's an error
    }
    if (!selectedUserToken) {
      setError("Select an Officer!")
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }
    try {
      // Reference to the reports node in your Firebase Database
      const reportsRef = ref(database, '/cannibalizationReports');

      // Use push() to generate a new report ID and get its reference
      const newReportRef = push(reportsRef);
      const useId = newReportRef.key
      console.log("Generated Report ID:", useId); // Log the key

      // Use the generated key to create a reference to 'blockA'
      const blockARef = ref(database, `/cannibalizationReports/${useId}/blockA`);

      // Save the data under the generated ID
      await set(blockARef, {
        nomenclature,
        partNo,
        aircraftRegistration,
        recipientStation,
        voucherNo,
        reason,
        atlbRefNo,
        signature,
        timestamp: new Date().toISOString(),
      });

      console.log('Submitting form with data:', {
        nomenclature,
        partNo,
        aircraftRegistration,
        recipientStation,
        voucherNo,
        reason,
        atlbRefNo,
        signature,
      });
      setReportId(useId); // Ensure this is set correctly

      // Ensure the notification is sent after reportId is set
      if (useId) {
        await triggerNotificationHandler(useId); // Pass reportId to the function
      }
      // Set success message
      setSuccess('Form submitted successfully!');
      clearFields();

      // Navigate to BlockB and pass the generated report ID
      // router.push({ pathname: './BlockB', params: { reportId: newReportRef.key } });
      router.push({ pathname: './Home' });

      // Set the report ID state
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'There was an error submitting the form. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // UseEffect to monitor changes to reportId
  useEffect(() => {
    if (reportId) {
      console.log("Updated report Id:", reportId);
    }
  }, [reportId]);
  console.log(users.map(user => ({
    label: `${user.name} ${user.email}`,
    value: user.deviceToken,
    textColor: user.status === 'online' ? '#90EE90' : '#721C24',
    backgroundColor: user.status === 'online' ? '#E0FFD1' : '#F8D7DA',
  })));

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
          body: `Mr. ${selectedUserName} Block A has been completed, Now Complete Block B  from ${currentUserEmail}: Click to open the specific form.`,
          data: {
            screen: "BlockB",
            reportId: reportId, // Pass the reportId correctly
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send push notification.");
      }

      // Save notification details to the selected user's database path

      const notificationId = Date.now().toString(); // Unique ID for the notification
      await set(ref(database, `users/${sanitizeToken(selectedUserId)}/notifications/${notificationId}`), {
        title: `Cannibalization Form :${reportId}`,
        body: `Mr. ${selectedUserName} Block A has been completed, Now Complete Block B  from ${currentUserEmail}: Click to open the specific form.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        formId: reportId,
        sender: currentUserEmail, // Add sender information
      });
    } catch (error) {
      console.error("Error sending push notification:", error);
      Alert.alert("Error", "Failed to send push notification.");
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView>

      <View style={styles.row}>

        <Text style={styles.heading}>
          Aero
          <Text style={styles.highlight}>Trace</Text>
        </Text>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('./Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
        </TouchableOpacity>
      </View>
      <View style={styles.row2}>
        <Text style={styles.heading3}> BLOCK A CANNIBALIZATION REQUEST</Text>
      </View>


      <View style={styles.formContainer}>
        <Text style={styles.label}>Nomenclature:</Text>
        <TextInput
          style={styles.input}
          value={nomenclature}
          onChangeText={(text) => setNomenclature(text)}
          placeholder="Enter the nomenclature"
          placeholderTextColor="#96ACC0"
        />
        <Text style={styles.label}>Part No:</Text>
        <TextInput
          style={styles.input}
          value={partNo}
          onChangeText={(text) => setPartNo(text)}
          placeholder="Enter the part number"
          placeholderTextColor="#96ACC0"
        />
        <Text style={styles.label}>Recipient Aircraft Registration:</Text>
        <TextInput
          style={styles.input}
          value={aircraftRegistration}
          onChangeText={(text) => setAircraftRegistration(text)}
          placeholder="Enter the aircraft registration"
          placeholderTextColor="#96ACC0"
        />
        <Text style={styles.label}>Recipient Station:</Text>
        <TextInput
          style={styles.input}
          value={recipientStation}
          onChangeText={(text) => setRecipientStation(text)}
          placeholder="Enter the recipient station"
          placeholderTextColor="#96ACC0"
        />
        <Text style={styles.label}>Proof Of NIL-IN-STOCK (Voucher No.):</Text>
        <TextInput
          style={styles.input}
          value={voucherNo}
          onChangeText={(text) => setVoucherNo(text)}
          placeholder="Enter voucher number"
          placeholderTextColor="#96ACC0"
        />
        <Text style={styles.label}>Reason(s) for Cannibalization:</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={(text) => setReason(text)}
          placeholder="Enter reasons"
          placeholderTextColor="#96ACC0"
        />
        <Text style={styles.label}>ATLB Ref No with Date (Pertaining to Defect):</Text>
        <TextInput
          style={styles.input}
          value={atlbRefNo}
          onChangeText={(text) => setAtlbRefNo(text)}
          placeholder="Enter ATLB Ref No with date"
          placeholderTextColor="#96ACC0"
        />
        <Text style={styles.label}>Shift Incharge/Certifying Staff</Text>
        <Text style={styles.label}>Signature/Date/Stamp</Text>
        <TextInput
          style={styles.input}
          value={signature}
          onChangeText={(text) => setSignature(text)}
          placeholder="Enter signature/date/stamp"
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

      </View>
      <View style={styles.spacer} />
      <View style={styles.spacer} />

    </ScrollView>
        </View>

  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    padding: 20,
    marginBottom: 50, // Add margin below the picker
  },
  labelPicker: {
    fontSize: 16,
    color: '#00031E', // Light grey color for labels
    marginBottom: 10,
    fontWeight: 'bold',


    textAlign: 'left',
  },
  picker: {
    width: '100%',
  },
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
    marginTop: 20, // Adjusted marginTop for the row
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Adjusted marginTop for the row
  },
  heading3: {
    color: '#007BFF',
    fontSize: 20,
    textAlign: 'center',
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


    textAlign: 'left',
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
    borderColor: '#96ACC0',
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
  }, button: {
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
  }, pickerContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
    borderWidth: 2,
  },
});
//# for grey
//#E2E2E2 for dark grey
//#96ACC0 for blueF1F1F1