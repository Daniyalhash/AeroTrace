import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const CustomPicker = ({ selectedValue, onValueChange, items, style }) => {
  const handlePress = (value) => {
    onValueChange(value);
  };

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              { backgroundColor: item.backgroundColor } ]}

            
            onPress={() => handlePress(item.value)}
          >
            <Text style={[styles.itemText, { color: item.textColor }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  item: {
    padding: 20, // Increase padding for larger box
    marginVertical: 6, // More space between items
    borderRadius: 20, // Add border radius for rounded corners
    width: '100%', // Make it stretch to almost full width of the parent
    justifyContent: 'center', // Center the content vertically
    alignSelf: 'center', // Center the item horizontally
  },
  itemText: {
    fontSize: 16, // Increase font size for bigger text
    textAlign: 'center', // Center the text inside the box
  },
});

export default CustomPicker;
