import React from 'react';
import { useRouter } from 'expo-router';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Text, View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import useUsers from '@/components/useUser'; // Ensure this path is correct

function Users() {
  const { users, activeCount } = useUsers(); // Destructure users and activeCount
  const router = useRouter();

  if (!Array.isArray(users)) {
    console.error('Users is not an array:', users);
    return null; // or a fallback UI
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.heading}>
          Aero<Text style={styles.highlight}>Trace</Text>
        </Text>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.navigate('./Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="#00031E" />
        </TouchableOpacity>
      </View>
      <View style={styles.row2}>
        <Text style={styles.heading3}>Officers & Crew</Text>
        <Text style={styles.activeCount}>Active Users: {activeCount}</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.userItem, item.status === 'online' ? styles.online : styles.offline]}>
            <Text style={[styles.userName, item.status === 'online' ? styles.onlineText : styles.offlineText]}>
              {item.name}
            </Text>
            <Text style={[styles.userEmail, item.status === 'online' ? styles.onlineText : styles.offlineText]}>
              {item.email}
            </Text>
          </View>
        )}
      />
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
    letterSpacing: -6,
    textAlign: 'center',
  },
  highlight: {
    color: '#00031E',
  },
  row2: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading3: {
    color: '#007BFF',
    fontSize: 20,
    textAlign: 'center',

  },
  activeCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#007BFF',
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#555',
  },
  online: {
    backgroundColor: '#D4EDDA',
  },
  offline: {
    backgroundColor: '#F8D7DA',
  },
  onlineText: {
    color: '#155724',
  },
  offlineText: {
    color: '#721C24',
  },
});

export default Users;
