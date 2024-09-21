import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowRight , faDownload, faHome, faShare } from '@fortawesome/free-solid-svg-icons';
import { database } from './firebaseConfig'; 
import { ref, get } from 'firebase/database';
import * as SplashScreen from 'expo-splash-screen';
import Checkbox from 'expo-checkbox';
import { router, useRouter } from 'expo-router';
import * as Font from 'expo-font';
const ReportGenerator = () => {
  const [loading, setLoading] = useState(true);  
  const [reportData, setReportData] = useState(null);
  const { reportId } = useLocalSearchParams(); // This will receive the reportId from Block A
  const router = useRouter(); // Use the Expo Router hook
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Fetch data from Firebase Realtime Database
    const fetchData = async () => {
      try {
        const newReportRef = ref(database, `/cannibalizationReports/${reportId}`);
        const snapshot = await get(newReportRef);

        if (snapshot.exists()) {
          setReportData(snapshot.val());
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    const reportContent = generateReportContent();
    const filePath = `${FileSystem.documentDirectory}CannibalizationReport.pdf`;

    try {
      await FileSystem.writeAsStringAsync(filePath, reportContent, { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert('Success', 'Report downloaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while downloading the report.');
      console.log(error);
    }
  };

  const handleShare = async () => {
    const reportContent = generateReportContent();
    const filePath = `${FileSystem.documentDirectory}CannibalizationReport.pdf`;

    try {
      await FileSystem.writeAsStringAsync(filePath, reportContent, { encoding: FileSystem.EncodingType.UTF8 });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on your platform');
        return;
      }

      await Sharing.shareAsync(filePath);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while sharing the report.');
      console.log(error);
    }
  };

  const generateReportContent = () => `
  Organization: PIA
  Date: ${new Date().toLocaleDateString()}

  BLOCK A: CANNIBALIZATION REQUEST
  - Nomenclature: ${reportData?.blockA?.nomenclature || 'N/A'}
  - Part Number: ${reportData?.blockA?.partNo || 'N/A'}
  - Certifying Staff: ${reportData?.blockA?.signature || 'N/A'}

  BLOCK B: CANNIBALIZATION PERMISSION
  - Donor Aircraft Registration: ${reportData?.blockB?.donorAircraftRegistration || 'N/A'}
  - Approved By: ${reportData?.blockB?.approvedBy || 'N/A'}

  BLOCK C: POST-PERMISSION ACTION
  - Donor Section Action: ${reportData?.blockC?.donorSectionAction || 'N/A'}
  - Recipient Section Action: ${reportData?.blockC?.recipientSectionAction || 'N/A'}
  - DCE: ${reportData?.blockC?.dce || 'N/A'}
`;

return (
  <View style={styles.reportContainer}>
    <Image source={require('../assets/images/logo.png')} style={styles.logo} />

    <Text style={styles.reportTitle}>Cannibalization Report</Text>
    <Text style={styles.organization}>Organization: PIA</Text>
    <Text style={styles.date}>Date: {new Date().toLocaleDateString()}</Text>

    <View style={styles.section}>
      <Text style={styles.sectionHeader}>BLOCK A: CANNIBALIZATION REQUEST</Text>
      <Text style={styles.text}>- Nomenclature: {reportData?.blockA?.nomenclature || 'N/A'}</Text>
      <Text style={styles.text}>- Part Number: {reportData?.blockA?.partNo || 'N/A'}</Text>
      <Text style={styles.text}>- Certifying Staff: {reportData?.blockA?.signature || 'N/A'}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionHeader}>BLOCK B: CANNIBALIZATION PERMISSION</Text>
      <Text style={styles.text}>- Donor Aircraft Registration: {reportData?.blockB?.donorAircraftRegistration || 'N/A'}</Text>
      <Text style={styles.text}>- Approved By: {reportData?.blockB?.approved || 'N/A'}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionHeader}>BLOCK C: POST-PERMISSION ACTION</Text>
      <Text style={styles.text}>- DCE: {reportData?.blockC?.B?.DCEsignature || 'N/A'}</Text>
    </View>

    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleDownload}>
      <FontAwesomeIcon icon={faDownload} size={25} color="#00031E" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleShare}>
      <FontAwesomeIcon icon={faShare} size={25} color="#00031E" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.navigate('./Home', { successMessage: 'Cannibalization process completed successfully!' })}>
      <FontAwesomeIcon icon={faHome} size={25} color="#00031E" />
      </TouchableOpacity>
    </View>
  </View>
);
};
// Styles (same as before)
// Styles for the report
const styles = StyleSheet.create({
    reportContainer: {
      padding: 20,
      backgroundColor: '#E2E2E2',
      borderRadius: 10,
      shadowColor: '#F1F1F1',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5,
      margin: 20,
    },
    logo: {
      width: 100,
      height: 100,
      alignSelf: 'center',
      marginBottom: 20,
    },
    reportTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: '#000',
      textTransform: 'capitalize',
    },
    organization: {
      fontSize: 16,
      marginBottom: 10,
      color: '#000',
    },
    text: {
      fontSize: 16,
      color: '#000',
    },
    date: {
      fontSize: 16,
      marginBottom: 20,
      color: '#000',
    },
    section: {
      marginBottom: 20,
    },
    sectionHeader: {
      textTransform: 'capitalize',
      textDecorationLine: 'underline',
      fontSize: 18,
      color: '#000',
      marginBottom: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    }, 
    button: {
      backgroundColor: '#007BFF',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      flex: 1,
      margin: 5,
    },
    text2:{
      fontSize: 16,
      color: '#E2E2E2',
    }
  });
  
export default ReportGenerator;
