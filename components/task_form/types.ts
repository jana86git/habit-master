export interface Subtask{
  id: string
  name: string,
  point: number,
  task_id: string
}
export interface InitialState {
   taskName: string;
    startDate: Date;
    endDate: Date | null;
    reminderTime: Date | null;
    taskPoint: number;
    negativeTaskPoint: number;
    category:string | null;
    subtasks: Subtask[];
    reminder_event_id: string | null;
}



export interface Task {
    id: string;
    task_name: string;
    task_point: number;
    negative_task_point: number;
    start_date: string;
    end_date: string | null;
    category: string | null;
    
}

export interface TaskWithSubtask {
    id: string;
    task_name: string;
    task_point: number;
    negative_task_point: number;
    start_date: string;
    end_date: string | null;
    category: string | null;
    subtasks: Subtask[];
}

export type TaskResponse = {
  id: string;
  task_name: string;
  category: string | null;
  reminder: string | null;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  task_point: number;
  negative_task_point: number;
  created_at: string; // timestamp string
  reminder_event_id: string | null
};

export type Action =
  // Task/Habit form updates
  | { type: "SET_TASK_NAME"; payload: string }
  | { type: "SET_START_DATE"; payload: Date }
  | { type: "SET_END_DATE"; payload: Date | null }
  | { type: "SET_REMINDER_TIME"; payload: Date | null }
  | { type: "SET_TASK_POINT"; payload: number }
  | { type: "SET_NEGATIVE_TASK_POINT"; payload: number }
  | { type: "SET_CATEGORY"; payload: string | null }
  | { type: "INITIATE_EDIT_TASK_DATA"; payload: InitialState }

  // Subtasks
  | { type: "ADD_SUBTASK"; payload: Subtask }
  | { type: "UPDATE_SUBTASK"; payload: { index: number; subtask: Subtask } }
  | { type: "REMOVE_SUBTASK"; payload: number }
  | { type: "SET_SUBTASKS"; payload: Subtask[] };


    