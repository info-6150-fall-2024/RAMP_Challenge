import React from "react";

interface InputCheckboxProps {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (newValue: boolean) => void;
}

export const InputCheckbox: React.FC<InputCheckboxProps> = ({ id, checked, disabled, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
      aria-label="Approve transaction"
      style={{
        width: "16px",
        height: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
        appearance: "none",
        border: "2px solid #ccc",
        borderRadius: "4px",
        backgroundColor: checked ? "#4caf50" : "transparent", // Green when checked
        transition: "background-color 0.2s",
      }}
    />
  );
};
