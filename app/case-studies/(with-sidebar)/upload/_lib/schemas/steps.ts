import { baseMetadataSchema } from "./caseStudy";

export const step1Schema = baseMetadataSchema.pick({
  title: true,
  short_description: true,
  long_description: true,
  problem_solved: true,
  created_date: true,
});

export const step2Schema = baseMetadataSchema.pick({
  tech_code: true,
  calc_type_code: true,
  funding_type_code: true,
});

export const step3Schema = baseMetadataSchema.pick({
  addresses: true,
});

export const step4Schema = baseMetadataSchema.pick({
  provider_org_id: true,
  funder_org_id: true,
  used_by_org_id: true,
});

export const step5Schema = baseMetadataSchema
  .pick({ benefits: true })
  .superRefine((val, ctx) => {
    const hasEnvironmental = (val.benefits ?? []).some(
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
