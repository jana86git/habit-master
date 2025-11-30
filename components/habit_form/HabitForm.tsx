import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
// import { Picker } from "@react-native-picker/picker";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button3D from "../button_3d/Button3D";
import RadioButton from "../radio_button/RadioButton";
import TextInputComponent from "../text_input/TextInput";
import { useHabitForm } from "./HabitFormContext";
import { styles } from "./styles";


export default function HabitForm() {
  const { state, dispatch } = useHabitForm();
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showReminder, setShowReminder] = useState(false);


  const renderRadioGroup = (
    label: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.radioGroup}>
      <Text style={styles.subTitle}>{label}</Text>
      {options.map((option) => (
        <RadioButton
          key={option}
          label={option.replace(/_/g, " ")}
          selected={selectedValue === option}
          onPress={() => onSelect(option)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Habit</Text>

      {/* Habit Name */}
      <TextInputComponent
        label="Habit Name"
        value={state.habitName}
        onChangeText={(text) =>
          dispatch({ type: "SET_HABIT_NAME", payload: text })
        }
        placeholder="Enter habit name"
      />

      <View>
        <Text style={styles.subTitle}>Date Selections</Text>
      </View>
      <View style={styles.dateWrapper}>
        <View style={styles.date_cell}>
          {/* Start Date */}
          <Button3D onClick={() => setShowStartDate(true)}>
            <View style={{ width: "100%", alignItems: "center", paddingVertical: 8 }}>
              <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>Start Date</Text>
            </View>
          </Button3D>
          <Text style={styles.selectedDate}>
            {state.startDate.toLocaleDateString("en-GB")}
          </Text>
          {showStartDate && (
            <DateTimePicker
              value={state.startDate}
              mode="date"
              minimumDate={new Date()}
              onChange={(e, date) => {
                setShowStartDate(false);
                if (date) dispatch({ type: "SET_START_DATE", payload: date });
              }}
            />
          )}
        </View>
        <View style={styles.date_cell}>
          {/* End Date */}
          <Button3D onClick={() => setShowEndDate(true)}>
            <View style={{ width: "100%", alignItems: "center", paddingVertical: 8 }}>
              <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>End Date</Text>
            </View>
          </Button3D>
          <View style={styles.dateRow}>
            <Text style={styles.selectedDate}>
              {state.endDate
                ? state.endDate.toLocaleDateString("en-GB")
                : "Not selected"}
            </Text>
            {state.endDate && (
              <TouchableOpacity onPress={() => dispatch({ type: "SET_END_DATE", payload: null })}>
                <Ionicons name="close-circle" size={20} color={colors.danger || "red"} />
              </TouchableOpacity>
            )}
          </View>
          {showEndDate && (
            <DateTimePicker
              value={state.endDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(e, date) => {
                setShowEndDate(false);
                dispatch({ type: "SET_END_DATE", payload: date || null });
              }}
            />
          )}
        </View>
      </View>

      <View>
        <Text style={styles.subTitle}>Remind Me At:</Text>
        <Button3D onClick={() => setShowReminder(true)}>
          <View style={{ width: "100%", alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>Select Time</Text>
          </View>
        </Button3D>
        {state?.reminderTime && <Text style={styles.label}>
          {state.reminderTime.toLocaleTimeString("en-GB")}
        </Text>}
        {showReminder && (
          <DateTimePicker
            value={state.reminderTime || new Date()}
            mode="time"
            onChange={(e, date) => {
              setShowReminder(false);

              if (date) dispatch({ type: "SET_REMINDER_TIME", payload: date });
            }}
          />
        )}
      </View>
      {/* Frequency */}
      {renderRadioGroup(
        "Frequency",
        ["Daily", "Weekly", "Monthly", "Repeat_Every_N_Days"],
        state.frequency,
        (val) => dispatch({ type: "SET_FREQUENCY", payload: val as any })
      )}

      {/* Hourly Frequency Rate */}
      {state.frequency === "Hourly" && (
        <TextInputComponent
          label="Hourly Frequency Rate"
          placeholder="Enter hourly rate"
          value={state.hourlyFrequncyRate?.toString() || ""}
          onChangeText={(text) =>
            dispatch({
              type: "SET_HOURLY_FREQUENCY_RATE",
              payload: Number(text) || 0,
            })
          }
        />
      )}

      {/* N Days Frequency Rate */}
      {state.frequency === "Repeat_Every_N_Days" && (
        <TextInputComponent
          label="Repeat Every N Days"
          placeholder="Enter N days"
          value={state.nDaysFrequencyRate?.toString() || ""}
          onChangeText={(text) =>
            dispatch({
              type: "SET_NDAYS_FREQUENCY_RATE",
              payload: Number(text) || 0,
            })
          }
        />
      )}

      {/* Task Points */}
      <TextInputComponent
        label="Habit Points"
        placeholder="Enter task points"
        value={state.taskPoint.toString()}
        onChangeText={(text) =>
          dispatch({ type: "SET_TASK_POINT", payload: Number(text) || 0 })
        }
        keyboardType="numeric"
      />

      {/* Negative Task Points */}
      <TextInputComponent
        label="Negative Task Points"
        placeholder="Enter negative points"
        value={state.negativeTaskPoint.toString()}
        onChangeText={(text) =>
          dispatch({
            type: "SET_NEGATIVE_TASK_POINT",
            payload: Number(text) || 0,
          })
        }
        keyboardType="numeric"
      />

      {/* Evaluation Type */}
      {renderRadioGroup(
        "Evaluation Type",
        ["Yes_Or_No", "Numeric"],
        state.evaluationType,
        (val) =>
          dispatch({
            type: "SET_EVALUATION_TYPE",
            payload: val as any,
          })
      )}

      {state.evaluationType === "Numeric" && <View>
        {/* Target Condition */}
        {renderRadioGroup(
          "Target Condition",
          ["At_Least", "Less_Than", "Exact"],
          state.targetCondition,
          (val) =>
            dispatch({
              type: "SET_TARGET_CONDITION",
              payload: val as any,
            })
        )}

        {/* Target Value */}
        <TextInputComponent
          label="Target Value"
          placeholder="Enter target value"
          value={state.targetValue?.toString() || ""}
          onChangeText={(text) =>
            dispatch({
              type: "SET_TARGET_VALUE",
              payload: Number(text) || null,
            })
          }
          keyboardType="numeric"
        />

        {/* Target Unit */}
        <TextInputComponent
          label="Target Unit"
          placeholder="Enter target unit (e.g. hours, km)"
          value={state.targetUnit || ""}
          onChangeText={(text) =>
            dispatch({ type: "SET_TARGET_UNIT", payload: text })
          }

        />
      </View>}

    </View>
  );
}


