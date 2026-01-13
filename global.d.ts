export {};

declare global {
  interface Window {
    ECL?: { autoInit?: (root?: Element | Document) => void };
  }

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
