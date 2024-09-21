import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Mybutton from '@/components/Mybutton';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router

const Sidebar = ({ visible, onClose, userName, onSignOut }) => {
  const router = useRouter(); // Use the router hook from expo-router

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.sidebarContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerContainerMini}>
            <View style={styles.iconCircle}>
              <Image source={require('../assets/images/user.png')} style={styles.iconImage2} />
            </View>
            <Text style={styles.sidebarText}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.sidebarCloseButton} onPress={onClose}>
            <FontAwesomeIcon icon={faTimes} size={25} color="#00031E" />
          </TouchableOpacity>
        </View>
        <View style={styles.sidebarContent}>
          {/* <View style={styles.sidebarAuthor}>
            <Image source={require('../assets/images/logo.png')} style={styles.iconImage} />
          </View> */}
          {/* Use the router.push method to navigate to the Notification screen */}
          <Mybutton title="Notifications" onPress={() => router.push('/Notification')} />
          <Mybutton title="Log Out" onPress={onSignOut} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#F1F1F1',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContainerMini:{
flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarContent: {
    backgroundColor: '#F1F1F1',
    padding: 20,
    paddingTop: 0,
    height: '50%',
  },
  sidebarText: {
    fontSize: 30,
    color: "#00031E",
    fontFamily: 'Chillax',
    fontWeight: 'bold',
    marginLeft: 10, // Adjust this value to increase or decrease the gap
    textTransform: 'capitalize', // Capitalizes the text

  },
  sidebarCloseButton: {
    padding: 10,
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarAuthor: {
    alignItems: 'center',
    padding: 10,
  },
  iconImage: {
    width: 280,
    height: 280,
    borderRadius: 20,
  },
  button: {
    marginTop: 15,
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
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
    fontFamily: 'Chillax',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconImage2: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontWeight: '100',
  },
});

export default Sidebar;
