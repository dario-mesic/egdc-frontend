export type FacetItem = {
  code: string;
  count: number;
};

export type SearchFacets = {
  sectors: FacetItem[];
  technologies: FacetItem[];
  funding_types: FacetItem[];
  calculation_types: FacetItem[];
  countries: FacetItem[];
  organization_types: FacetItem[];
  benefit_units: FacetItem[];
  benefit_types: FacetItem[];
};
