import React, { useEffect } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from './styles';
import { RadioButtonProps } from './types';

const RadioButton: React.FC<RadioButtonProps> = ({ 
  label, 
  selected, 
  onPress, 
  disabled = false 
}) => {
  const scaleAnim = new Animated.Value(selected ? 1 : 0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 1 : 0,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [selected, scaleAnim]);

  return (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.radioOuter,
        selected && styles.radioOuterSelected,
        disabled && styles.radioDisabled
      ]}>
        <Animated.View
          style={[
            styles.radioInner,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      </View>
      <Text style={[
        styles.radioLabel,
        disabled && styles.radioLabelDisabled
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};





export default RadioButton;