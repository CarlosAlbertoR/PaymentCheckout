import React from "react";
import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { AppTheme } from "./src/theme/AppTheme";

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={AppTheme}>
        <AppNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </Provider>
  );
}
