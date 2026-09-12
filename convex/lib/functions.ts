import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { internalMutation as rawInternalMutation } from "../_generated/server";
import { articleTriggers } from "./articleAggregate";

/** Internal writes that go through this wrapper keep the article aggregate in sync. */
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(articleTriggers.wrapDB),
);
