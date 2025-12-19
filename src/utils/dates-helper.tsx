import { format } from "date-fns";

export const convertUtcToLocal = (utcDateStr: string): string => {
  console.log("Original UTC Date String:", utcDateStr);
  // Append 'Z' to the end of the string to force UTC interpretation
  const utcDateObject: Date = new Date(utcDateStr);

  const formattedLocalDate: string = formatDateWithFns(utcDateObject);
  console.log("formattedLocalDate: ", formattedLocalDate);

  return formattedLocalDate;
};

export const formatDateWithFns = (date: Date): string => {
  // The format tokens represent:
  // EEE: Mon (short weekday)
  // d: 1 (day of month)
  // MMM: Dec (short month)
  // yyyy: 2025 (year)
  // hh: 01 (12-hour time with leading zero)
  // mm: 52 (minutes with leading zero)
  // aa: AM/PM marker
  return format(date, "EEE d MMM yyyy - hh:mmaa");
};
