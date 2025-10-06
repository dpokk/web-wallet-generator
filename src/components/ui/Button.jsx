import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const variantClassMap = {
  default: null,
  secondary: "button--secondary",
  outline: "button--outline",
  ghost: "button--ghost",
};

export const Button = forwardRef(function Button(
  { variant = "default", className, type = "button", ...props },
  ref
) {
  const variantClass = variantClassMap[variant] ?? variantClassMap.default;

  return (
    <button
      ref={ref}
      type={type}
      className={cn("button", variantClass, className)}
      {...props}
    />
  );
});
