import React from "react";
import { Input, InputProps } from "../ui/Input";

export interface FormInputProps extends Omit<InputProps, "onChangeText"> {
  name: string;
  onChangeText: (name: string, value: string) => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  onChangeText,
  validation,
  error,
  isRequired,
  ...props
}) => {
  const [localError, setLocalError] = React.useState<string>("");

  const validateInput = (value: string): string => {
    if (!validation) return "";

    // Required validation
    if (validation.required && !value.trim()) {
      return `${props.label || name} is required`;
    }

    // Min length validation
    if (validation.minLength && value.length < validation.minLength) {
      return `${props.label || name} must be at least ${
        validation.minLength
      } characters`;
    }

    // Max length validation
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${props.label || name} must be no more than ${
        validation.maxLength
      } characters`;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value)) {
      return `${props.label || name} format is invalid`;
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(value);
      if (customError) return customError;
    }

    return "";
  };

  const handleChangeText = (value: string) => {
    const validationError = validateInput(value);
    setLocalError(validationError);
    onChangeText(name, value);
  };

  const handleBlur = () => {
    if (props.value) {
      const validationError = validateInput(props.value);
      setLocalError(validationError);
    }
  };

  return (
    <Input
      {...props}
      error={error || localError}
      isRequired={isRequired || validation?.required}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
    />
  );
};

export {};
