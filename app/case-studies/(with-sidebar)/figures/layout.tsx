export default function FiguresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="ecl-u-pv-l">
      <div>{children}</div>
    </section>
  );
}
