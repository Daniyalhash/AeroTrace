import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Button, View, Alert, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
import * as Notifications from "expo-notifications";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue, set, onDisconnect } from "firebase/database";
import { getAuth } from 'firebase/auth';
import Mybutton from "@/components/Mybutton";
import CustomPicker from "@/components/CustomPicker";
import useUsers from "@/components/useUser";

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

export default function NotificationService() {
  const [pushToken, setPushToken] = useState();
  const [selectedUserToken, setSelectedUserToken] = useState(null);
  const [receivedNotifications, setReceivedNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const router = useRouter();
  const userData = useUsers();  // Get the object with 'activeCount' and 'users'

  const auth = getAuth();
  const user = auth.currentUser;

  // Extract users array from the userData
  const users = userData?.users || []; // Safely access the array of users

  useEffect(() => {
    if (!users || !Array.isArray(users)) {
      console.log('Users not fetched yet or invalid:', users); // Debugging line
      return;
    }

    console.log('Fetched users:', users); // Debugging line for checking users data
  }, [users]);
  useEffect(() => {
    const trackUserPresence = () => {
      if (user) {
        const database = getDatabase();
        const userStatusRef = ref(database, `/status/${user.uid}`);
        set(userStatusRef, { online: true });
        onDisconnect(userStatusRef).set({ online: false });
      }
    };

    trackUserPresence();
  }, [user]);
  // for notidfication
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
        const { screen, formId } = response.notification.request.content.data;
        if (screen) {
          router.navigate(screen, { formId });
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
  }, [user]);
  //fetching the notification
  useEffect(() => {
    if (currentUserId) {
      const db = getDatabase();
      const notificationsRef = ref(db, `users/${currentUserId}/notifications`);

      const unsubscribe = onValue(notificationsRef, (snapshot) => {
        const notificationsData = snapshot.val();

        if (notificationsData) {
          const notificationsList = Object.values(notificationsData);
          setReceivedNotifications(notificationsList);
        }
      }, (error) => {
        console.error("Error fetching notifications:", error);
      });

      return () => unsubscribe();
    }
  }, [currentUserId]);
  // sednding and saving notificaiotn
  const triggerNotificationHandler = async () => {
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
          sound: "default",
          title: "Action Required",
          body: `Hi ${selectedUserName}, Notification to ${selectedUserName} from ${currentUserEmail}: Click to open the specific form.`,
          data: {
            screen: "Home",
            formId: "formB",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send push notification.");
      }

      Alert.alert("Success", "Push notification sent!");

      // Save notification details to the selected user's database path
      const db = getDatabase();
      const notificationId = Date.now().toString(); // Unique ID for the notification
      await set(ref(db, `users/${sanitizeToken(selectedUserId)}/notifications/${notificationId}`), {
        title: "Action Required",
        body: `Hi ${selectedUserName}, Notification to ${selectedUserName} from ${currentUserEmail}: Click to open the specific form.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        formId: "formB",
        sender: currentUserEmail, // Add sender information
      });

    } catch (error) {
      console.error("Error sending push notification:", error);
      Alert.alert("Error", "Failed to send push notification.");
    }
  };


  return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('./Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
        </TouchableOpacity>

        {/* Picker for selecting a user */}
        {/* Picker for selecting a user */}
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

        <View style={styles.buttonContainer}>
          <Mybutton title="Send Push Notification" onPress={triggerNotificationHandler} />
        </View>

        <View style={styles.notificationContainer}>
          <Text style={styles.header}>Notifications</Text>
          <FlatList
            data={receivedNotifications}
            renderItem={({ item }) => (
              <View style={styles.notificationItem}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.date}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
            )}
            keyExtractor={(item) => item.timestamp}
          />
        </View>

      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 70,
    gap: 50,
    paddingHorizontal: 20,
  },
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
    borderWidth:2,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 40,
    width: "80%",
  },
  iconCircle: {
    margin: 10,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 50,
    alignSelf: "flex-start",
  },
  notificationItem: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "black",
    width: "100%",
    borderRadius: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  }, notificationContainer: {
    width: "100%",
    marginTop: 20,
  },
  notificationItem: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  body: {
    fontSize: 14,
    marginVertical: 4,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  onlineText: {
    color: '#155724',
  },
  offlineText: {
    color: '#721C24',
  }, picker: {
    height: 150,
    width: '100%',
  },
});
