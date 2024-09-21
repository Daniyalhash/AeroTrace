// ReportGenerator.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { faArrowRight , faDownload, faHome, faShare } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuid } from 'uuid'; 
import { database } from './firebaseConfig'; 
import { ref, get } from 'firebase/database';
import * as SplashScreen from 'expo-splash-screen';
import Checkbox from 'expo-checkbox';
import { router, useRouter } from 'expo-router';

const TraceabilityReport = () => {
  const [loading, setLoading] = useState(true);  
  const [reportData, setReportData] = useState(null);
  const { reportId } = useLocalSearchParams(); // This will receive the reportId from Block A
  const router = useRouter(); // Use the Expo Router hook // This will receive the reportId from Block A
  const [fontsLoaded, setFontsLoaded] = useState(false);

    // Effect to load fonts
    useEffect(() => {
      const loadFonts = async () => {
        await Font.loadAsync({
          'Chillax-bold': require('../assets/fonts/Chillax-Bold.ttf'), // Ensure the path is correct
        });
        setFontsLoaded(true);
      };
  
      loadFonts();
    }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const newReportRef = ref(database, `/traceabilityprocess/${reportId}`);
        const snapshot = await get(newReportRef);
  
        if (snapshot.exists()) {
          setReportData(snapshot.val());
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching data
      }
    };
  
    fetchData();
  }, [reportId]);

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

  Description: ${reportData?.description || 'N/A'}
  - Reference: ${reportData?.refno || 'N/A'}
  - Part Number: ${reportData?.pNumber || 'N/A'}
  - Remove From: ${reportData?.removeFrom || 'N/A'}
  - AE (Production): ${reportData?.submitAny1 || 'N/A'}
  - DCE (Production): ${reportData?.submitAny2 || 'N/A'}

  COMPONENT QUARANTINE AND REVIEW (ACTION BY P&PC) 
  - Serial Number: ${reportData?.serialNo || 'N/A'}
  - Submit Any 3: ${reportData?.submitAny3 || 'N/A'}
  SERIAL NUMBER CONFIRMATION FROM AWM / TSE 
  - Reference 2: ${reportData?.ref2 || 'N/A'}
  - Submit Any 4: ${reportData?.submitAny4 || 'N/A'}
  ASSIGNMENT OF LOCAL SERIAL NUMBER (ACTION BY P&PC)
  - PIA String: ${reportData?.piaStr || 'N/A'}
  - Submit Any 5: ${reportData?.submitAny5 || 'N/A'}
  APPROVAL & CLOSURE 
  - Submit Any 6: ${reportData?.submitAny6 || 'N/A'}
  `;
  return (
    <View style={styles.reportContainer}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />

      <Text style={styles.reportTitle}>Traceability Report</Text>
      <Text style={styles.organization}>Organization: PIA</Text>
      <Text style={styles.date}>Date: {new Date().toLocaleDateString()}</Text>

      {/* Print fields data to verify */}
      <Text style={styles.text}>Description: {reportData?.description || 'N/A'}</Text>
      <Text style={styles.text}>Reference:  {reportData?.refno || 'N/A'}</Text>
      <Text style={styles.text}>Part Number: {reportData?.pNumber || 'N/A'}</Text>
      <Text style={styles.text}>Remove From:  {reportData?.removeFrom || 'N/A'}</Text>
      <Text style={styles.text}>AE (Production): {reportData?.submitAny1 || 'N/A'}</Text>
      <Text style={styles.text}>DCE (Production):  {reportData?.submitAny2 || 'N/A'}</Text>

      <Text style={styles.title}>COMPONENT QUARANTINE AND REVIEW (ACTION BY P&PC) </Text>
      <Text style={styles.text}>Serial Number:  {reportData?.serialNo || 'N/A'}</Text>
      <Text style={styles.text}>Submit Any 3:  {reportData?.submitAny3 || 'N/A'}</Text>

      <Text style={styles.title}>SERIAL NUMBER CONFIRMATION FROM AWM / TSE  </Text>
      <Text style={styles.text}>Reference 2:  {reportData?.ref2 || 'N/A'}</Text>

      <Text style={styles.text}>Submit Any 4:  {reportData?.submitAny4 || 'N/A'}</Text>


      <Text style={styles.title}>ASSIGNMENT OF LOCAL SERIAL NUMBER (ACTION BY P&PC)</Text>
      <Text style={styles.text}>PIA String:  {reportData?.piaStr || 'N/A'}</Text>

      <Text style={styles.text}>Submit Any 5:  {reportData?.submitAny5 || 'N/A'}</Text>


      <Text style={styles.title}>APPROVAL & CLOSURE  </Text>
      <Text style={styles.text}>Submit Any 6:  {reportData?.submitAny6 || 'N/A'}</Text>


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
    fontFamily: 'Chillax-bold',
  },
  organization: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
    fontFamily: 'Chillax-bold',
  },
  text: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Chillax-bold',
  },
  date: {
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
    fontFamily: 'Chillax-bold',
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
    fontFamily: 'Chillax-bold',
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
    fontFamily: 'Chillax-bold',
  }
});
export default TraceabilityReport;
