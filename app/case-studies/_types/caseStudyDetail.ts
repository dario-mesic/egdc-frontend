import type { CaseStudy } from "./caseStudy";

export type Tech = {
  code: string;
  label: string;
};

export type CalcType = {
  code: string;
  label: string;
};

export type LanguageType = {
  code: string;
  label: string;
};

export type Methodology = {
  id: number;
  name: string;
  url: string;
  language: LanguageType;
};

export type Dataset = {
  id: number;
  name?: string;
  url: string;
  language: LanguageType;
};

export type ContactPoint = {
  id: number;
  name: string;
  has_email?: string;
};

export type OrganizationDetail = {
  id: number;
  name: string;
  description?: string;
  website_url?: string;
  sector: {
    label: string;
    code: string;
  };
  org_type: {
    label: string;
    code: string;
  };
  contact_points?: ContactPoint[];
};

export type CaseStudyDetail = CaseStudy & {
  long_description: string | null;
  problem_solved: string | null;
  created_date: string | null;

  tech: Tech | null;
  calc_type: CalcType | null;
  funding_type: {
    label: string;
    code: string;
  } | null;

  methodology: Methodology | null;
  dataset: Dataset | null;

  is_provided_by: OrganizationDetail[];
};
