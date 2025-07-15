import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitCamelCaseToWords(str: string) {
  str.replace(/(?!^)([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function truncateText(text: string, maxLength?: number): string {
  // function to truncate texts
  if (!maxLength || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// this function is to cut out some characters from the file name leaving the remaining string and the file extension
export function truncateFileName(fileName: string, maxLength: number) {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split(".").pop();
  const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf("."));
  const truncatedName = nameWithoutExtension.slice(0, maxLength - 3);
  return `${truncatedName}...${extension}`;
}

export function generateRandomFourDigits() {
  return Math.floor(1000 + Math.random() * 9000);
}
