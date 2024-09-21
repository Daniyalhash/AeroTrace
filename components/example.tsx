

// import { StatusBar } from "expo-status-bar";
// import React, { useEffect, useState } from "react";
// import { StyleSheet, Button, View, Alert, Text, TouchableOpacity } from "react-native";
// import * as Notifications from "expo-notifications";
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { useRouter } from 'expo-router';
// import { getDatabase, ref, onValue } from "firebase/database";
// import { Picker } from '@react-native-picker/picker';
// import Mybutton from "@/components/Mybutton";
// import CustomPicker from "@/components/CustomPicker";
// import useUsers from "@/components/useUser";

// // Notification handler configuration
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function NotificationService() {
//   const [pushToken, setPushToken] = useState();
//   const [selectedUserToken, setSelectedUserToken] = useState(null);
//   const router = useRouter();
//   const users = useUsers();

//   useEffect(() => {
//     const registerForPushNotificationsAsync = async () => {
//       try {
//         // Check for existing permissions
//         const { status: existingStatus } = await Notifications.getPermissionsAsync();
//         let finalStatus = existingStatus;

//         // Request permission if not already granted
//         if (existingStatus !== "granted") {
//           const { status } = await Notifications.requestPermissionsAsync();
//           finalStatus = status;
//         }

//         if (finalStatus !== "granted") {
//           throw new Error("Permission not granted for push notifications.");
//         }

//         // Get the Expo push token
//         const { data: token } = await Notifications.getExpoPushTokenAsync();
//         setPushToken(token);
//         console.log("Push token:", token);
//       } catch (error) {
//         console.error("Failed to get push token:", error);
//       }
//     };

//     registerForPushNotificationsAsync();

//     // Set up notification listeners
//     const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
//       console.log("Notification response received:", response);
//     });

//     const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
//       console.log("Notification received:", notification);
//     });

//     // Clean up listeners on component unmount
//     return () => {
//       backgroundSubscription.remove();
//       foregroundSubscription.remove();
//     };
//   }, []);

//   // Set up notification listener
// useEffect(() => {
//   const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
//     const { screen, formId } = response.notification.request.content.data;

//     if (screen) {
//       router.navigate(screen, { formId });
//     }
//   });

//   return () => backgroundSubscription.remove();
// }, []);
//   //send a notification
//   const triggerNotificationHandler = async () => {
//     if (!selectedUserToken || selectedUserToken === null) { // Correctly handles null or undefined value
//       Alert.alert("Error", "Please select a user to send the notification.");
//       return;
//     }

//     try {
//       const response = await fetch("https://exp.host/--/api/v2/push/send/", {

//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           to: selectedUserToken,
//           sound: 'default',
//           title: "Cannibalization Form",
//           body: "Block A has been Completed, Now complete block B",
//           data: {
//             screen: "BlockB", // Custom data for navigation
//             formId: "formB" // Example identifier
//           },
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to send push notification.");
//       }

//       Alert.alert("Success", "Push notification sent!");
//     } catch (error) {
//       console.error("Error sending push notification:", error);
//       Alert.alert("Error", "Failed to send push notification.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('./Home')}>
//         <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
//       </TouchableOpacity>

//       {/* Picker for selecting a user */}
//       <View style={styles.pickerContainer}>
//       <CustomPicker
//         selectedValue={selectedUserToken}
//         onValueChange={setSelectedUserToken}
//         items={users.map(user => ({
//           label: `${user.name} (${user.email})`,
//           value: user.deviceToken
//         }))}
//       />

//       </View>

//       <View style={styles.buttonContainer}>
//         <Mybutton title="Send Push Notification" onPress={triggerNotificationHandler} />
//       </View>

//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "flex-start", // Align content to the top
//     paddingTop: 70,
//     paddingHorizontal: 20,
//   },
//   pickerContainer: {
//     width: '100%',
//     alignItems: 'center',
//     marginVertical: 20, // Adds space above and below the picker
//   },
//   picker: {
//     height: 50,
//     width: '80%',
//   },
//   buttonContainer: {
//     marginTop: 'auto', // Pushes the button to the bottom
//     marginBottom: 40, // Adds some space at the bottom
//     width: '80%',
//   },
//   iconCircle: {
//     margin: 10,
//     padding: 10,
//     backgroundColor: '#eee',
//     borderRadius: 50,
//     alignSelf: 'flex-start',
//   },
// });

// // import { StatusBar } from "expo-status-bar";
// // import React, { useEffect, useState } from "react";
// // import { StyleSheet, Alert, Text, TouchableOpacity, View, FlatList } from "react-native";
// // import * as Notifications from "expo-notifications";
// // import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// // import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// // import { useRouter } from 'expo-router';
// // import { getDatabase, ref, onValue, push } from "firebase/database";
// // import Mybutton from "@/components/Mybutton";
// // import CustomPicker from "@/components/CustomPicker";
// // import useUsers from "@/components/useUser";

// // import { getAuth } from 'firebase/auth';

// // // Notification handler configuration
// // Notifications.setNotificationHandler({
// //   handleNotification: async () => ({
// //     shouldShowAlert: true,
// //     shouldPlaySound: true,
// //     shouldSetBadge: false,
// //   }),
// // });

// // export default function NotificationService() {
// //   const [pushToken, setPushToken] = useState();
// //   const [selectedUserToken, setSelectedUserToken] = useState(null);
// //   const [notificationHistory, setNotificationHistory] = useState([]);
// //   const [currentUserId, setCurrentUserId] = useState(null); // State for storing current user ID
// //   const router = useRouter();
// //   const users = useUsers();

// //   useEffect(() => {
// //     // Get current user ID from Firebase Authentication
// //     const auth = getAuth();
// //     const user = auth.currentUser;
// //     if (user) {
// //       setCurrentUserId(user.uid);
// //     } else {
// //       // Handle the case where the user is not logged in
// //       Alert.alert("Error", "User not authenticated.");
// //     }
// //     const registerForPushNotificationsAsync = async () => {
// //       try {
// //         const { status: existingStatus } = await Notifications.getPermissionsAsync();
// //         let finalStatus = existingStatus;

// //         if (existingStatus !== "granted") {
// //           const { status } = await Notifications.requestPermissionsAsync();
// //           finalStatus = status;
// //         }

// //         if (finalStatus !== "granted") {
// //           throw new Error("Permission not granted for push notifications.");
// //         }

// //         const { data: token } = await Notifications.getExpoPushTokenAsync();
// //         setPushToken(token);
// //         console.log("Push token:", token);
// //       } catch (error) {
// //         console.error("Failed to get push token:", error);
// //       }
// //     };

// //     registerForPushNotificationsAsync();

// //     const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
// //       console.log("Notification response received:", response);
// //     });

// //     const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
// //       console.log("Notification received:", notification);
// //     });

// //     return () => {
// //       backgroundSubscription.remove();
// //       foregroundSubscription.remove();
// //     };
// //   }, []);

// //   // Fetch notification history from Firebase
// //   useEffect(() => {
// //     const database = getDatabase();
// //     const notificationsRef = ref(database, '/notifications');

// //     onValue(notificationsRef, (snapshot) => {
// //       const data = snapshot.val();
// //       const notificationList = [];

// //       for (let id in data) {
// //         notificationList.push({ id, ...data[id] });
// //       }

// //       setNotificationHistory(notificationList);
// //     });
// //   }, []);

// //   const triggerNotificationHandler = async () => {
// //     if (!selectedUserToken) {
// //       Alert.alert("Error", "Please select a user to send the notification.");
// //       return;
// //     }

// //     try {
// //       const response = await fetch("https://exp.host/--/api/v2/push/send/", {
// //         method: "POST",
// //         headers: {
// //           Accept: "application/json",
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           to: selectedUserToken,
// //           sound: 'default',
// //           title: "Action Required",
// //           body: "Click to open the specific form.",
// //           data: {
// //             screen: "BlockA",
// //             formId: "formB"
// //           },
// //         }),
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to send push notification.");
// //       }

// //       Alert.alert("Success", "Push notification sent!");

// //       // Save notification to Firebase
// //       const database = getDatabase();
// //       const notificationsRef = ref(database, '/notifications');
// //       const newNotification = {
// //         to: selectedUserToken,
// //         title: "Action Required",
// //         body: "Click to open the specific form.",
// //         date: new Date().toISOString()
// //       };

// //       await push(notificationsRef, newNotification);

// //     } catch (error) {
// //       console.error("Error sending push notification:", error);
// //       Alert.alert("Error", "Failed to send push notification.");
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('./Home')}>
// //         <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
// //       </TouchableOpacity>

