export type SortDir = "asc" | "desc";

export interface SortSpec {
  field: string;
  dir: SortDir;
}

export function parseSort(
  raw: string | undefined,
  defaultField: string,
  defaultDir: SortDir = "desc"
): SortSpec {
  if (!raw) return { field: defaultField, dir: defaultDir };
  const [field, dir] = raw.split("-");
  if (!field) return { field: defaultField, dir: defaultDir };
  return { field, dir: dir === "asc" ? "asc" : "desc" };
}
