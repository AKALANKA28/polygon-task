import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native-worklets
jest.mock('react-native-worklets', () => {
  return {
    createSerializable: (val) => val,
    serializableMappingCache: new Map(),
    scheduleOnUI: (fn) => fn,
    createSynchronizable: (fn) => fn,
    runOnUISync: (fn) => fn,
    Worklets: {
      createRunOnJS: (fn) => fn,
      createRunOnUI: (fn) => fn,
      defaultContext: {},
    },
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => {
  return {
    fetch: jest.fn().mockResolvedValue({ isConnected: true }),
    addEventListener: jest.fn(() => () => {}),
  };
});
