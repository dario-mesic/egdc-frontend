"use client";

import { useMemo } from "react";
import WizardStepper from "./WizardStepper";

export type WizardStepDef = {
  id: number;
  title: string;
  description?: string;
};

type WizardShellProps = Readonly<{
  steps: WizardStepDef[];
  activeStep: number;
  onStepChange: (id: number) => void;
  maxUnlockedStep?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}>;

export default function WizardShell({
  steps,
  activeStep,
  onStepChange,
  maxUnlockedStep = activeStep,
  children,
  footer,
}: WizardShellProps) {
  const stepperSteps = useMemo(
    () =>
      steps.map((s) => {
        let state: "done" | "current" | "upcoming" = "upcoming";

        if (s.id < activeStep) state = "done";
        else if (s.id === activeStep) state = "current";

        return {
          ...s,
          state,
          isUnlocked: s.id <= maxUnlockedStep,
        };
      }),
    [steps, activeStep, maxUnlockedStep],
  );

  const canGoTo = (id: number) => id <= maxUnlockedStep;

  return (
    <div className="ecl-row ecl-u-mt-l">
      <div className="ecl-col-12">
        <div className="ecl-u-mb-l">
          <WizardStepper
            steps={stepperSteps as any}
            maxUnlockedStep={maxUnlockedStep}
            onStepClick={(id) => {
              if (canGoTo(id)) onStepChange(id);
            }}
          />
        </div>
      </div>

      <div className="ecl-col-12">
        <div className="ecl-u-bg-grey-25 ecl-u-pa-l ecl-u-border-all ecl-u-border-color-grey-50 ecl-u-d-flex ecl-u-flex-column h-[calc(100vh-200px)] min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto pr-2">{children}</div>
          {footer ? (
            <div className="ecl-u-mt-l ecl-u-pt-m border-t border-black/10">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
