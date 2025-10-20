import { z } from "zod";

export const creditCardSchema = z.object({
  number: z
    .string()
    .min(1, "Card number is required")
    .regex(/^\d{16}$/, "Card number must be exactly 16 digits")
    .transform((val) => val.replace(/\s/g, "")), // Remove spaces
  expiry: z
    .string()
    .min(1, "Expiry date is required")
    .refine((val) => {
      // Accept both MM/YY and MMYY formats
      const cleaned = val.replace("/", "");
      return /^(0[1-9]|1[0-2])\d{2}$/.test(cleaned);
    }, "Expiry must be in MM/YY format")
    .transform((val) => {
      // Convert to MMYY format for backend
      return val.replace("/", "");
    }),
  cvc: z
    .string()
    .min(1, "CVC is required")
    .regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
  cardholderName: z
    .string()
    .min(1, "Cardholder name is required")
    .min(2, "Cardholder name must be at least 2 characters"),
});

export const customerInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 10,
      "Phone must be at least 10 digits"
    ),
});

export const paymentFormSchema = z.object({
  creditCard: creditCardSchema,
  customerInfo: customerInfoSchema,
});

export type CreditCardFormData = z.infer<typeof creditCardSchema>;
export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