// //       {/* Picker for selecting a user */}
// //       <View style={styles.pickerContainer}>
// //         <CustomPicker
// //           selectedValue={selectedUserToken}
// //           onValueChange={setSelectedUserToken}
// //           items={users.map(user => ({
// //             label: `${user.name} (${user.email})`,
// //             value: user.deviceToken
// //           }))}
// //         />
// //       </View>

// //       <View style={styles.buttonContainer}>
// //         <Mybutton title="Send Push Notification" onPress={triggerNotificationHandler} />
// //       </View>

// //       {/* Display Notification History */}
// //       <FlatList
// //         data={notificationHistory}
// //         keyExtractor={(item) => item.id}
// //         renderItem={({ item }) => (
// //           <View style={styles.notificationItem}>
// //             <Text>{item.title}</Text>
// //             <Text>{item.body}</Text>
// //             <Text>{new Date(item.date).toLocaleString()}</Text>
// //           </View>
// //         )}
// //       />

// //       <StatusBar style="auto" />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#fff",
// //     alignItems: "center",
// //     justifyContent: "flex-start",
// //     paddingTop: 70,
// //     paddingHorizontal: 20,
// //   },
// //   pickerContainer: {
// //     width: '100%',
// //     alignItems: 'center',
// //     marginVertical: 20,
// //   },
// //   buttonContainer: {
// //     marginTop: 'auto',
// //     marginBottom: 40,
// //     width: '80%',
// //   },
// //   iconCircle: {
// //     margin: 10,
// //     padding: 10,
// //     backgroundColor: '#eee',
// //     borderRadius: 50,
// //     alignSelf: 'flex-start',
// //   },
// //   notificationItem: {
// //     padding: 10,
// //     marginVertical: 8,
// //     backgroundColor: '#f1f1f1',
// //     width: '100%',
// //     borderRadius: 5,
// //   }
// // });

