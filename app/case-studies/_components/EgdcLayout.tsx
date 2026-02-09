export default function EgdcLayout() {
  return (
    <>
      <header className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <button
              type="button"
              aria-label="Open menu"
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-[#03141f]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            <div className="flex flex-1 justify-center sm:justify-center">
              <img
                src="https://www.greendigitalcoalition.eu/assets/uploads/2022/02/EGDC-Emblem-Colour-on-light-bg-LRES.png"
                alt="European Green Digital Coalition"
                className="h-14 sm:h-22.5 w-auto"
              />
            </div>

            <button
              type="button"
              aria-label="Search"
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-[#03141f]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#999"
                strokeWidth="2"
              >
                <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
          </div>

          <div className="hidden sm:flex relative items-center justify-center pb-6">
            <nav
              className="flex flex-wrap items-center justify-center gap-6 lg:gap-10
                font-sans! font-normal!
                tracking-[1px] uppercase
                text-[#03141f]"
            >
              <a
                href="https://www.greendigitalcoalition.eu/declaration/"
                target="_blank"
                className="text-gray-900"
              >
                About
              </a>
              <a
                href="https://www.greendigitalcoalition.eu/coalition-members/"
                target="_blank"
                className="text-gray-900"
              >
                Members
              </a>
              <a
                href="https://www.greendigitalcoalition.eu/overview-of-egdc-methodologies/"
                target="_blank"
                className="text-[#6aa84f]"
              >
                Methodology
              </a>
              <a
                href="https://www.greendigitalcoalition.eu/news/"
                target="_blank"
                className="text-gray-900"
              >
                News &amp; Events
              </a>
              <a
                href="https://www.greendigitalcoalition.eu/contact/"
                target="_blank"
                className="text-gray-900"
              >
                Contact
              </a>
              <a
                href="https://www.greendigitalcoalition.eu/submit-a-digital-solution/"
                target="_blank"
                className="text-gray-900"
              >
                Contribute to EGDC Activities
              </a>
            </nav>

            <div className="absolute right-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#999"
                strokeWidth="2"
              >
                <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
          </div>

          <div className="sm:hidden pb-4">
            <div className="h-px w-full bg-gray-100" />
          </div>
        </div>
      </header>

      <section className="relative w-full h-35 sm:h-48.75 overflow-hidden">
        <div
          className="
            absolute inset-0 -z-10 bg-cover bg-fixed
            bg-position-[center_35%]
            sm:bg-position-[center_30%]
            md:bg-position-[center_25%]
            lg:bg-position-[center_20%]
          "
          style={{
            backgroundImage:
              "url('https://www.greendigitalcoalition.eu/assets/uploads/2022/02/EGDC-bulb-idea.jpg')",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-black/30" />

        <div className="flex h-full items-center justify-center px-4 text-center">
          <h2
            className="
              font-sans! font-semibold! text-white uppercase leading-none
              text-[24px] sm:text-[44px] md:text-[56px] lg:text-[72px]
              drop-shadow-[0px_0px_44px_rgba(0,0,0,0.61)]
            "
          >
            Case study CALCULATORS
          </h2>
        </div>
      </section>
    </>
  );
}
