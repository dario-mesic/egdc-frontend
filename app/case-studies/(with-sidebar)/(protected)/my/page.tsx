import CaseStudiesPageShell from "../../../_components/CaseStudiesPageShell";
import MyCaseStudiesResults from "./_components/MyCaseStudiesResults";
import type { CaseStudySearchParams } from "../../../_types/search";

type MyCaseStudiesProps = Readonly<{
  searchParams: Promise<CaseStudySearchParams>;
}>;

export default function MyCaseStudies(props: MyCaseStudiesProps) {
  return (
    <CaseStudiesPageShell
      searchParams={props.searchParams}
      Results={MyCaseStudiesResults}
    />
  );
}
