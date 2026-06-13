import { PaginationParams } from "./pagination.types";

export function parsePagination(
  query: Record<string, unknown>,
): PaginationParams {
  const limit = Math.min(
    Math.max(parseInt(String(query["limit"] ?? "20"), 10), 1),
    100,
  );
  const offset = Math.max(parseInt(String(query["offset"] ?? "0"), 10), 0);
  return { limit, offset };
}
