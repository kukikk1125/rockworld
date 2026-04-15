"use client";

import * as React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}

export function Checkbox({ 
  checked = false, 
  onCheckedChange, 
  className = "", 
  ...props 
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={`h-4 w-4 rounded border border-gray-300 text-rose-600 focus:ring-rose-500 ${className}`}
      {...props}
    />
  );
}
