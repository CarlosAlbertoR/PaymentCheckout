// Mock react-native-vector-icons
jest.mock("react-native-vector-icons/MaterialIcons", () => "Icon");

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const InsetsContext = React.createContext({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaInsetsContext: {
      Provider: InsetsContext.Provider,
      Consumer: InsetsContext.Consumer,
    },
  };
});

// Mock react-native-screens
jest.mock("react-native-screens", () => ({
  enableScreens: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: ({ children }) => children,
  State: {},
}));

// Mock expo modules
jest.mock("expo-status-bar", () => ({
  StatusBar: "StatusBar",
}));

jest.mock("expo-font", () => ({
  useFonts: () => [true, null],
}));

// Mock react-native-masked-text
jest.mock("react-native-masked-text", () => ({
  TextInputMask: "TextInputMask",
}));

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Do not mock react-redux to allow real Provider/store in component tests

// Mock react-hook-form
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    setValue: jest.fn(),
    getValues: jest.fn(),
    watch: jest.fn(),
  }),
  Controller: ({ render }) =>
    render({ field: { onChange: jest.fn(), value: "" } }),
}));
