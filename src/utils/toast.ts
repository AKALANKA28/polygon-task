import Toast from 'react-native-toast-message';

export const toast = {
  success: (message: string) =>
    Toast.show({
      type: 'success',
      text1: message,
      visibilityTime: 3000,
      position: 'top',
    }),
  error: (message: string) =>
    Toast.show({
      type: 'error',
      text1: message,
      visibilityTime: 4000,
      position: 'top',
    }),
  info: (message: string) =>
    Toast.show({
      type: 'info',
      text1: message,
      visibilityTime: 2500,
      position: 'top',
    }),
};
