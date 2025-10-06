import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn("card", className)} {...props} />;
});

export const CardHeader = forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn("card-header", className)} {...props} />;
});

export const CardTitle = forwardRef(function CardTitle({ className, ...props }, ref) {
  return <h3 ref={ref} className={cn("card-title", className)} {...props} />;
});

export const CardDescription = forwardRef(function CardDescription(
  { className, ...props },
  ref
) {
  return <p ref={ref} className={cn("card-description", className)} {...props} />;
});

export const CardContent = forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn("card-content", className)} {...props} />;
});
