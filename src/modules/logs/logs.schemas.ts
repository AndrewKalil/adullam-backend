import { number, object, string } from "yup";

import { VALID_ENTITY_TYPE_VALUES, VALID_LOG_ACTION_VALUES } from "./logs.constants";

export const listLogsSchema = object({
  action: string().oneOf([...VALID_LOG_ACTION_VALUES]).optional(),
  entity_type: string().oneOf([...VALID_ENTITY_TYPE_VALUES]).optional(),
  created_from: string().optional(),
  created_to: string().optional(),
  limit: number().integer().min(1).max(100).default(20),
  offset: number().integer().min(0).default(0),
});
