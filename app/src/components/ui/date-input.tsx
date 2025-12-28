"use client";

import React, { forwardRef, InputHTMLAttributes } from 'react';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
  value: string;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({ value, onChange, ...props }, ref) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (inputValue.length > 8) {
      inputValue = inputValue.slice(0, 8);
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
      maxLength={10} // "dd/mm/yyyy"
      placeholder="dd/mm/aaaa"
    />
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;
