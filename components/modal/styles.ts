import { colors } from '@/constants/colors';
import { Dimensions, StyleSheet } from 'react-native';
const height = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    // backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    flex:1,
    display: 'flex',
    flexDirection: 'column',
    height: height-100,
    alignSelf: 'center',
    zIndex:999999
  },
  modalContainer: {
    width: '95%',
    height: '50%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderColor: colors.secondary,
    borderWidth:1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
});
