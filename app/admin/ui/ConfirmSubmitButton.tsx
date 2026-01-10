"use client";

import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
};

export default function ConfirmSubmitButton({ message, onClick, ...props }: Props) {
  return (
    <button
      {...props}
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}
