export interface Subtask{
  id: string
  name: string,
  point: number
}
export interface InitialState {
   taskName: string;
    startDate: Date;
    endDate: Date | null;
    reminderTime: Date | null;
    taskPoint: number;
    negativeTaskPoint: number;
    category:string | null;
    subtasks: Subtask[]
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

export type Action =
  // Task/Habit form updates
  | { type: "SET_TASK_NAME"; payload: string }
  | { type: "SET_START_DATE"; payload: Date }
  | { type: "SET_END_DATE"; payload: Date | null }
  | { type: "SET_REMINDER_TIME"; payload: Date | null }
  | { type: "SET_TASK_POINT"; payload: number }
  | { type: "SET_NEGATIVE_TASK_POINT"; payload: number }
  | { type: "SET_CATEGORY"; payload: string | null }

  // Subtasks
  | { type: "ADD_SUBTASK"; payload: Subtask }
  | { type: "UPDATE_SUBTASK"; payload: { index: number; subtask: Subtask } }
  | { type: "REMOVE_SUBTASK"; payload: number }
  | { type: "SET_SUBTASKS"; payload: Subtask[] };


    