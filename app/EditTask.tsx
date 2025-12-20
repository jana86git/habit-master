import Button3D from "@/components/button_3d/Button3D";
import TaskForm from "@/components/task_form/TaskForm";
import TaskFormProvider, { useTaskForm } from "@/components/task_form/TaskFormContext";
import { InitialState, Subtask, TaskResponse } from "@/components/task_form/types";
import { colors } from "@/constants/colors";
import { emitError } from "@/constants/emitError";
import { emitTasksRefetch } from "@/constants/emitRefetch";
import { emitSuccess } from "@/constants/emitSuccess";
import { fonts } from "@/constants/fonts";
import { createOneTimeReminder, deleteReminder } from "@/constants/notificationAndroid";
import { db } from "@/db/db";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import uuid from "react-native-uuid";

export default function EditTask() {
  const [scrollViewRef, setScrollViewRef] = useState<KeyboardAwareScrollView | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TaskFormProvider>
        <KeyboardAwareScrollView
          innerRef={(ref: any) => setScrollViewRef(ref)}
          extraScrollHeight={20}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          <TaskForm scrollViewRef={scrollViewRef} />
          <InitiateEditData />
        </KeyboardAwareScrollView>
        <SubmitButton />
      </TaskFormProvider>
    </View>
  );
}

/**
 * ✅ Fetches task + subtasks from DB and initializes form
 */
function InitiateEditData() {
  const { id } = useLocalSearchParams();
  const { dispatch } = useTaskForm();

  useEffect(() => {
    if (!id) return;

    async function fetchTaskData() {
      try {
        if (!db) return;

        const query = `SELECT * FROM tasks WHERE id = ?`;
        const taskData: TaskResponse | null = await db.getFirstAsync(query, [id as string]);
        if (!taskData) {
          emitError("Task not found!");
          return;
        }

        const subtasks = await fetchSubtasksData(id as string);

        // ✅ Format for InitialState
        const formattedData: InitialState = {
          taskName: taskData.task_name,
          startDate: new Date(taskData.start_date),
          endDate: taskData.end_date ? new Date(taskData.end_date) : null,
          reminderTime: taskData.reminder ? new Date(taskData.reminder) : null,
          taskPoint: taskData.task_point,
          negativeTaskPoint: taskData.negative_task_point,
          category: taskData.category,
          subtasks: subtasks || [],
          reminder_event_id: taskData?.reminder_event_id || null,
          isEditMode: true,
          originalEndDate: taskData.end_date ? new Date(taskData.end_date) : null
        };

        dispatch({ type: "INITIATE_EDIT_TASK_DATA", payload: formattedData });
      } catch (error) {
        console.error("❌ Error fetching edit data:", error);
        emitError("Failed to load task data.");
      }
    }

    async function fetchSubtasksData(task_id: string): Promise<Subtask[]> {

      try {
        if (!db) return [];
        const query = `SELECT * FROM subtasks WHERE task_id = ?`;
        const subtasksData: Subtask[] = await db.getAllAsync(query, [task_id]);
        return subtasksData;
      } catch (error) {
        console.error("❌ Error fetching subtasks:", error);
        return [];
      }
    }

    fetchTaskData();
  }, [id]);

  return null;
}

/**
 * ✅ Handles updating the edited task
 */
