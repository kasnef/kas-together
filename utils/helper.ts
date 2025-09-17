import { formatInTimeZone, toZonedTime, getTimezoneOffset } from "date-fns-tz";

export class Helper {
  static getNowTz() {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const isoString = formatInTimeZone(
      now,
      userTimeZone,
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
    );

    return isoString;
  }

  static truncate(str: string, maxLength = 100): string {
    if (!str) return "";
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  }
}
