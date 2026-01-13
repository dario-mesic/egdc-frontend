import { z } from "zod";

export const benefitSchema = z.object({
  type_code: z.string().min(1, "Benefit type is required"),
  name: z.string().min(1, "Benefit name is required").max(255, "Max 255 chars"),
  value: z.coerce
    .number()
    .int("Value must be an integer")
    .nonnegative("Value must be >= 0"),
  unit_code: z.string().min(1, "Unit is required"),
});

export const addressSchema = z.object({
  admin_unit_l1: z.string().min(1, "Country is required"),
  post_name: z.string().optional().default(""),
});

export const baseMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Max 255 chars"),
  short_description: z.string().min(1, "Short description is required"),
  long_description: z.string().min(1, "Long description is required"),
  problem_solved: z.string().min(1, "Problem solved is required"),
  created_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

  tech_code: z.string().min(1, "Technology is required"),
  calc_type_code: z.string().min(1, "Calculation type is required"),
  funding_type_code: z.string().optional().nullable(),

  addresses: z.array(addressSchema).min(1, "At least one address is required"),

  provider_org_id: z.coerce.number().int().positive("Provided By is required"),
  funder_org_id: z.coerce.number().int().positive().optional().nullable(),
  used_by_org_id: z.coerce.number().int().positive().optional().nullable(),

  benefits: z.array(benefitSchema).min(1, "At least one benefit is required"),
});

export const metadataSchema = baseMetadataSchema.superRefine((val, ctx) => {
  const hasEnvironmental = val.benefits.some(
    (b) => (b.type_code || "").toLowerCase() === "environmental"
  );

  if (!hasEnvironmental) {
    ctx.addIssue({
      code: "custom",
      path: ["benefits"],
      message: 'At least one benefit must be of type "Environmental".',
    });
  }
});

export type CaseStudyMetadata = z.infer<typeof baseMetadataSchema>;

export const wizardPayloadSchema = z.object({
  metadata: metadataSchema,
  files: z.object({
    file_methodology: z.instanceof(File, {
      message: "Methodology report is required",
    }),
    file_dataset: z.instanceof(File, {
      message: "Calculator/Dataset is required",
    }),
    file_logo: z.instanceof(File, { message: "Logo file is required" }),
  }),
});

export type WizardPayload = z.infer<typeof wizardPayloadSchema>;
