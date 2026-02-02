export {};

declare global {
  var ECL:
    | {
        autoInit?: (root?: Element | Document) => void;
      }
    | undefined;

  namespace JSX {
    interface IntrinsicElements {
      "duet-date-picker": any;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "duet-date-picker": any;
      }
    }
  }
}
