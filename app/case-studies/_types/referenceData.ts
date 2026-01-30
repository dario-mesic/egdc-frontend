export type Option = {
  code: string;
  label: string;
};

export type Organization = {
  id: number;
  name: string;
  description?: string | null;
  website_url?: string | null;
  sector: Option;
  org_type?: Option;
};

export type ReferenceData = {
  sectors: Option[];
  technologies: Option[];
  funding_types: Option[];
  calculation_types: Option[];
  benefit_types: Option[];
  benefit_units: Option[];
  organization_types: Option[];
  countries: Option[];
  organizations: Organization[];
  languages: Option[];
};
