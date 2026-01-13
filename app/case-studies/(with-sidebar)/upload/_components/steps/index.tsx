import Step1Basic from "./Step1Basic";
import Step2Categorization from "./Step2Categorization";
import Step3Location from "./Step3Location";
import Step4Organizations from "./Step4Organizations";
import Step5Benefits from "./Step5Benefits";
import Step6Files from "./Step6Files";

export const uploadStepDefs = [
  { id: 1, title: "Basic" },
  { id: 2, title: "Categorization" },
  { id: 3, title: "Location" },
  { id: 4, title: "Organizations" },
  { id: 5, title: "Benefits" },
  { id: 6, title: "Files" },
] as const;

export const uploadStepCount = uploadStepDefs.length;

export const uploadStepComponents = {
  1: Step1Basic,
  2: Step2Categorization,
  3: Step3Location,
  4: Step4Organizations,
  5: Step5Benefits,
  6: Step6Files,
} as const;
