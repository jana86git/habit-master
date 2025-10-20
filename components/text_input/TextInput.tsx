import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { styles } from './styles';
interface TextInputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'numeric' | 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'visible-password';
}

const TextInputComponent: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          {...props}
        />
        <View style={styles.borderBottom} />
      
      </View>
    </View>
  );
};



export default TextInputComponent;