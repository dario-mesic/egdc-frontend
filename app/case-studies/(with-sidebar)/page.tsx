import CaseStudiesPageShell from "../_components/CaseStudiesPageShell";
import CaseStudiesResults from "../_components/CaseStudiesResults";
import type { CaseStudySearchParams } from "../_types/search";

type CaseStudiesProps = Readonly<{
  searchParams: Promise<CaseStudySearchParams>;
}>;

export default function CaseStudies({ searchParams }: CaseStudiesProps) {
  return (
    <CaseStudiesPageShell
      searchParams={searchParams}
      Results={CaseStudiesResults}
    />
  );
}
