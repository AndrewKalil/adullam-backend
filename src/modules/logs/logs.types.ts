import type { InferType } from "yup";

import type { listLogsSchema } from "./logs.schemas";

export type ListLogsQuery = InferType<typeof listLogsSchema>;
