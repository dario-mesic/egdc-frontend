import Link from "next/link";

export default function CaseStudyNotFound() {
  return (
    <main className="min-h-[90vh] ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center">
      <div className="ecl-u-d-flex ecl-u-flex-column ecl-u-justify-content-center ecl-u-align-items-center ecl-u-bg-grey-25 ecl-u-pa-l ecl-u-border-all ecl-u-border-color-grey-50 ecl-u-text-align-center">
        <h1 className="ecl-u-type-heading-2 ecl-u-mb-s">
          Case study not found
        </h1>

        <p className="ecl-u-type-paragraph ecl-u-mb-m">
          This case study doesn’t exist or has been removed.
        </p>

        <Link className="ecl-button ecl-button--primary" href="/case-studies">
          Back to case studies
        </Link>
      </div>
    </main>
  );
}
