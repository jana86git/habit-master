export interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export interface RadioOption {
  id: string;
  label: string;
  disabled?: boolean;
}