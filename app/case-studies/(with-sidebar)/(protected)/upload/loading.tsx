import LoadingIndicator from "../../../_components/LoadingIndicator";
export default function Loading() {
  return (
    <div className="ecl-u-d-flex ecl-u-flex-column h-[calc(100vh-200px)] min-h-100">
      <div className="flex-1 min-h-0 relative">
        <LoadingIndicator />
      </div>
    </div>
  );
}
