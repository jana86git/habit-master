import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { styles } from './styles';

interface ModalViewProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  heading?: string;
  onRequestClose?: () => void;
  disableBackdropClose?: boolean; // optional to disable backdrop closing
}

export const ModalView: React.FC<ModalViewProps> = ({
  visible,
  onClose,
  children,
  containerStyle,
  heading,
  onRequestClose,
  disableBackdropClose = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]);

  if (!shouldRender) return null;

  const handleBackdropPress = () => {
    if (!disableBackdropClose) {
      onRequestClose ? onRequestClose() : onClose();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleBackdropPress}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
              containerStyle,
            ]}
          >
            {heading ? (
              <View style={styles.header}>
                <Text style={styles.title}>{heading}</Text>
                <TouchableOpacity
                  onPress={() => (onRequestClose ? onRequestClose() : onClose())}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : null}

            {children}
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
