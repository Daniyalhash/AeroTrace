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
  const router = useRouter();
  const users = useUsers();
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const sanitizedToken = user ? sanitizeToken(user.uid) : null;

  useEffect(() => {
    // Track user presence in the database
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

  useEffect(() => {
    if (currentUserId) {
      const db = getDatabase();
      const notificationsRef = ref(db, `users/${currentUserId}/notifications`);

      const unsubscribe = onValue(notificationsRef, (snapshot) => {
        console.log('Fetching notifications...');
        const notificationsData = snapshot.val();

        if (notificationsData) {
          console.log('Notifications data:', notificationsData);
          const notificationsList = Object.values(notificationsData);
          setReceivedNotifications(notificationsList);
        } else {
          console.log("No notifications found for this user.");
        }
      }, (error) => {
        console.error("Error fetching notifications:", error);
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
    }
  }, [currentUserId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.heading}>
          Aero<Text style={styles.highlight}>Trace</Text>
        </Text>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.navigate('./Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
        </TouchableOpacity>
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
          keyExtractor={(item) => item.timestamp.toString()} // Ensure this is a string
        />
      </View>
      <StatusBar style="auto" hidden={true} /> {/* Hide the status bar */}

    </ScrollView>
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    color: '#00031E',
    fontSize: 50,
    fontWeight: "100",
    letterSpacing: -6,
    textAlign: 'center',
    fontFamily: 'Chillax',
  },
  highlight: {
    color: '#00031E',
  },
  notificationContainer: {
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
});
