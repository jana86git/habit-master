import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Button3D from "../button_3d/Button3D";
export default function DateRangePicker() {

  const [showPicker, setShowPicker] = useState(false);
  const { state, dispatch } = useHome();
  const { selectedDate } = state;

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {

      dispatch({ type: "SET_SELECTED_DATE", payload: selectedDate })
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <Button3D onClick={() => setShowPicker(true)}>
        <View style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={20} color={colors.textOnPrimary} />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>
      </Button3D>


      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textOnPrimary,
    fontFamily: fonts.bold
  },
});
