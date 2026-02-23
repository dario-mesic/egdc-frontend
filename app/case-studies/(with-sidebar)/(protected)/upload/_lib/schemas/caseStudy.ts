import { z } from "zod";

export const benefitSchema = z.object({
  type_code: z.string().min(1, "Benefit type is required"),
  name: z
    .string()
    .min(1, "Benefit name is required")
    .max(80, "Max 80 characters"),
  value: z.coerce
    .number()
    .int("Value must be an integer")
    .nonnegative("Value must be >= 0"),
  unit_code: z.string().min(1, "Unit is required"),
  functional_unit: z.string().min(1, "Functional unit is required"),
});

export const addressSchema = z.object({
  admin_unit_l1: z.string().min(1, "Country is required"),
  post_name: z.string().optional().default(""),
});

export const baseMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(80, "Max 80 characters"),
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(160, "Max 160 characters"),
  long_description: z
    .string()
    .min(1, "Long description is required")
    .max(1000, "Max 1000 characters"),
  problem_solved: z
    .string()
    .min(1, "Problem solved is required")
    .max(1000, "Max 1000 characters"),
  created_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

  tech_code: z.string().min(1, "Technology is required"),
  calc_type_code: z.string().min(1, "Calculation type is required"),
  funding_type_code: z.string().optional().nullable(),
  funding_programme_url: z
    .url("Funding programme URL must be a valid URL.")
    .optional()
    .nullable(),

  addresses: z.array(addressSchema).min(1, "At least one address is required"),

  provider_org_id: z.coerce.number().int().positive("Provided By is required"),
  funder_org_id: z.coerce.number().int().positive().optional().nullable(),
  used_by_org_id: z.coerce.number().int().positive().optional().nullable(),

  benefits: z.array(benefitSchema).min(1, "At least one benefit is required"),
  methodology_language_code: z
    .string()
    .min(1, "Methodology language is required"),
  dataset_language_code: z.string().min(1, "Dataset language is required"),
  additional_language_code: z
    .string()
    .min(1, "Additional document language is required"),
});

export const metadataSchema = baseMetadataSchema.superRefine((val, ctx) => {
  const hasEnvironmental = val.benefits.some(
    (b) => (b.type_code || "").toLowerCase() === "environmental",
  );

  if (!hasEnvironmental) {
    ctx.addIssue({
      code: "custom",
      path: ["benefits"],
      message: 'At least one benefit must be of type "Environmental".',
    });
  }

  const isPublic = (val.funding_type_code || "").toLowerCase() === "public";
  if (isPublic) {
    const url = (val.funding_programme_url ?? "").trim();
    if (!url) {
      ctx.addIssue({
        code: "custom",
        path: ["funding_programme_url"],
        message: "Funding programme URL is required for public funding.",
      });
    } else {
      const ok = z.string().url().safeParse(url).success;
      if (!ok) {
        ctx.addIssue({
          code: "custom",
          path: ["funding_programme_url"],
          message: "Funding programme URL must be a valid URL.",
        });
      }
    }
  } else {
    if (val.funding_programme_url) {
      ctx.addIssue({
        code: "custom",
        path: ["funding_programme_url"],
        message: "Funding programme URL is only allowed for public funding.",
      });
    }
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
    file_additional: z.instanceof(File).optional(),
  }),
});

export type WizardPayload = z.infer<typeof wizardPayloadSchema>;
