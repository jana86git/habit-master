export interface CompletionGroup {
  value: number;
  label: string;
  dataPointText: string;
}

export interface DBRow {
  group_id: number;
  totalValue: number;
  startLabel: string;
  endLabel: string;
}

export interface InitialState {
  groupedData: CompletionGroup[];
  roundedMax: number;
  roundedMin: number;
  filter: "all" | "completed" | "pending" | string;
}

// Define all action types
export type Action =
  | { type: "SET_GROUPED_DATA"; payload: CompletionGroup[] }
  | { type: "SET_ROUNDED_MAX"; payload: number }
  | { type: "SET_ROUNDED_MIN"; payload: number }
  | { type: "SET_FILTER"; payload: string }
  | { type: "RESET_STATE" };