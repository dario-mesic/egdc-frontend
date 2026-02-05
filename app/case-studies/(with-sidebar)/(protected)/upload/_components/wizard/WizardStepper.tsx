export type WizardStepState = "done" | "current" | "upcoming";

export type WizardStep = {
  id: number;
  title: string;
  state: WizardStepState;
};

type WizardStepperProps = Readonly<{
  steps: WizardStep[];
  onStepClick?: (stepId: number) => void;
  maxUnlockedStep?: number;
  className?: string;
}>;

function circleClasses(state: WizardStepState) {
  if (state === "done") {
    return "ecl-u-bg-success-25 ecl-u-border-color-success ecl-u-type-color-success";
  }
  if (state === "current") {
    return "ecl-u-bg-primary-200 ecl-u-border-color-primary ecl-u-type-color-primary";
  }
  return "ecl-u-bg-grey-25 ecl-u-border-color-grey-50 ecl-u-type-color-grey-100";
}

function textClasses(state: WizardStepState) {
  if (state === "done") return "ecl-u-type-color-success";
  if (state === "current") return "ecl-u-type-color-primary";
  return "ecl-u-type-color-grey-100";
}

function barTrackClasses() {
  return "ecl-u-bg-grey-50";
}

function barFillClasses() {
  return "ecl-u-bg-primary";
}

function getCurrentIndex(steps: WizardStep[]) {
  const idx = steps.findIndex((s) => s.state === "current");
  if (idx !== -1) return idx;
  const lastDone = [...steps].reverse().findIndex((s) => s.state === "done");
  if (lastDone !== -1) return steps.length - 1 - lastDone;
  return 0;
}

function getVisualState(
  step: WizardStep,
  maxUnlockedStep?: number,
): WizardStepState {
  const unlocked = (maxUnlockedStep ?? 1) >= step.id;
  if (step.state === "upcoming" && unlocked) return "done";
  return step.state;
}

export default function WizardStepper({
  steps,
  onStepClick,
  maxUnlockedStep,
  className,
}: WizardStepperProps) {
  const clickable = typeof onStepClick === "function";
  const currentIndex = getCurrentIndex(steps);

  return (
    <nav
      aria-label="Progress"
      className={["ecl-u-width-100", className ?? ""].join(" ")}
    >
      <div className="ecl-u-d-none sm:block!">
        <div className="relative" style={{ ["--steps" as any]: steps.length }}>
          <div
            className={[
              "absolute",
              "top-5.5 lg:top-6",
              "h-2 rounded-full",
              barTrackClasses(),
            ].join(" ")}
            style={{
              left: "calc(50% / var(--steps))",
              right: "calc(50% / var(--steps))",
            }}
            aria-hidden="true"
          />

          <div
            className={[
              "absolute",
              "top-5.5 lg:top-6",
              "h-2 rounded-full transition-all duration-300",
              barFillClasses(),
            ].join(" ")}
            style={{
              left: "calc(50% / var(--steps))",
              width:
                steps.length <= 1
                  ? "0%"
                  : `calc((100% - (100% / var(--steps))) * ${
                      currentIndex / (steps.length - 1)
                    })`,
            }}
            aria-hidden="true"
          />

          <ol
            className="relative ecl-u-z-highlight grid items-start"
            style={{
              gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            }}
          >
            {steps.map((step) => {
              const Comp: any = clickable ? "button" : "div";
              const isCurrent = step.state === "current";

              const visualState = getVisualState(step, maxUnlockedStep);

              return (
                <li
                  key={step.id}
                  className="ecl-u-d-flex ecl-u-justify-content-center"
                >
                  <Comp
                    type={clickable ? "button" : undefined}
                    onClick={clickable ? () => onStepClick(step.id) : undefined}
                    className={[
                      "group ecl-u-d-inline-flex ecl-u-flex-column ecl-u-align-items-center",
                      "ecl-u-bg-transparent ecl-u-pa-none",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      textClasses(visualState),
                      clickable ? "hover:opacity-90" : "",
                    ].join(" ")}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span
                      className={[
                        "ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center",
                        "ecl-u-border-all rounded-full",
                        "w-11 h-11 lg:w-12 lg:h-12 shrink-0",
                        circleClasses(visualState),
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <span className="font-semibold">{step.id}</span>
                    </span>

                    <span className="ecl-u-mt-s max-w-40 text-center font-medium leading-tight py-0.5 whitespace-normal">
                      {step.title}
                    </span>
                  </Comp>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <ol className="sm:hidden grid grid-cols-3 gap-x-3 gap-y-4">
        {steps.map((step) => {
          const Comp: any = clickable ? "button" : "div";
          const isCurrent = step.state === "current";
          const visualState = getVisualState(step, maxUnlockedStep);

          return (
            <li
              key={step.id}
              className="ecl-u-d-flex ecl-u-justify-content-center"
            >
              <Comp
                type={clickable ? "button" : undefined}
                onClick={clickable ? () => onStepClick(step.id) : undefined}
                className={[
                  "group ecl-u-d-inline-flex ecl-u-flex-column ecl-u-align-items-center",
                  "ecl-u-bg-transparent ecl-u-pa-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  textClasses(visualState),
                  clickable ? "hover:opacity-90" : "",
                ].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={[
                    "ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center",
                    "ecl-u-border-all rounded-full",
                    "w-10 h-10 shrink-0",
                    circleClasses(visualState),
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span className="font-semibold">{step.id}</span>
                </span>

                <span className="ecl-u-mt-s text-center font-medium leading-tight text-xs px-1 whitespace-normal">
                  {step.title}
                </span>
              </Comp>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
