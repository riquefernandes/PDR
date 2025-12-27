"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useForm, Controller } from 'react-hook-form';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
  value: string;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ value, onChange, ...props }, ref) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (inputValue.length > 6) {
      inputValue = inputValue.slice(0, 6);
    }

    if (inputValue.length >= 5) {
      inputValue = `${inputValue.slice(0, 2)}/${inputValue.slice(2, 4)}/${inputValue.slice(4)}`;
    } else if (inputValue.length >= 3) {
      inputValue = `${inputValue.slice(0, 2)}/${inputValue.slice(2)}`;
    }
    
    onChange(inputValue);
  };

  return (
    <input
      {...props}
      ref={ref}
      value={value}
      onChange={handleInputChange}
      maxLength={8} // "dd/mm/yy"
    />
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;
