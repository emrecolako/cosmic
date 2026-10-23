import { createHash } from "node:crypto";
import { ENGINE_VERSION } from "./types";

export const HOUSE_SYSTEM = "whole_sign";

/** Server-computed identity of the chart inputs; bound into the reading hash and cache key. */
export function chartKey(body: Record<string, unknown>): string {
  return createHash("sha256")
    .update(JSON.stringify([body.dateOfBirth, body.birthTime || null, body.birthPlace || null, HOUSE_SYSTEM, ENGINE_VERSION]))
    .digest("hex");
}
