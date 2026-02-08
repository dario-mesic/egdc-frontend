import SidebarNav from "../_components/SidebarNav";

type CasesLayoutProps = Readonly<{
  children: React.ReactNode;
}>;
export default function CasesLayout({ children }: CasesLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="ecl-row min-[1140px]:min-h-screen ecl-u-pa-xl ecl-u-d-flex ecl-u-align-items-stretch min-[1140px]:flex-nowrap">
        <aside
          className="
            ecl-u-width-100
            min-[1140px]:w-80! min-[1140px]:flex-none
            border-b border-(--ecl-color-primary)
            min-[1140px]:border-b-0 min-[1140px]:border-r ecl-u-ph-m ecl-u-ph-xl-l
          "
        >
          <SidebarNav />
        </aside>
        <main className="ecl-u-width-100 min-[1140px]:flex-1 min-w-0 ecl-u-mt-m ecl-u-mt-xl-none ecl-u-ph-m ecl-u-ph-xl-l relative">
          {children}
        </main>
      </div>
    </div>
  );
}
