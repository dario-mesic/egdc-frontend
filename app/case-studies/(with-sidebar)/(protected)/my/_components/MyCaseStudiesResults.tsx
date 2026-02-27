import MyCaseStudiesResultsClient from "./MyCaseStudiesResultsClient";
import type { CaseStudySearchParams } from "../../../../_types/search";

type MyCaseStudiesResultsProps = Readonly<{
  searchParams: CaseStudySearchParams;
}>;

export default function MyCaseStudiesResults(_props: MyCaseStudiesResultsProps) {
  return <MyCaseStudiesResultsClient />;
}
