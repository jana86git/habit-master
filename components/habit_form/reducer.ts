import { Action, InitialState } from "./types";
export const initialState: InitialState = {
    habitName:"",
    startDate:new Date(),
    endDate:null,
    reminderTime: null,
    frequency:"Daily",
    hourlyFrequncyRate: 0,
    nDaysFrequencyRate: 2,
    taskPoint:5,
    negativeTaskPoint:3,
    evaluationType:"Numeric",
    targetCondition: "At_Least",
    targetValue:10,
    targetUnit:null,
    category: null
}

export function reducer(state: InitialState, action: Action): InitialState {
  switch (action.type) {
    case "SET_HABIT_NAME":
      return { ...state, habitName: action.payload };

    case "SET_START_DATE":
      return { ...state, startDate: action.payload };

    case "SET_END_DATE":
      return { ...state, endDate: action.payload };

    case "SET_FREQUENCY":
      return { ...state, frequency: action.payload };

    case "SET_HOURLY_FREQUENCY_RATE":
      return { ...state, hourlyFrequncyRate: action.payload };

    case "SET_NDAYS_FREQUENCY_RATE":
      return { ...state, nDaysFrequencyRate: action.payload };

    case "SET_TASK_POINT":
      return { ...state, taskPoint: action.payload };

    case "SET_NEGATIVE_TASK_POINT":
      return { ...state, negativeTaskPoint: action.payload };

    case "SET_EVALUATION_TYPE":
      return { ...state, evaluationType: action.payload };

    case "SET_TARGET_CONDITION":
      return { ...state, targetCondition: action.payload };

    case "SET_TARGET_VALUE":
      return { ...state, targetValue: action.payload };

    case "SET_TARGET_UNIT":
      return { ...state, targetUnit: action.payload };

    case "SET_REMINDER_TIME":
      return { ...state, reminderTime: action.payload };

    default:
      return state;
  }
}