import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from "react-native";

export interface FormField {
  name: string;
  value: string;
  error?: string;
}

export interface FormContainerProps {
  children: React.ReactNode;
  initialValues?: Record<string, string>;
  onSubmit?: (values: Record<string, string>) => void;
  onValuesChange?: (values: Record<string, string>) => void;
  validation?: Record<string, (value: string) => string | null>;
  style?: ViewStyle;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  initialValues = {},
  onSubmit,
  onValuesChange,
  validation = {},
  style,
  scrollable = true,
  keyboardAvoiding = true,
}) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateValue = useCallback(
    (name: string, value: string) => {
      const newValues = { ...values, [name]: value };
      setValues(newValues);

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }

      onValuesChange?.(newValues);
    },
    [values, errors, onValuesChange]
  );

  const validateField = useCallback(
    (name: string, value: string): string => {
      const validator = validation[name];
      if (validator) {
        return validator(value) || "";
      }
      return "";
    },
    [validation]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validation).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName] || "");
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validation, validateField]);

  const handleSubmit = useCallback(() => {
    // Mark all fields as touched
    const allTouched = Object.keys(validation).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (validateForm()) {
      onSubmit?.(values);
    }
  }, [values, validation, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Clone children and inject form props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if it's a FormInput component
      if (
        child.type &&
        typeof child.type === "object" &&
        "name" in child.props
      ) {
        const { name } = child.props;
        return React.cloneElement(child as any, {
          value: values[name] || "",
          error: touched[name] ? errors[name] : "",
          onChangeText: updateValue,
        });
      }

      // Check if it's a FormButton component
      if (
        child.type &&
        typeof child.type === "object" &&
        child.props.type === "submit"
      ) {
        return React.cloneElement(child as any, {
          validateForm,
          onSubmit: handleSubmit,
        });
      }

      if (
        child.type &&
        typeof child.type === "object" &&
        child.props.type === "reset"
      ) {
        return React.cloneElement(child as any, {
          onReset: resetForm,
        });
      }
    }
    return child;
  });

  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const content = <View style={containerStyle}>{enhancedChildren}</View>;

  if (keyboardAvoiding) {
    const keyboardAvoidingContent = (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    );

    return scrollable ? (
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {keyboardAvoidingContent}
      </ScrollView>
    ) : (
      keyboardAvoidingContent
    );
  }

  return scrollable ? (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView>
  ) : (
    content
  );
};

export {};
