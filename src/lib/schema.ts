import { z } from "zod";

// ============================================================
// Backend API Schemas (used by API routes)
// ============================================================

export const PaymentMode = {
  BANK: "BANK",
  EASYPAISA: "EASYPAISA",
  PAYPAL: "PAYPAL",
  OTHER: "OTHER",
} as const;

export const createReceiptSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  emailAddress: z.string().email("Invalid email address"),
  paymentMode: z.enum(["BANK", "EASYPAISA", "PAYPAL", "OTHER"]),
  paymentModeOther: z.string().optional().nullable(),
  currency: z.enum(["PKR", "USD"]).default("PKR"),
  isInstallment: z.boolean().default(false),
  amountPaid: z.number().positive("Amount must be positive"),
  remainingAmount: z.number().min(0).default(0).optional().nullable(),
  paymentDate: z.string().datetime().optional().nullable(),
});

export const searchReceiptSchema = z.object({
  receiptNumber: z.string().optional(),
  studentName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

// ============================================================
// Frontend Form Schema (used by react-hook-form on student page)
// ============================================================

const paymentModeOptions = ["Bank Transfer", "EasyPaisa", "PayPal", "Other"] as const;
const currencyOptions = ["PKR", "USD"] as const;

export const formSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(100),
    phoneNumber: z.string().min(1, "Phone number is required").max(20),
    email: z.string().email("Invalid email address"),
    currency: z.enum(currencyOptions, {
      required_error: "Please select a currency",
    }),
    modeOfPayment: z.enum(paymentModeOptions, {
      required_error: "Please select a payment mode",
    }),
    otherPaymentMethod: z.string().optional(),
    isInstallment: z.enum(["yes", "no"], {
      required_error: "Please select an option",
    }),
    // If not installment
    amountPaid: z.string().optional(),
    // If installment
    firstInstallmentPaid: z.string().optional(),
    remainingAmount: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modeOfPayment === "Other" && !data.otherPaymentMethod?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the payment method",
        path: ["otherPaymentMethod"],
      });
    }
    if (data.isInstallment === "no") {
      if (!data.amountPaid || parseFloat(data.amountPaid) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter the payment amount",
          path: ["amountPaid"],
        });
      }
    }
    if (data.isInstallment === "yes") {
      if (!data.firstInstallmentPaid || parseFloat(data.firstInstallmentPaid) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter the 1st installment amount",
          path: ["firstInstallmentPaid"],
        });
      }
      if (!data.remainingAmount || parseFloat(data.remainingAmount) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter the remaining amount",
          path: ["remainingAmount"],
        });
      }
    }
  });

export type PaymentFormData = z.infer<typeof formSchema>;