type FiguresLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function FiguresLayout({ children }: FiguresLayoutProps) {
  return (
    <section className="ecl-u-pv-l">
      <div>{children}</div>
    </section>
  );
}
