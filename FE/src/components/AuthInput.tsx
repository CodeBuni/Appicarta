import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";
import { colors } from "../styles/theme";

export default function AuthInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#999"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
});
