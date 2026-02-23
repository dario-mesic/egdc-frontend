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

export type Logo = {
  alt_text: string;
  url: string;
  id: number;
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

export type AdditionalDocument = {
  id: number;
  name: string;
  url: string;
  language: LanguageType;
};

export type SubSector = {
  code: string;
  label: string;
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
  sector_code: string;
  org_type_code: string;
  sub_sectors: SubSector[];
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
  created_by: number;
  status: string;
  funding_programme_url: string | null;
  logo_id: number;
  methodology_id: number;
  dataset_id: number;
  additional_document_id: number | null;
  tech: Tech | null;
  tech_code: string;
  calc_type: CalcType | null;
  calc_type_code: string;
  funding_type: {
    label: string;
    code: string;
  } | null;
  funding_type_code: string;
  logo: Logo | null;
  methodology: Methodology | null;
  dataset: Dataset | null;
  additional_document: AdditionalDocument | null;
  is_provided_by: OrganizationDetail[];
};
