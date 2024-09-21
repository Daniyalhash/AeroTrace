import React from 'react'
import { View, TextInput, Button, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';

function Mybutton({title , onPress}) {
  
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
  )
}

export default Mybutton
const styles = StyleSheet.create({
 
    button: {
      marginTop: 15,
      backgroundColor: 'black',
      paddingVertical: 10,
      paddingHorizontal: 10,
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
      fontSize: 16,
      fontFamily: 'Chillax',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  
  
  });