import { z } from "zod";

export const updatePreferencesSchema = z.record(z.string(), z.unknown());
