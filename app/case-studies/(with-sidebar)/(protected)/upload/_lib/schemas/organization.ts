import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Max 80 characters"),

  description: z
    .string()
    .trim()
    .max(160, "Max 160 characters")
    .optional()
    .nullable(),
  website_url: z
    .string()
    .trim()
    .url("Website URL must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),

  sector_code: z.string().trim().min(1, "Sector is required"),
  org_type_code: z.string().trim().min(1, "Organization type is required"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
