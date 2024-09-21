// import { firebase } from '@react-native-firebase/messaging';
import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useRouter } from 'expo-router';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import AppLoading from 'expo-app-loading';
import { v4 as uuid } from 'uuid'; // Use the UUID package
import { database } from './firebaseConfig'; // Import Firebase Realtime Database
import { ref, set } from 'firebase/database';
import * as Font from 'expo-font'; // Note: This is deprecated in newer Expo SDKs
import * as SplashScreen from 'expo-splash-screen';
import { useLocalSearchParams } from 'expo-router';
import Checkbox from 'expo-checkbox';

import CheckboxGroup from './CheckboxGroup';

export default function Traceability() {
  // State for all the form inputs
  const [description, setDescription] = useState('');
  const [refno, setRef] = useState('');
  const [pNumber, setPNumber] = useState('');
  const [removeFrom, setRemoveFrom] = useState('');
  const [addRemarks1, setAddRemarks1] = useState('');
  const [submitAny1, setSubmitAny1] = useState('');
  const [submitAny2, setSubmitAny2] = useState('');
  const [isCoAValid1, setIsCoAValid1] = useState(null);
  const [addRemarks2, setAddRemarks2] = useState('');
  const [isCoAValid2, setIsCoAValid2] = useState(null);
  const [serialNo, setSerialNo] = useState('');
  const [submitAny3, setSubmitAny3] = useState('');

  const [ref2, setRef2] = useState('');
  const [serialNo2, setSerialNo2] = useState('');
  const [addRemarks3, setAddRemarks3] = useState('');
  const [submitAny4, setSubmitAny4] = useState('');
  const [piaStr, setpiaStr] = useState('');
  const [submitAny5, setSubmitAny5] = useState('');
  const [addRemarks4, setAddRemarks4] = useState('');
  const [submitAny6, setSubmitAny6] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOption2, setSelectedOption2] = useState(null);
  const router = useRouter(); // Use the Expo Router hook
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const options = [
    { label: 'AIR', value: 'AIR' },
    { label: 'ARL', value: 'ARL' },
    { label: 'COMPONENT HISTORY', value: 'COMPONENT_HISTORY' },
    { label: 'Other', value: 'OTHER', hasInput: true },
  ];
  const options2 = [
    { label: 'Local Serial Number Assigned ', value: 'Local Serial Number Assigned ' },
    { label: 'LRU Control Number has been issued ', value: 'LRU Control Number has been issued ' },
    { label: 'Local Serial Number has been entered in PAMMIS / WINGS.', value: 'Local Serial Number has been entered in PAMMIS / WINGS.' },
  ];

  const clearFields = () => {
    setDescription('');
    setRef('');
    setPNumber('');
    setRemoveFrom('');
    setAddRemarks1('');
    setSubmitAny1('');
    setSubmitAny2('');
    setIsCoAValid1(null);
    setAddRemarks2('');
    setIsCoAValid2(null);
    setSerialNo('');
    setSubmitAny3('');

    setRef2('');
    setSerialNo2('');
    setAddRemarks3('');
    setSubmitAny4('');
    setSubmitAny5("");
    setAddRemarks4('');
    setSubmitAny6('');
    setSelectedOption('');
    setSelectedOption2('');
  };

  const validateForm = () => {
    const fields = [
      description, refno, pNumber, removeFrom,
      addRemarks1, addRemarks2, addRemarks3, addRemarks4,
      serialNo, ref2, serialNo2, piaStr,
      submitAny1, submitAny2, submitAny3, submitAny4, submitAny5, submitAny6,

    ];

    for (let field of fields) {
      if (!field.trim()) {
        return false;
      }
    }

    if (
      isCoAValid1 === null ||
      isCoAValid2 === null ||
      selectedOption === null ||
      selectedOption2 === null

    ) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const reportId = uuid(); // Generate a new UUID

    const fields = [
      description, refno, pNumber, removeFrom,
      addRemarks1, addRemarks2, addRemarks3, addRemarks4,
      serialNo, ref2, serialNo2, piaStr,
      submitAny1, submitAny2, submitAny3, submitAny4, submitAny5, submitAny6,
      isCoAValid1, isCoAValid2, selectedOption, selectedOption2,
    ];
    if (!validateForm()) {
      setError('All fields are required.');

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);

      return; // Prevent further execution if there's an error
    }
    if (piaStr.length !== 4) {
      setError("PIA Str should be exactly 4 letters");
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);

      return; // Stop execution if PIA Str validation fails

    }

    try {
      const newReportRef = ref(database, `/traceabilityprocess/${reportId}`);
      await set(newReportRef, {

        description, refno, pNumber, removeFrom,
        addRemarks1, addRemarks2, addRemarks3, addRemarks4,
        serialNo, ref2, serialNo2, piaStr,
        submitAny1, submitAny2, submitAny3, submitAny4, submitAny5, submitAny6,
        isCoAValid1, isCoAValid2, selectedOption, selectedOption2,
        timestamp: new Date(),
      });

      clearFields();
      // { successMessage: 'Traceability process completed successfully!' }
      router.push({ pathname: './TraceabilityReport', params: { reportId } }); // Navigate to BlockB
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'There was an error submitting the form. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.heading3}>SERIAL NUMBER TRACEABILITY REQUEST</Text>
      </View>



      <View style={styles.formContainer}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={(text) => setDescription(text)}
          placeholder="Enter Description."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.label}>Ref. No*:</Text>
        <TextInput
          style={styles.input}
          value={refno}
          onChangeText={(text) => setRef(text)}
          placeholder="Enter Ref. No*."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.label}>Part Number:</Text>
        <TextInput
          style={styles.input}
          value={pNumber}
          onChangeText={(text) => setPNumber(text)}
          placeholder="Enter Part Number."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.label}>Removed from:</Text>
        <TextInput
          style={styles.input}
          value={removeFrom}
          onChangeText={(text) => setRemoveFrom(text)}
          placeholder="Enter Removed from."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.label}>Additional Information/ Remarks (if any):</Text>
        <TextInput
          style={styles.input}
          value={addRemarks1}
          onChangeText={(text) => setAddRemarks1(text)}
          placeholder="Enter Additional Information/ Remarks (if any) or Type None."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.label}>Submitted By:</Text>
        <Text style={styles.label}>AE (Production) (Name/Sign/Stamp/Date)</Text>

        <TextInput
          style={styles.input}
          value={submitAny1}
          onChangeText={(text) => setSubmitAny1(text)}
          placeholder="Enter Name or Signature."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.label}>DCE (Production) :</Text>
        <Text style={styles.label}>(Name/Sign/Stamp/Date)</Text>

        <TextInput
          style={styles.input}
          value={submitAny2}
          onChangeText={(text) => setSubmitAny2(text)}
          placeholder="Enter Name or Signature."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.title}>COMPONENT QUARANTINE AND REVIEW (ACTION BY P&PC)</Text>
        <Text style={styles.label}>Component has been Quarantined :</Text>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isCoAValid1 === true}
            onValueChange={() => setIsCoAValid1(true)}
            color={isCoAValid1 === true ? '#96ACC0' : '#96ACC0'} // Customize colors

          />
          <Text style={styles.checkboxLabel}>Yes</Text>
          <Checkbox
            style={styles.checkboxBox}

            value={isCoAValid1 === false}
            onValueChange={() => setIsCoAValid1(false)}
            color={isCoAValid1 === false ? '#96ACC0' : '#96ACC0'} // Customize colors

          />
          <Text style={styles.checkboxLabel}>No</Text>
        </View>
        <Text style={styles.label}>Remarks (if any):</Text>
        <TextInput
          style={styles.input}
          value={addRemarks2}
          onChangeText={(text) => setAddRemarks2(text)}
          placeholder="Enter ARemarks (if any) or Type None."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.label}>Serial Number has been traced through
          Inventory Status / PAMMIS / WINGS :</Text>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isCoAValid2 === true}
            onValueChange={() => setIsCoAValid2(true)}
            color={isCoAValid2 === true ? '#96ACC0' : '#96ACC0'} // Customize colors

          />
          <Text style={styles.checkboxLabel}>Yes</Text>
          <Checkbox
            style={styles.checkboxBox}

            value={isCoAValid2 === false}
            onValueChange={() => setIsCoAValid2(false)}
            color={isCoAValid2 === false ? '#96ACC0' : '#96ACC0'} // Customize colors

          />
          <Text style={styles.checkboxLabel}>No</Text>
        </View>
        <Text style={styles.label}>Serial Number:</Text>
        <TextInput
          style={styles.input}
          value={serialNo}
          onChangeText={(text) => setSerialNo(text)}
          placeholder="Enter the Serial Number)"
          placeholderTextColor="#96ACC0"

        />
        <Text style={styles.label}>Received By:</Text>
        <Text style={styles.label}>(Name/Sign/Date)</Text>

        <TextInput
          style={styles.input}
          value={submitAny3}
          onChangeText={(text) => setSubmitAny3(text)}
          placeholder="Enter Name or Signature."
          placeholderTextColor="#96ACC0"


        />
        <Text style={styles.title}>SERIAL NUMBER CONFIRMATION FROM AWM / TSE </Text>
        <CheckboxGroup
          options={options}
          label="Serial Number has been traced, through:"
          value={selectedOption}
          onValueChange={setSelectedOption}
        />

        <Text style={styles.label}>Ref No:</Text>
        <TextInput
          style={styles.input}
          value={ref2}
          onChangeText={(text) => setRef2(text)}
          placeholder="Enter Ref No."
          placeholderTextColor="#96ACC0"

        />
        <Text style={styles.label}>Serial Number:</Text>
        <TextInput
          style={styles.input}
          value={serialNo2}
          onChangeText={(text) => setSerialNo2(text)}
          placeholder="Enter Serial Number."
          placeholderTextColor="#96ACC0"

        />
        <View style={styles.checkboxContainer}>
          <Checkbox

            value={selectedOption === 'NOT_TRACED'}
            onValueChange={() => setSelectedOption('NOT_TRACED')}
            color={selectedOption === false ? '#96ACC0' : '#96ACC0'} // Customize colors
          />
          <Text style={styles.label}>Serial Number could not be traced:</Text>
        </View>

        <Text style={styles.label}>Remarks:</Text>
        <TextInput
          style={styles.input}
          value={addRemarks3}
          onChangeText={setAddRemarks3}
          placeholder="Enter Remarks or Type None"
          placeholderTextColor="#96ACC0"
        />

        <Text style={styles.label}>Confirmed By : (Name/Signature/Date/Section)</Text>
        <TextInput
          style={styles.input}
          value={submitAny4}
          onChangeText={(text) => setSubmitAny4(text)}
          placeholder="Enter (Name/Signature/Date/Section) "
          placeholderTextColor="#96ACC0"

        />
        <Text style={styles.title}>ASSIGNMENT OF LOCAL SERIAL NUMBER (ACTION BY P&PC):</Text>
        <CheckboxGroup
          options={options2}
          label="LOCAL SERIAL NUMBER:"
          value={selectedOption2}
          onValueChange={setSelectedOption2}
        />

        <Text style={styles.label}>PIA-STR-(4 Digit):</Text>

        <TextInput
          style={styles.input}
          value={piaStr}
          onChangeText={(text) => setpiaStr(text)}
          placeholder="Enter PIA-STR-(4 Digit)"
          placeholderTextColor="#96ACC0"

        />
        <Text style={styles.label}>Assigned By: (Name/Signature/Date)</Text>
        <TextInput
          style={styles.input}
          value={submitAny5}
          onChangeText={(text) => setSubmitAny5(text)}
          placeholder="Enter (Name/Signature/Date) "
          placeholderTextColor="#96ACC0"

        />
        <Text style={styles.title}>
          APPROVAL & CLOSURE
        </Text>
        <Text style={styles.label}>Remarks (if any) :</Text>

        <TextInput
          style={styles.input}
          value={addRemarks4}
          onChangeText={(text) => setAddRemarks4(text)}
          placeholder="Enter Remarks or Type None"
          placeholderTextColor="#96ACC0"

        />
        <Text style={styles.label}>DCE (Production) :</Text>
        <Text style={styles.label}>(Name/Sign/Stamp/Date)</Text>

        <TextInput
          style={styles.input}
          value={submitAny6}
          onChangeText={(text) => setSubmitAny6(text)}
          placeholder="Enter Name or Signature."
          placeholderTextColor="#96ACC0"


        />
      </View>

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
  // row: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   height: "10%",
  //   width: '100%',

  // },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20, // Adjusted marginTop for the row
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
  },
  title:{
    color: '#007BFF',
    fontSize: 15,
    fontWeight: 'light',
    marginBottom:30,
    textAlign: 'center',
  }
  , button: {
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
    fontWeight: 'bold',
    textAlign: 'center',
  }, row2: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
   heading3: {
    color: '#007BFF',
    fontSize: 20,
    fontWeight: 'light',
    textAlign: 'center',
  },
});
//# for grey
//#E2E2E2 for dark grey
//#96ACC0 for blueF1F1F1