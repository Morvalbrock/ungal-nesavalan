"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authInputCls } from "@/components/auth/AuthShell";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={`${authInputCls} pr-10 ${error ? "border-maroon" : ""} ${className ?? ""}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted transition hover:text-ink focus:outline-none"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
