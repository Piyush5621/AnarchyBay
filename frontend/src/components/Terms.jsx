import NavBar from './NavBar.jsx';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="pt-20">
        
        {/* === Hero/Header Section === */}
        <section className="py-16 md:py-24 bg-[var(--pink-100)] border-b-3 border-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-block px-4 py-2 bg-[var(--pink-500)] text-white border-3 border-black font-bold text-sm uppercase mb-6 shadow-[3px_3px_0px_var(--black)]">
              Legal
            </span>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Last Updated: December 12, 2025
              <br />
              Please read these terms carefully before using AnarchyBay.
            </p>
          </div>
        </section>

        {/* === Content Sections === */}
        <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
          
          {/* 1. Acceptance of Terms */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
              <span className="text-4xl text-[var(--yellow-400)]">1.</span> Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed font-medium">
              By accessing or using the AnarchyBay platform, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service. These terms apply to all visitors, users, and others who wish to access or use the Service.
            </p>
          </div>

          {/* 2. User Accounts */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
              <span className="text-4xl text-[var(--yellow-400)]">2.</span> User Accounts
            </h2>
            <p className="text-gray-700 leading-relaxed font-medium mb-4">
              You must be at least 18 years old to create an account. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
            <div className="bg-[var(--mint-100)] border-3 border-black p-4 shadow-[3px_3px_0px_var(--black)]">
              <p className="font-bold text-sm">
                ⚠️ **Note:** You must provide us with accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms.
              </p>
            </div>
          </div>

          {/* 3. Digital Products & Sales */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
              <span className="text-4xl text-[var(--yellow-400)]">3.</span> Digital Products & Sales
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 font-medium">
              <li>**Ownership:** You retain ownership of all digital products you upload and sell.</li>
              <li>**Fees:** AnarchyBay charges a small commission fee on every successful sale (see Pricing page).</li>
              <li>**Refunds:** Due to the nature of digital goods, all sales are generally considered final. Refunds are processed solely at the discretion of the seller or under mandatory Indian consumer protection laws.</li>
            </ul>
          </div>
          
          {/* 4. Governing Law */}
          <div className="mb-12">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
              <span className="text-4xl text-[var(--yellow-400)]">4.</span> Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed font-medium">
              These Terms shall be governed and construed in accordance with the laws of **India**, without regard to its conflict of law provisions.
            </p>
          </div>
        </section>
        
        {/* === CTA Section (Contact Link) === */}
        <section className="py-20 px-4 sm:px-6 bg-[var(--yellow-400)] border-t-3 border-black">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Questions about the Terms?</h2>
            <p className="text-lg mb-6 font-bold">
              If you need clarification, please reach out to our legal team directly.
            </p>
            <a 
              href="/contact" 
              className="inline-block px-8 py-4 text-lg font-black uppercase bg-black text-white border-3 border-black shadow-[4px_4px_0px_var(--white)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--white)] transition-all"
            >
              Contact Legal Team →
            </a>
          </div>
        </section>

      </main>
      <Footer/>
    </div>
  );
}



function Footer() {
  return (
    <footer className="bg-black text-white py-16 border-t-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/favicon_io/android-chrome-192x192.png"
                alt="AnarchyBay Logo"
                className="w-12 h-12 border-3 border-white"
              />
              <span className="font-display text-2xl">AnarchyBay</span>
            </div>
            <p className="text-gray-400">
              The simplest way to sell digital products in India. UPI payments, instant delivery.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: [
                { name: "Features", href: "#" },
                { name: "Pricing", href: "#" },
                { name: "API", href: "#" } // Convert to object
              ]
            },
            {
              title: "Company",
              links: [
                { name: "About", href: "/about" }, // Add /about route
                { name: "Blog", href: "#" },
                { name: "Careers", href: "#" } // Convert to object
              ]
            },
            {
              title: "Support",
              links: [
                { name: "Help Center", href: "/help" },
                { name: "Contact", href: "/contact" },
                { name: "Terms", href: "/term" }
              ]
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-black text-sm uppercase mb-4 text-[var(--yellow-400)]">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[var(--pink-400)] transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">© 2025 AnarchyBay. Made with 💖 in India.</div>
          <div className="flex gap-4">
            {["Twitter", "GitHub", "Discord"].map((social, i) => (
              <a key={i} href="#" className="px-4 py-2 text-sm font-bold uppercase border-2 border-gray-700 hover:border-[var(--pink-500)] hover:text-[var(--pink-400)] transition-all">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}