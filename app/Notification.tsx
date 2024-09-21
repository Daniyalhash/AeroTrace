import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Button, View, Alert, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
import * as Notifications from "expo-notifications";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue, set, remove, onDisconnect } from "firebase/database";
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

const sanitizePath = (path) => {
  if (path == null) {
    return ""; // Or handle as needed
  }
  return path.replace(/[.#$[\]]/g, "_");
};

const sanitizeToken = (token) => {
  if (token == null) {
    return ""; // Or handle as needed
  }
  return token.replace(/[.#$[\]]/g, "_");
};

export default function Notification() {
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
  /// delelting noti
  const handleDeleteNotification = async (notification) => {
    if (!notification || !notification.id) {
      Alert.alert("Error", "Cannot delete notification without an ID.");
      return;
    }
  
    try {
      const db = getDatabase();
      const sanitizedToken = sanitizeToken(currentUserId);
      const sanitizedId = sanitizePath(notification.id);
      const notificationRef = ref(db, `users/${sanitizedToken}/notifications/${sanitizedId}`);
      await set(notificationRef, null); // This deletes the notification from the database
  
      // Update state to remove the deleted notification
      setReceivedNotifications(prevNotifications =>
        prevNotifications.filter(item => item.id !== notification.id)
      );
  
    } catch (error) {
      console.error("Error deleting notification:", error);
      Alert.alert("Error", "Failed to delete notification.");
    }
  };
  // geettiing notificaiton
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
  // printing all notificaiton
  useEffect(() => {
    const db = getDatabase();
    const notificationsRef = ref(db, `users/${sanitizeToken(currentUserId)}/notifications`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("Notifications Data:", data); // Add this line
        const notificationsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setReceivedNotifications(notificationsArray);
      } else {
        setReceivedNotifications([]);
      }
    });
  
    return () => unsubscribe();
  }, [currentUserId]);

  console.log("Received Notifications:", receivedNotifications);


  return (
    <View style={styles.container} >
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
        <Text style={styles.heading3}>Notification Centers</Text>
      </View>
      {/* Scrollable List */}
   {/* Scrollable List */}
   <View style={styles.scrollableContainer}>
      {receivedNotifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications yet</Text>
      ) : (
        <FlatList
          data={receivedNotifications}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "No date available"}</Text>
              <TouchableOpacity onPress={() => handleDeleteNotification(item)} style={styles.iconCircle}>
                <FontAwesomeIcon icon={faTrash} size={25} color="#FF0000" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id} // Use unique ID as key
        />
      )}
    </View>

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

  }, deleteButton: {
    padding: 5,
   
    alignItems:'center',
    marginLeft: 0,
  }, row2: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
  },
  scrollableContainer: {
    flex: 1, // Takes the remaining space, making it scrollable
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#EEEEEE',
    borderWidth: 2,
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
  highlight: {
    color: '#00031E',
  },
  heading3: {
    color: '#007BFF',
    fontSize: 20,
    textAlign: 'center',
  },
  rowMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '35%',
  },
  iconImage: {
    width: 40, // Adjust to fit within the circle
    height: 40, // Adjust to fit within the circle
    borderRadius: 20, // Make the image circular
  },

  spacer: {
    height: 60,
    flex: 1,
  },
  noNotifications: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888', // or any color that suits your design
  },
  notificationItem: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#f1f1f1",
    borderRadius: 15,
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
    color: '#007BFF',
  },

});
