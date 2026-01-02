import type { CaseStudy } from "./caseStudy";

export type CaseStudySearchParams = {
  q?: string;
  sector?: string | string[];
  tech_code?: string | string[];
  funding_type_code?: string | string[];
  calc_type_code?: string | string[];
  country?: string | string[];
  organization_types?: string | string[];
  benefit_units?: string | string[];
  benefit_types?: string | string[];
  page?: string;
  limit?: string;
};

export type PaginatedCaseStudies = {
  total: number;
  page: number;
  limit: number;
  items: CaseStudy[];
};
