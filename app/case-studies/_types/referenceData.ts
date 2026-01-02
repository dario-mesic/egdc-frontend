export type ReferenceOption = {
  code: string;
  label: string;
};

export type ReferenceData = {
  sectors: ReferenceOption[];
  technologies: ReferenceOption[];
  funding_types: ReferenceOption[];
  calculation_types: ReferenceOption[];
  benefit_types: ReferenceOption[];
  benefit_units: ReferenceOption[];
  organization_types: ReferenceOption[];
  countries: ReferenceOption[];
};
