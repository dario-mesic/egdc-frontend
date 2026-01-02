export default function LoadingIndicator() {
  return (
    <div
      className="ecl-spinner ecl-spinner--primary ecl-spinner--l ecl-spinner--centered ecl-spinner--visible top-1/2! -translate-y-1/2!"
      role="alert"
      aria-live="polite"
    >
      <svg
        className="ecl-spinner__loader"
        viewBox="25 25 50 50"
        aria-hidden="true"
      >
        <circle
          className="ecl-spinner__circle"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          strokeWidth="4"
          strokeMiterlimit="10"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="ecl-spinner__text">Loading</div>
    </div>
  );
}
