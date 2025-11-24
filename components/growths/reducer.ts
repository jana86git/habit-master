import { Action, InitialState } from "./types";
export const initialState: InitialState = {
  groupedData: [],
  roundedMax: 0,
  roundedMin: 0,
  filter: "all",
};

// -----------------------------
// Reducer Function
// -----------------------------

export function reducer(state: InitialState, action: Action): InitialState {
  switch (action.type) {
    case "SET_GROUPED_DATA":
      return { ...state, groupedData: action.payload };

    case "SET_ROUNDED_MAX":
      return { ...state, roundedMax: action.payload };

    case "SET_ROUNDED_MIN":
      return { ...state, roundedMin: action.payload };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "RESET_STATE":
      return { ...initialState };

    default:
      return state;
  }
}