export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function toHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
