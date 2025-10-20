import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { styles } from './styles';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  heading?: string;
  onRequestClose?: () => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, children, containerStyle, heading, onRequestClose }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(slideAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, slideAnim]);

  if (!shouldRender) return null;

  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });

  return (
    <View
      
      style={styles.overlay}
     
    >
      <Animated.View
        style={[styles.container, { transform: [{ translateY }] }, containerStyle]}
      >
        <View>
          {heading ? (
            <View style={styles.header}>
              <Text style={styles.title}>{heading}</Text>
              <TouchableOpacity onPress={() => (onRequestClose ? onRequestClose() : onClose())} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ) : null}
          {children}
        </View>
      </Animated.View>
    </View>
  );
};


