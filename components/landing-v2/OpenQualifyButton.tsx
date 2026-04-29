"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type OpenQualifyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function OpenQualifyButton({
  className,
  onClick,
  type = "button",
  ...props
}: OpenQualifyButtonProps) {
  return (
    <button
      type={type}
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          window.dispatchEvent(new CustomEvent("open-qualify-modal"));
        }
      }}
      {...props}
    />
  );
}
