export default function EgdcLayout() {
  return (
    <>
      {" "}
      <header className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Logo row */}
          <div className="flex justify-center py-6">
            <img
              src="https://www.greendigitalcoalition.eu/assets/uploads/2022/02/EGDC-Emblem-Colour-on-light-bg-LRES.png"
              alt="European Green Digital Coalition"
              className="h-[90px] w-auto"
            />
          </div>

          {/* Navigation row */}
          <div className="relative flex items-center justify-center pb-6">
            {/* Navigation */}
            <nav
              className="flex flex-wrap items-center justify-center gap-10
                font-sans! font-normal!
                tracking-[1px] uppercase
                text-[#03141f]"
            >
              <a href="#" className="text-gray-900">
                About
              </a>
              <a href="#" className="text-gray-900">
                Members
              </a>
              <a href="#" className="text-[#6aa84f]">
                Methodology
              </a>
              <a href="#" className="text-gray-900">
                News &amp; Events
              </a>
              <a href="#" className="text-gray-900">
                Contact
              </a>
              <a href="#" className="text-gray-900">
                Contribute to EGDC Activities
              </a>
            </nav>

            {/* Search icon (right aligned) */}
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
        </div>
      </header>
      <section className="relative w-full h-[195px] overflow-hidden">
        <div
          className="
          absolute inset-0 -z-10 bg-cover bg-fixed
          bg-[position:center_35%]
          sm:bg-[position:center_30%]
          md:bg-[position:center_25%]
          lg:bg-[position:center_20%]
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
            text-[32px] sm:text-[44px] md:text-[56px] lg:text-[72px]
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
