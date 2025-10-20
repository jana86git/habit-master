export interface InitialState {
    habitName: string;
    startDate: Date;
    endDate: Date | null;
    reminderTime: Date | null;
    frequency: "Hourly"|"Daily"|"Weekly"|"Monthly"|"Repeat_Every_N_Days";
    hourlyFrequncyRate: number | null;
    nDaysFrequencyRate: number | null;
    taskPoint: number;
    negativeTaskPoint: number;
    evaluationType: "Yes_Or_No" | "Numeric";
    targetCondition: "At_Least" | "Less_Than" | "Exact";
    targetValue: number | null;
    targetUnit: string|null;
    category:string |null
}

export type Action =
  | { type: "SHOW_CREATE_OPTION"; payload: boolean }
  | { type: "SHOW_ANY"; payload: string }
  | { type: "SET_SELECTED_CREATE_OPTION"; payload: string }

  // Habit form updates
  | { type: "SET_HABIT_NAME"; payload: string }
  | { type: "SET_START_DATE"; payload: Date }
  | { type: "SET_END_DATE"; payload: Date | null }
  | { type: "SET_REMINDER_TIME"; payload: Date | null }
  | {
      type: "SET_FREQUENCY";
      payload:
        | "Hourly"
        | "Daily"
        | "Weekly"
        | "Monthly"
        | "Repeat_Every_N_Days";
    }
  | { type: "SET_HOURLY_FREQUENCY_RATE"; payload: number | null }
  | { type: "SET_NDAYS_FREQUENCY_RATE"; payload: number | null }
  | { type: "SET_TASK_POINT"; payload: number }
  | { type: "SET_NEGATIVE_TASK_POINT"; payload: number }
  | { type: "SET_EVALUATION_TYPE"; payload: "Yes_Or_No" | "Numeric" }
  | { type: "SET_TARGET_CONDITION"; payload: "At_Least" | "Less_Than" | "Exact" }
  | { type: "SET_TARGET_VALUE"; payload: number | null }
  | { type: "SET_TARGET_UNIT"; payload: string | null }
  | { type: "SET_CATEGORY"; payload: string | null };

    