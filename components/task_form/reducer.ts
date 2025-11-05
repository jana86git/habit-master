import { Action, InitialState } from "./types";
export const initialState: InitialState = {
    taskName:"",
    startDate:new Date(),
    endDate:null,
    reminderTime: null,
    taskPoint:5,
    negativeTaskPoint:3,
    category: null,
    subtasks: []
}
export function reducer(state: InitialState, action: Action): InitialState {
  switch (action.type) {
    // Task fields
    case "SET_TASK_NAME":
      return { ...state, taskName: action.payload };
    case "SET_START_DATE":
      return { ...state, startDate: action.payload };
    case "SET_END_DATE":
      return { ...state, endDate: action.payload };
    case "SET_REMINDER_TIME":
      return { ...state, reminderTime: action.payload };
    case "SET_TASK_POINT":
      return { ...state, taskPoint: action.payload };
    case "SET_NEGATIVE_TASK_POINT":
      return { ...state, negativeTaskPoint: action.payload };
    case "SET_CATEGORY":
      return { ...state, category: action.payload };
    case "INITIATE_EDIT_TASK_DATA":
      return action.payload


    // Subtasks
    case "ADD_SUBTASK":
      return { ...state, subtasks: [...state.subtasks, action.payload] };
    case "UPDATE_SUBTASK":
      return {
        ...state,
        subtasks: state.subtasks.map((st, i) =>
          i === action.payload.index ? action.payload.subtask : st
        ),
      };
    case "REMOVE_SUBTASK":
      return {
        ...state,
        subtasks: state.subtasks.filter((_, i) => i !== action.payload),
      };
    case "SET_SUBTASKS":
      return { ...state, subtasks: action.payload };

    default:
      return state;
  }
}
