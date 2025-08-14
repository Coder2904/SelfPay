import React from "react";
import { StatusBar } from "expo-status-bar";
import "./global.css";

// Import navigation components
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export {};
