export type Unit = {
  label: string;
  code: string;
};

export type BenefitType = {
  label: string;
  code: "environmental" | "economic" | "social" | string;
};

export type Benefit = {
  id: number;
  name: string;
  value: number;
  unit: Unit;
  type: BenefitType;
};

export type Sector = {
  label: string;
  code: string;
};

export type OrgType = {
  label: string;
  code: string;
};

export type Organization = {
  id: number;
  name: string;
  sector: Sector;
  org_type: OrgType;
};

export type FundingType = {
  code: string;
  label: string;
};

export type Logo = {
  id: number;
  alt_text: string;
  url: string;
};

export type Address = {
  id: number;
  case_study_id: number;
  admin_unit_l1: string;
  post_name: string;
};

export type CaseStudy = {
  id: number;
  title: string;
  short_description: string;
  benefits: Benefit[];
  is_provided_by: Organization[];
  is_funded_by: Organization[];
  funding_type: FundingType | null;
  logo: Logo | null;
  addresses?: Address[];
};