// import { StatusBar } from "expo-status-bar";
// import React, { useEffect, useState } from "react";
// import { StyleSheet, Button, View, Alert, Text, TouchableOpacity, FlatList } from "react-native";
// import * as Notifications from "expo-notifications";
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { useRouter } from 'expo-router';
// import { getDatabase, ref, onValue, push,set,onDisconnect } from "firebase/database";
// import { getAuth } from 'firebase/auth';
// import Mybutton from "@/components/Mybutton";
// import CustomPicker from "@/components/CustomPicker";
// import useUsers from "@/components/useUser";

// // Notification handler configuration
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function NotificationService() {
//   const [pushToken, setPushToken] = useState();
//   const [selectedUserToken, setSelectedUserToken] = useState(null);
//   const [notificationHistory, setNotificationHistory] = useState([]);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const router = useRouter();
//   const users = useUsers();
//   const trackUserPresence = () => {
//     const auth = getAuth();
//     const database = getDatabase();
//     const user = auth.currentUser;
  
//     if (user) {
//       const userStatusRef = ref(database, `/status/${user.uid}`);
  
//       // Set the user as 'online' in the database
//       set(userStatusRef, { online: true });
  
//       // Remove 'online' status when the user disconnects
//       onDisconnect(userStatusRef).set({ online: false });
//     }
//   };
  
//   useEffect(() => {
//     trackUserPresence();
//   }, []);
//   useEffect(() => {
//     // Get current user ID from Firebase Authentication
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (user) {
//       setCurrentUserId(user.uid);
//     } else {
//       Alert.alert("Error", "User not authenticated.");
//     }

//     const registerForPushNotificationsAsync = async () => {
//       try {
//         const { status: existingStatus } = await Notifications.getPermissionsAsync();
//         let finalStatus = existingStatus;

//         if (existingStatus !== "granted") {
//           const { status } = await Notifications.requestPermissionsAsync();
//           finalStatus = status;
//         }

//         if (finalStatus !== "granted") {
//           throw new Error("Permission not granted for push notifications.");
//         }

//         const { data: token } = await Notifications.getExpoPushTokenAsync();
//         setPushToken(token);
//         console.log("Push token:", token);
//       } catch (error) {
//         console.error("Failed to get push token:", error);
//       }
//     };

//     registerForPushNotificationsAsync();

//     const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
//       const { screen, formId } = response.notification.request.content.data;
//       if (screen) {
//         router.navigate(screen, { formId });
//       }
//     });

//     const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
//       console.log("Notification received:", notification);
//     });

//     return () => {
//       backgroundSubscription.remove();
//       foregroundSubscription.remove();
//     };
//   }, []);

//   // Fetch notification history from Firebase
//   useEffect(() => {
//     const database = getDatabase();
//     const notificationsRef = ref(database, '/notifications');

//     onValue(notificationsRef, (snapshot) => {
//       const data = snapshot.val();
//       const notificationList = [];

//       for (let id in data) {
//         notificationList.push({ id, ...data[id] });
//       }

//       setNotificationHistory(notificationList);
//     });
//   }, []);
//   const checkUserOnlineStatus = async (userId) => {
//     const database = getDatabase();
//     const statusRef = ref(database, `/status/${userId}`);
//     let isOnline = false;
  
//     // Use a promise to check the user's online status
//     await onValue(statusRef, (snapshot) => {
//       const status = snapshot.val();
//       if (status && status.online) {
//         isOnline = true;
//       }
//     });
  
//     return isOnline;
//   };
  

//   const triggerNotificationHandler = async () => {
//     if (!selectedUserToken) {
//       Alert.alert("Error", "Please select a user to send the notification.");
//       return;
//     }

//     try {
//       const response = await fetch("https://exp.host/--/api/v2/push/send/", {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           to: selectedUserToken,
//           sound: 'default',
//           title: "Action Required",
//           body: "Click to open the specific form.",
//           data: {
//             screen: "BlockA",
//             formId: "formB"
//           },
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to send push notification.");
//       }

//       Alert.alert("Success", "Push notification sent!");

//       // Save notification to Firebase
//       const database = getDatabase();
//       const notificationsRef = ref(database, '/notifications');
//       const newNotification = {
//         to: selectedUserToken,
//         title: "Action Required",
//         body: "Click to open the specific form.",
//         date: new Date().toISOString()
//       };

//       await push(notificationsRef, newNotification);
//     } catch (error) {
//       console.error("Error sending push notification:", error);
//       Alert.alert("Error", "Failed to send push notification.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('./Home')}>
//         <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
//       </TouchableOpacity>

//       {/* Picker for selecting a user */}
//       <View style={styles.pickerContainer}>
//         <CustomPicker
//           selectedValue={selectedUserToken}
//           onValueChange={setSelectedUserToken}
//           items={users.map(user => ({
//             label: `${user.name} (${user.email})`,
//             value: user.deviceToken
//           }))}
//         />
//       </View>

//       <View style={styles.buttonContainer}>
//         <Mybutton title="Send Push Notification" onPress={triggerNotificationHandler} />
//       </View>

//       {/* Display Notification History */}
//       <FlatList
//         data={notificationHistory}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.notificationItem}>
//             <Text>{item.user}</Text>
//             <Text>{item.body}</Text>
//             <Text>{new Date(item.date).toLocaleString()}</Text>
//           </View>
//         )}
//       />

//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "flex-start",
//     paddingTop: 70,
//     paddingHorizontal: 20,
//   },
//   pickerContainer: {
//     width: '100%',
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   buttonContainer: {
//     marginTop: 'auto',
//     marginBottom: 40,
//     width: '80%',
//   },
//   iconCircle: {
//     margin: 10,
//     padding: 10,
//     backgroundColor: '#eee',
//     borderRadius: 50,
//     alignSelf: 'flex-start',
//   },
//   notificationItem: {
//     padding: 10,
//     marginVertical: 8,
//     backgroundColor: '#f1f1f1',
//     width: '100%',
//     borderRadius: 5,
//   }
// });
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Button, View, Alert, Text, TouchableOpacity,ScrollView, FlatList } from "react-native";
import * as Notifications from "expo-notifications";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'expo-router';
import { getDatabase, ref,get, onValue, push, set, onDisconnect } from "firebase/database";
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
const sanitizeToken = (token) => {
  return token.replace(/[.#$[\]]/g, '_'); // Replace invalid characters with underscores
};
export default function NotificationService() {
  const [pushToken, setPushToken] = useState();
  const [selectedUserToken, setSelectedUserToken] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();
  const users = useUsers();
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [receivedNotificationHistory, setReceivedNotificationHistory] = useState([]);
  const [sentNotificationHistory, setSentNotificationHistory] = useState([]);
  const auth = getAuth();
    const user = auth.currentUser;
    const sanitizedToken = sanitizeToken(user.uid);
    const [receivedNotifications, setReceivedNotifications] = useState([]);
    const [sentNotifications, setSentNotifications] = useState([]);
  // Track user presence
  const trackUserPresence = () => {
    const auth = getAuth();
    const database = getDatabase();
    const user = auth.currentUser;

    if (user) {
      const userStatusRef = ref(database, `/status/${user.uid}`);

      // Set the user as 'online' in the database
      set(userStatusRef, { online: true });

      // Remove 'online' status when the user disconnects
      onDisconnect(userStatusRef).set({ online: false });
    }
  };

  useEffect(() => {
    trackUserPresence();
  }, []);

  useEffect(() => {
    // Get current user ID from Firebase Authentication
  
    
    if (user) {
      setCurrentUserId(user.uid);
      setCurrentUserEmail(user.email);} // Set email instead of name
      else {
      Alert.alert("Error", "User not authenticated.");
    }

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
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const database = getDatabase();

      const fetchSentNotifications = async (sanitizedToken) => {
        const database = getDatabase();
        const refPath = `notifications/sent/${sanitizedToken}`;
        const snapshot = await get(ref(database, refPath));
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } else {
          return [];
        }
      }
      const fetchReceivedNotifications = async (sanitizedToken) => {
        const database = getDatabase();
        const refPath = `notifications/users/${sanitizedToken}/received`;
        const snapshot = await get(ref(database, refPath));
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } else {
          return [];
        }
      };
     
    
   
    } else {
      Alert.alert("Error", "User not authenticated.");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReceivedNotifications(userId).then(notifications => setReceivedNotifications(notifications));
      fetchSentNotifications(userId).then(notifications => setSentNotifications(notifications));
    }
  }, [userId]);
//  useEffect(() => {
//     if (sanitizedToken) {
//       fetchReceivedNotifications(sanitizedToken).then(notifications => setReceivedNotifications(notifications));
//       fetchSentNotifications(sanitizedToken).then(notifications => setSentNotifications(notifications));
//     }
//   }, [sanitizedToken]);
  // const checkUserOnlineStatus = async (userId) => {
  //   const database = getDatabase();
  //   const statusRef = ref(database, `/status/${userId}`);
  //   let isOnline = false;
    
  //   // Wrapping onValue in a promise
  //   await new Promise((resolve) => {
  //     onValue(statusRef, (snapshot) => {
  //       const status = snapshot.val();
  //       if (status && status.online) {
  //         isOnline = true;
  //       }
  //       resolve();
  //     });
  //   });
  
  //   return isOnline;
  // };
  
// const findUserIdByToken = async (token) => {
//   const database = getDatabase();
//   const usersRef = ref(database, `/users`);

//   return new Promise((resolve, reject) => {
//     onValue(usersRef, (snapshot) => {
//       const users = snapshot.val();
//       for (const userId in users) {
//         if (users[userId].token === token) {
//           resolve(userId); // Found the user ID by matching token
//           return;
//         }
//       }
//       reject(new Error("User not found"));
//     });
//   });
// };
//   const triggerNotificationHandler = async () => {
//     if (!selectedUserToken) {
//       Alert.alert("Error", "Please select a user to send the notification.");
//       return;
//     }
  
//     try {

//       // Logging for debugging
//       console.log("Sending notification to:", selectedUserToken);
   

//       const response = await fetch("https://exp.host/--/api/v2/push/send/", {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           to: selectedUserToken,
//           sound: 'default',
//           title: "Action Required",
//           body: `Notification from ${currentUserEmail}: Click to open the specific form.`,
//           data: {
//             screen: "Home",
//             formId: "formB"
//           },
//         }),
//       });
  
//       if (!response.ok) {
//         throw new Error("Failed to send push notification.");
//       }
  
//       Alert.alert("Success", "Push notification sent!");
  
//       const database = getDatabase();
//       const user = getAuth().currentUser;
   
//       if (user) {
//         // Update sender's notifications
//         const sanitizedToken1 = sanitizeToken(user.uid);
//         const sanitizedToken2 = sanitizeToken(selectedUserToken);
        
//         const saveSentNotification = async (sanitizedToken1, notification) => {
//           const database = getDatabase();
//           const refPath = `notifications/sent/${sanitizedToken1}`;
//           await push(ref(database, refPath), notification);
//         };


//         const saveReceivedNotification = async (sanitizedToken1, notification) => {
//           const database = getDatabase();
//           const refPath = `notifications/users/${sanitizedToken1}/received`;
//           await push(ref(database, refPath), notification);
//         };
        
       
//       } else {
//         Alert.alert("Error", "User not authenticated.");
//       }
//     } catch (error) {
//       console.error("Error sending push notification:", error);
//       console.error("Error finding user ID by token:", error);

//       Alert.alert("Error", "Failed to send push notification.");
//     }
//   };
  

//   return (
//     <ScrollView>
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('./Home')}>
//         <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
//       </TouchableOpacity>

//       {/* Picker for selecting a user */}
//       <View style={styles.pickerContainer}>
//         <CustomPicker
//           selectedValue={selectedUserToken}
//           onValueChange={setSelectedUserToken}
//           items={users.map(user => ({
//             label: `${user.name} (${user.email})`,
//             value: user.deviceToken
//           }))}
//         />
//       </View>

//       <View style={styles.buttonContainer}>
//         <Mybutton title="Send Push Notification" onPress={triggerNotificationHandler} />
//       </View>

//     {/* Display Notification History for current user */}
//     <View style={styles.container}>
//       <Text style={styles.header}>Received Notifications</Text>
//       <FlatList
//         data={receivedNotifications}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.notificationItem}>
//             <Text style={styles.title}>Title: {item.title}</Text>
//             <Text style={styles.body}>Body: {item.body}</Text>
//             <Text style={styles.date}>Date: {new Date(item.date).toLocaleString()}</Text>
//           </View>
//         )}
//       />
//       <Text style={styles.header}>Sent Notifications</Text>
//       <FlatList
//         data={sentNotifications}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.notificationItem}>
//             <Text style={styles.title}>To: {item.to}</Text>
//             <Text style={styles.title}>Title: {item.title}</Text>
//             <Text style={styles.body}>Body: {item.body}</Text>
//             <Text style={styles.date}>Date: {new Date(item.date).toLocaleString()}</Text>
//           </View>
//         )}
//       />
//     </View>
//     </View>
//     </ScrollView>
//   );
// }

 
// const styles = StyleSheet.create({
//    container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "flex-start",
//     paddingTop: 70,
//     gap:50,
//     paddingHorizontal: 20,
//   },
//   pickerContainer: {
//     width: '100%',
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   buttonContainer: {
//     marginTop: 'auto',
//     marginBottom: 40,
//     width: '80%',
//   },
//   iconCircle: {
//     margin: 10,
//     padding: 10,
//     backgroundColor: '#eee',
//     borderRadius: 50,
//     alignSelf: 'flex-start',
//   },
//   notificationItem: {
//     padding: 10,
//     marginVertical: 8,
//     backgroundColor: '#f1f1f1',
//     width: '100%',
//     borderRadius: 5,
//   },header: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   notificationItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   title: {
//     fontWeight: 'bold',
//   },
//   body: {
//     marginVertical: 4,
//   },
//   date: {
//     color: '#666',
//   },
// });
