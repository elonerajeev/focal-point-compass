import { z } from "zod";

import { clientStatusSchema } from "./client.schema";

export const createInvoiceSchema = z.object({
  client: z.string().min(1).max(160),
  amount: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: clientStatusSchema.optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();
