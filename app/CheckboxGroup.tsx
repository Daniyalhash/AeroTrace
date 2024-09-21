import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';

const CheckboxGroup = ({ options, label, value, onValueChange }) => {
    // State to manage input for 'Other' option
    const [otherText, setOtherText] = useState('');

    // Find the selected option
    const selectedOption = options.find(option => option.value === value);

    return (
        <View style={styles.groupContainer}>
            <Text style={styles.label}>{label}</Text>
            {options.map((option, index) => (
                <View key={index} style={styles.checkboxContainer}>
                    <Checkbox
                        value={value === option.value}
                        onValueChange={() => onValueChange(option.value)}
                        tintColors={{ true: '#96ACC0', false: '#96ACC0' }}

                    />
                    <Text style={styles.checkboxLabel}>{option.label}</Text>
                </View>
            ))}
            {/* Show TextInput only for the selected option with hasInput */}
            {selectedOption && selectedOption.hasInput && (
                <TextInput
                    style={styles.input}
                    placeholder="Enter other option"
                    placeholderTextColor="#96ACC0"
                    value={otherText}
                    onChangeText={setOtherText} // Updates the state with the user's input
                />
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    groupContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#00031E', // Light grey color for labels
        marginBottom: 10,
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#00031E',
    },
    input: {
        borderWidth: 1,
        borderColor: '#00031E',
        borderRadius: 4,
        padding: 10,
        marginBottom: 12,
        fontSize: 14,
        color: '#212121',
        backgroundColor: '#E2E2E2',
    },
});

export default CheckboxGroup;
