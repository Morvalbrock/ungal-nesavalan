const IST_TIME_ZONE = "Asia/Kolkata";

export function formatIST(
  iso: string | undefined | null,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { ...opts, timeZone: IST_TIME_ZONE });
}

export function formatISTDate(iso: string | undefined | null): string {
  return formatIST(iso, { day: "2-digit", month: "short", year: "numeric" });
}
