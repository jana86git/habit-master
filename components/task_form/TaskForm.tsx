import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Button3D from "../button_3d/Button3D";
import TextInputComponent from "../text_input/TextInput";
import WindowModal from "../window_modal/WindowModal";
import { useTaskForm } from "./TaskFormContext";
import { styles } from "./styles";
import { Subtask } from "./types";

interface TaskFormProps {
  scrollViewRef?: KeyboardAwareScrollView | null;
}

export default function TaskForm({ scrollViewRef }: TaskFormProps) {
  const { state, dispatch } = useTaskForm();
  const { isEditMode } = state;
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const [subtaskName, setSubtaskName] = useState("");
  const [subtaskPoint, setSubtaskPoint] = useState("");
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  const addSubtask = () => {
    if (!subtaskName) return;
    dispatch({
      type: "ADD_SUBTASK",
      payload: { name: subtaskName, point: Number(subtaskPoint) || 0 } as Subtask,
    });
    setSubtaskName("");
    setSubtaskPoint("");
    setShowSubtaskModal(false);

    // Scroll to bottom after subtask is added
    setTimeout(() => {
      scrollViewRef?.scrollToEnd(true);
    }, 100);
  };

  const removeSubtask = (index: number) => {
    dispatch({ type: "REMOVE_SUBTASK", payload: index });
  };

  return (
    <View style={styles.container}>


      {/* Task Name */}
      <TextInputComponent
        label="Task Name"
        value={state.taskName}
        onChangeText={(text) =>
          dispatch({ type: "SET_TASK_NAME", payload: text })
        }
        placeholder="Enter task name"
      />

      {/* Date, Reminder, Points, Category (same as before) */}
      {/* ... keep previous fields ... */}
      {/* Date Selections */}
      <View>
        <Text style={styles.subTitle}>Date Selections</Text>
      </View>
      <View style={styles.dateWrapper}>
        <View style={styles.date_cell}>
          {/* Start Date */}
          <Button3D onClick={() => !isEditMode && setShowStartDate(true)} disabled={isEditMode}>
            <View style={{ width: "100%", alignItems: "center", paddingVertical: 8 }}>
              <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>Start Date</Text>
            </View>
          </Button3D>
          <Text style={styles.selectedDate}>
            {state.startDate.toLocaleDateString("en-GB")}
          </Text>
          {!isEditMode && showStartDate && (
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
          <Text style={styles.selectedDate}>
            {state.endDate?.toLocaleDateString("en-GB")}
          </Text>
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

      {/* Reminder Time */}
      <View>
        <Text style={styles.subTitle}>Remind Me At:</Text>
        <Button3D onClick={() => setShowReminder(true)}>
          <View style={{ width: "100%", alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>Select Time</Text>
          </View>
        </Button3D>
        {state.reminderTime && (
          <Text style={styles.label}>{state.reminderTime.toLocaleTimeString("en-GB")}</Text>
        )}
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

      {/* Task Points */}
      <TextInputComponent
        label="Task Points"
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
          dispatch({ type: "SET_NEGATIVE_TASK_POINT", payload: Number(text) || 0 })
        }
        keyboardType="numeric"
      />

      {/* Category */}
      <TextInputComponent
        label="Category"
        placeholder="Enter category"
        value={state.category || ""}
        onChangeText={(text) => dispatch({ type: "SET_CATEGORY", payload: text })}
      />
      {/* Subtasks Section */}
      <View style={{ marginTop: 20 }}>
        {/* Subtasks Header with + Button */}
        <View style={styles.subtasksHeader}>
          <Text style={styles.subTitle}>Subtasks</Text>
          <Button3D
            onClick={() => setShowSubtaskModal(true)}
          >
            <Ionicons name="add" size={28} color={colors.textOnPrimary} />
          </Button3D>
        </View>

        {/* Added Subtasks List */}
        {state.subtasks.map((item, index) => (
          <View key={index} style={styles.subtask_card}>
            <Text style={styles.subtask_name}>
              {item.name} - {item.point} pts
            </Text>
            <TouchableOpacity onPress={() => removeSubtask(index)}>
              <Text style={{ color: colors.danger }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Subtask Modal */}
        <WindowModal
          visible={showSubtaskModal}
          onClose={() => setShowSubtaskModal(false)}
          label="Add Subtask"
        >
          <View style={{ padding: 8 }}>
            <TextInputComponent
              placeholder="Subtask Name"
              label="Subtask Name"
              value={subtaskName}
              onChangeText={setSubtaskName}
            />
            <TextInputComponent
              placeholder="Points"
              label="Subtask Points"
              value={subtaskPoint}
              onChangeText={setSubtaskPoint}
              keyboardType="numeric"
            />
            <Button3D onClick={addSubtask}>
              <View style={{ width: "100%", alignItems: "center", paddingVertical: 8 }}>
                <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>Add Subtask</Text>
              </View>
            </Button3D>
          </View>
        </WindowModal>
      </View>


    </View>
  );
}
