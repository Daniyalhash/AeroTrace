import { useState, useEffect } from 'react';
import { database, ref, onValue } from '../app/firebaseConfig'; // Adjust the import path

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const usersRef = ref(database, '/users'); // Path to your users in Firebase

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}; // Default to empty object if data is null
      const usersList = [];
      let count = 0;

      for (let id in data) {
        const user = data[id];
        const isOnline = user.status === 'online';
        if (isOnline) {
          count++;
        }
        usersList.push({
          id,
          name: user.name || "Unknown",
          email: user.email || "No Email",
          deviceToken: user.deviceToken || null,
          status: user.status || false,
          ...user
        });
      }
      
      setUsers(usersList);
      setActiveCount(count);
      console.log(`Active users count: ${count}`);
    });

    return () => unsubscribe();
  }, []);
  
  return { users, activeCount };
};

export default useUsers;
