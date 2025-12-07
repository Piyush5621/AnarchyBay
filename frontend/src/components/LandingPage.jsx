// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import "@/styles/home.css"; // keep your custom animations here
import NavBar from "../components/NavBar";

/**
 * High-quality Landing Page for BitShelf
 * - Role-aware hero (seller vs customer)
 * - Premium cards, gradients, glass blur, subtle motion
 * - Accessible structure and responsive layout
 *
 * Drop into your app and tweak colors/strings as needed.
 */

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleProtectedAction = () => {
    if (!isAuthenticated) navigate("/login");
    else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <NavBar onProtectedClick={() => (isAuthenticated ? navigate("/dashboard") : navigate("/login"))} />

      <main className="pt-20">
        <PremiumHero
          isAuthenticated={isAuthenticated}
          user={user}
          onPrimary={handleProtectedAction}
        />

        <div className="max-w-6xl mx-auto px-6">
          <TrustedBy />
          <FeaturesSection />
          <HowItWorks />
          <ProductCarousel />
          <PricingSection onChoose={handleProtectedAction} />
          <TestimonialsSection />
          <FinalCTABanner onGetStarted={handleProtectedAction} />
        </div>
      </main>

      <footer className="mt-16">
        <Footer />
      </footer>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function PremiumHero({ isAuthenticated, user, onPrimary }) {
  return (
    <header className="relative overflow-hidden">
      {/* Decorative gradient blobs (absolutely positioned) */}
      <GradientBlob className="-left-48 -top-32 scale-125 opacity-30" />
      <GradientBlob className="-right-40 -bottom-40 scale-110 opacity-25" />

      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/6 px-3 py-1 rounded-full backdrop-blur-sm border border-white/6 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2L12 12L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="font-medium">For developers · Built for creators</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Sell code, templates & APIs — <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-indigo-400">built for developers</span>.
            </h1>

            <p className="text-slate-300 max-w-xl">
              BitShelf helps you package, license, and sell digital developer products with instant delivery, license management, and smooth Indian payments.
              {isAuthenticated && user?.name ? <span> Welcome back, <strong>{user.name}</strong> 👋</span> : null}
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={onPrimary}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-lg transform hover:-translate-y-0.5 transition"
                aria-label="Get started"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started — It's Free"}
                <svg className="w-4 h-4 opacity-90" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              <a
                href="#features"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Explore features →
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
              <span>Instant Delivery</span>
              <span className="opacity-50">•</span>
              <span>License Keys</span>
              <span className="opacity-50">•</span>
              <span>INR Payments</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-white/4 border border-white/6 p-6 shadow-xl backdrop-blur-lg transform hover:scale-[1.01] transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AvatarPlaceholder />
                  <div>
                    <div className="font-semibold">BitShelf Store</div>
                    <div className="text-xs text-slate-300">by You • Developer Tools</div>
                  </div>
                </div>

                <div className="text-sm text-slate-300">Live</div>
              </div>

              <div className="h-48 bg-linear-to-br from-indigo-800/40 to-cyan-800/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl">🧰</div>
                  <div className="mt-3 text-slate-200 font-medium">Starter kit — API + CLI</div>
                  <div className="mt-2 text-sm text-slate-300">₹299 • License & Instant download</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 rounded-lg bg-white/6 border border-white/8 hover:bg-white/8 transition">Preview</button>
                <button className="px-4 py-2 rounded-lg bg-linear-to-r from-indigo-500 to-cyan-400 text-white">Buy</button>
              </div>
            </div>

            {/* small badges under the demo */}
            <div className="mt-4 flex gap-3 text-xs text-slate-300">
              <div className="bg-white/4 px-3 py-1 rounded-full">UPI • Razorpay</div>
              <div className="bg-white/4 px-3 py-1 rounded-full">Auto-delivery</div>
              <div className="bg-white/4 px-3 py-1 rounded-full">License keys</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- small decorative components ---------- */
function GradientBlob({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none blur-3xl absolute w-80 h-80 rounded-full bg-linear-to-tr from-indigo-600 via-cyan-400 to-pink-500 ${className}`}
      style={{ filter: "blur(60px)" }}
    />
  );
}

function AvatarPlaceholder() {
  return (
    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
      BS
    </div>
  );
}

/* ---------------- Trusted By ---------------- */
function TrustedBy() {
  return (
    <section className="mt-6 mb-10 flex items-center justify-between px-2">
      <div className="text-slate-300 text-sm">Trusted by indie devs & small teams</div>
      <div className="flex gap-6 items-center text-slate-300 opacity-80">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */
function FeaturesSection() {
  const features = [
    { title: "Instant Delivery", desc: "Auto-generated download links & license keys.", icon: "🚀" },
    { title: "Indian Payments", desc: "UPI, Razorpay & INR billing built-in.", icon: "💸" },
    { title: "Versioning", desc: "Release version control for your products.", icon: "🔁" },
    { title: "License Management", desc: "Issue & verify license keys automatically.", icon: "🔐" },
    { title: "Analytics", desc: "Simple metrics: sales, downloads, revenue.", icon: "📊" },
    { title: "Developer-first", desc: "CLI, API products, GitHub sync & webhooks.", icon: "🛠️" },
  ];

  return (
    <section id="features" className="py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Features built for creators</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl p-6 bg-white/3 border border-white/6 backdrop-blur-sm">
            <div className="text-3xl mb-3">{f.icon}</div>
            <div className="font-semibold">{f.title}</div>
            <div className="mt-2 text-sm text-slate-300">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  const steps = [
    { title: "Create a product", desc: "Upload code, attach license & set pricing.", idx: 1 },
    { title: "Publish & share", desc: "Instant store page & shareable links.", idx: 2 },
    { title: "Deliver & earn", desc: "Auto-delivery, payouts, and analytics.", idx: 3 },
  ];

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6">How it works</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.title} className="p-6 rounded-2xl bg-linear-to-b from-white/3 to-white/2 border border-white/6">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-semibold mb-4">{s.idx}</div>
            <div className="font-semibold">{s.title}</div>
            <div className="mt-2 text-sm text-slate-300">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Product Carousel (simple) ---------------- */
function ProductCarousel() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Trending products</h2>

      <div className="overflow-x-auto -mx-6 py-4">
        <div className="flex gap-6 px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[18rem] bg-white/4 p-5 rounded-2xl border border-white/6">
              <div className="h-36 rounded-lg flex items-center justify-center bg-linear-to-br from-indigo-800/30 to-cyan-800/20">
                <span className="text-4xl">📦</span>
              </div>
              <div className="mt-4">
                <div className="font-semibold">Product {i + 1}</div>
                <div className="text-sm text-slate-300 mt-1">Developer tool + sample project</div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-indigo-300 font-semibold">₹{199 + i * 50}</div>
                  <button className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm">Buy</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
function PricingSection({ onChoose }) {
  const plans = [
    { title: "Starter", price: "Free", features: ["Single product", "Community support"], highlight: false },
    { title: "Pro", price: "₹499/mo", features: ["Unlimited products", "Priority support", "Analytics"], highlight: true },
    { title: "Team", price: "Contact", features: ["Team seats", "Custom SLA", "Enterprise features"], highlight: false },
  ];

  return (
    <section id="pricing" className="py-12">
      <h2 className="text-2xl font-bold mb-6">Pricing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.title}
            className={`rounded-2xl p-6 ${p.highlight ? "bg-indigo-600 text-white shadow-2xl" : "bg-white/4 border border-white/6"}`}
          >
            <div className="font-semibold text-lg">{p.title}</div>
            <div className="text-2xl font-bold mt-2">{p.price}</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {p.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <button onClick={onChoose} className={`mt-6 px-4 py-2 rounded-lg ${p.highlight ? "bg-white text-indigo-700" : "bg-indigo-500 text-white"}`}>Choose</button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function TestimonialsSection() {
  const reviews = [
    { name: "Ankit", title: "Fullstack Dev", text: "Made my first sale in 24 hours — payouts were smooth." },
    { name: "Rekha", title: "UI Designer", text: "Product pages look polished and conversions improved." },
    { name: "Sahil", title: "API Dev", text: "License key automation saved me time." },
  ];

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Creators love BitShelf</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div key={r.name} className="p-6 rounded-2xl bg-white/4 border border-white/6">
            <div className="text-slate-200">“{r.text}”</div>
            <div className="mt-4 font-semibold">{r.name}</div>
            <div className="text-sm text-slate-300">{r.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCTABanner({ onGetStarted }) {
  return (
    <section className="mt-16 mb-12 p-8 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-500 text-white text-center">
      <h3 className="text-2xl font-bold">Ready to sell your first product?</h3>
      <p className="mt-2 text-sm opacity-90">Sign up and start selling to developers worldwide in minutes.</p>
      <div className="mt-4 flex justify-center gap-4">
        <button onClick={onGetStarted} className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold">Get started — Free</button>
        <a className="px-6 py-3 rounded-xl border border-white/30" href="#pricing">See plans</a>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/6 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-xl font-bold">BitShelf</div>
          <div className="mt-2 text-slate-300">Sell digital products to developers. Instant delivery • License keys • INR payouts</div>
        </div>

        <div>
          <div className="font-semibold text-slate-200">Company</div>
          <ul className="mt-3 space-y-2 text-slate-400 text-sm">
            <li>About</li>
            <li>Careers</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-slate-200">Contact</div>
          <div className="mt-3 text-slate-400 text-sm">hello@bitshelf.example</div>
        </div>
      </div>
    </footer>
  );
}
