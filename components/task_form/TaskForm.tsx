import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import TextInputComponent from "../text_input/TextInput";
import { useTaskForm } from "./TaskFormContext";
import { styles } from "./styles";
import { Subtask } from "./types";

export default function TaskForm() {
  const { state, dispatch } = useTaskForm();
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const [subtaskName, setSubtaskName] = useState("");
  const [subtaskPoint, setSubtaskPoint] = useState("");

  const addSubtask = () => {
    if (!subtaskName) return;
    dispatch({
      type: "ADD_SUBTASK",
      payload: { name: subtaskName, point: Number(subtaskPoint) || 0 } as Subtask,
    });
    setSubtaskName("");
    setSubtaskPoint("");
  };

  const removeSubtask = (index: number) => {
    dispatch({ type: "REMOVE_SUBTASK", payload: index });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Task</Text>

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
          <Button title="Select Start Date" onPress={() => setShowStartDate(true)} />
          <Text style={styles.label}>
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
          <Button title="Select End Date" onPress={() => setShowEndDate(true)} />
          <Text style={styles.label}>
            {state.endDate ? state.endDate.toLocaleDateString("en-GB") : "No end date selected"}
          </Text>
          <TouchableOpacity onPress={() => dispatch({ type: "SET_END_DATE", payload: null })}>
            <Text style={styles.label}>Clear End Date</Text>
          </TouchableOpacity>
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
        <Button title="Select Time" onPress={() => setShowReminder(true)} />
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
      {/* Subtasks Section */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.subTitle}>Subtasks</Text>

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
        <Button title="Add Subtask" onPress={addSubtask} />

        {state.subtasks.map((item, index) => (
          <View key={index} style={styles?.subtask_card} >
            <Text style={styles?.subtask_name}>
              {item.name} - {item.point} pts
            </Text>
            <TouchableOpacity onPress={() => removeSubtask(index)}>
              <Text style={{ color: "red" }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Save Task" onPress={() => console.log(state)} />
      </View>
    </View>
  );
}
