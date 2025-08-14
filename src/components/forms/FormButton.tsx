import React from "react";
import { Button, ButtonProps } from "../ui/Button";

export interface FormButtonProps extends ButtonProps {
  type?: "submit" | "reset" | "button";
  formId?: string;
  validateForm?: () => boolean;
  onSubmit?: () => void;
  onReset?: () => void;
}

export const FormButton: React.FC<FormButtonProps> = ({
  type = "button",
  formId,
  validateForm,
  onSubmit,
  onReset,
  onPress,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (type === "submit") {
      // Validate form if validation function is provided
      if (validateForm && !validateForm()) {
        return;
      }
      onSubmit?.();
    } else if (type === "reset") {
      onReset?.();
    }

    // Call the original onPress if provided
    if (onPress) {
      onPress(event);
    }
  };

  // Set default variant based on type
  const getDefaultVariant = () => {
    switch (type) {
      case "submit":
        return "primary";
      case "reset":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Button
      {...props}
      variant={props.variant || getDefaultVariant()}
      onPress={handlePress}
    />
  );
};

export {};
