import type { PaymentMode as DbPaymentMode } from "@prisma/client";

export type ApiPaymentMode = "bank-transfer" | "cash" | "upi";

export function toDbPaymentMode(mode: ApiPaymentMode): DbPaymentMode {
  return mode === "bank-transfer" ? "bank_transfer" : mode;
}

export function fromDbPaymentMode(mode: DbPaymentMode): ApiPaymentMode {
  return mode === "bank_transfer" ? "bank-transfer" : mode;
}