function SubmitButton() {
  const { state, dispatch } = useTaskForm();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  async function updateTask() {
    if (!db) return;
    const {
      taskName,
      startDate,
      endDate,
      reminderTime,
      taskPoint,
      negativeTaskPoint,
      category,
      subtasks,
      reminder_event_id
    } = state;

    const taskId = id as string;
    let reminder_event_id_android = null;

    // ✅ Validations
    if (!taskName?.trim()) {
      emitError("Please enter a task name");
      return;
    }

    if (!startDate) {
      emitError("Please select a start date");
      return;
    }

    if (!endDate) {
      emitError("Please select an end date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // Check if end date was changed from original
    const endDateChanged = state.originalEndDate
      ? end.getTime() !== new Date(state.originalEndDate).setHours(0, 0, 0, 0)
      : true; // If no original (create mode), always validate

    // Only validate end date >= today if user changed it
    if (endDateChanged && end < today) {
      emitError("End date cannot be older than today");
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (end < start) {
      emitError("End date cannot be before start date");
      return;
    }

    if (isNaN(taskPoint) || taskPoint < 0) {
      emitError("Task points must be 0 or greater");
      return;
    }

    if (isNaN(negativeTaskPoint) || negativeTaskPoint < 0) {
      emitError("Negative task points must be 0 or greater");
      return;
    }



    // ✅ Subtasks validation
    for (const [index, subtask] of subtasks.entries()) {
      if (!subtask.name.trim()) {
        emitError(`Subtask #${index + 1} is missing a name`);
        return;
      }
      if (isNaN(subtask.point) || subtask.point < 0) {
        emitError(`Subtask "${subtask.name}" must have valid non-negative points`);
        return;
      }
    }

    if (reminderTime) {

      if (reminder_event_id) {
        await deleteReminder(reminder_event_id);
      }


      // Build final reminder date = endDate + reminderTime
      const finalNotificationDate = new Date(endDate);
      finalNotificationDate.setHours(reminderTime.getHours());
      finalNotificationDate.setMinutes(reminderTime.getMinutes());
      finalNotificationDate.setSeconds(0);
      console.log("Final notification date: ", finalNotificationDate);
      console.log("Reminder time: ", reminderTime, reminderTime.getHours(), reminderTime.getMinutes());

      // Schedule notification
      const event_data = await createOneTimeReminder(
        "Task Reminder:",
        taskName,
        finalNotificationDate
      );

      // ✅ FAILURE → Remove reminder, continue with task creation
      if (!event_data.success) {
        emitError(event_data.message as string);

        dispatch({
          type: "SET_REMINDER_TIME",
          payload: null,
        });

      } else {
        // ✅ SUCCESS → store ID in global variable
        reminder_event_id_android = event_data.eventId
      }
    }

    try {
      setLoading(true);

      // ✅ Update main task
      const updateTaskSQL = `
        UPDATE tasks
        SET task_name = ?, start_date = ?, end_date = ?, reminder = ?, 
            task_point = ?, negative_task_point = ?, category = ?, reminder_event_id_android = ?
        WHERE id = ?;
      `;

      await db.runAsync(updateTaskSQL, [
        taskName.trim(),
        startDate.toISOString(),
        endDate ? endDate.toISOString() : null,
        reminderTime ? reminderTime.toISOString() : null,
        taskPoint,
        negativeTaskPoint,
        category,
        reminder_event_id_android || null,
        id as string,
      ]);

      // ✅ Delete existing subtasks and re-insert
      await db.runAsync(`DELETE FROM subtasks WHERE task_id = ?`, [id as string]);

      if (subtasks.length > 0) {
        const insertSubtaskSQL = `
          INSERT INTO subtasks (id, task_id, name, point)
          VALUES (?, ?, ?, ?);
        `;
        await Promise.all(
          subtasks.map((sub) =>
            db?.runAsync(insertSubtaskSQL, [uuid.v4().toString(), id as string, sub.name.trim(), sub.point])
          )
        );
      }

      emitSuccess("Task updated successfully!");
      emitTasksRefetch();
    } catch (error) {
      console.error("❌ Error updating task:", error);
      emitError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ width: '100%', paddingVertical: 6 }}>
      <Button3D disabled={loading} onClick={updateTask} style={{ width: '100%' }}>
        <View style={{ paddingHorizontal: 40, paddingVertical: 12 }}>
          <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>
            {loading ? "Updating..." : "Update"}
          </Text>
        </View>
      </Button3D>
    </View>
  );
}
