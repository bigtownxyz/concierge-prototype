"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type OpenApplyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Opens the global programme-first apply modal (no programme pre-selected). */
export function OpenApplyButton({
  className,
  onClick,
  type = "button",
  ...props
}: OpenApplyButtonProps) {
  return (
    <button
      type={type}
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          window.dispatchEvent(new CustomEvent("open-apply-modal"));
        }
      }}
      {...props}
    />
  );
}
