import { z } from "zod";

/**
 * Shared validation schema for formData fields.
 * Use validateFormData(schema, data) before submit or validate partial data with schema.partial().
 */
export const formDataSchema = z.object({
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  dob: z.string().min(1, "Date of birth required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Valid PAN required (e.g. ABCDE1234F)"),
  aadhaarNumber: z.string().refine((v) => v.replace(/\D/g, "").length === 12, "12-digit Aadhaar required"),
  fatherName: z.string().min(1, "Father's name required"),
  motherName: z.string().min(1, "Mother's name required"),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  incomeRange: z.string().min(1, "Income range required"),
  permanentAddressLine1: z.string().min(1, "Address required"),
  permanentAddressCity: z.string().min(1, "City required"),
  permanentAddressState: z.string().min(1, "State required"),
  permanentAddressPincode: z.string().regex(/^\d{6}$/, "6-digit pincode required"),
}).partial();

export type FormDataShape = z.infer<typeof formDataSchema>;

export function validateFormData(
  schema: z.ZodSchema,
  data: Record<string, unknown>
): { success: true } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true };
  const errors: Record<string, string> = {};
  if (result.error?.flatten) {
    const flat = result.error.flatten();
    for (const [k, v] of Object.entries(flat.fieldErrors)) {
      const msg = Array.isArray(v) ? v[0] : v;
      if (typeof msg === "string") errors[k] = msg;
    }
  }
  return { success: false, errors };
}
