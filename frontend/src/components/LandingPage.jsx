import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { MagicBento } from "./MagicBento";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { CreditCard, Zap, Key, BarChart3, Palette, Rocket } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/products/list`)
      .then(res => res.json())
      .then(data => setProducts(data.products?.slice(0, 6) || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-20">
        <HeroSection navigate={navigate} isAuthenticated={isAuthenticated} />
        <MarqueeSection />
        <FeaturesSection />
        <ProductsSection products={products} navigate={navigate} />
        <HowItWorksSection />
        <PricingSection navigate={navigate} isAuthenticated={isAuthenticated} />
        <CTASection navigate={navigate} isAuthenticated={isAuthenticated} />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection({ navigate, isAuthenticated }) {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <div className="absolute top-20 right-10 w-32 h-32 bg-[var(--pink-300)] border-3 border-black rotate-12 animate-float hidden lg:block" />
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-[var(--yellow-400)] border-3 border-black -rotate-6 animate-float hidden lg:block" style={{ animationDelay: "1s" }} />
      <div className="absolute top-40 left-1/4 w-16 h-16 bg-[var(--mint)] border-3 border-black rotate-45 animate-bounce-subtle hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--yellow-400)] border-3 border-black shadow-[4px_4px_0px_var(--black)]">
              <span className="w-2 h-2 bg-[var(--pink-500)] rounded-full animate-pulse" />
              <span className="font-bold text-sm uppercase">Built for Indian Creators</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
              Sell your
              <span className="block text-[var(--pink-500)]">Digital Products</span>
              <span className="block">in Minutes</span>
            </h1>

            <p className="text-xl text-gray-700 max-w-lg leading-relaxed">
              The simplest way to sell templates, code, ebooks & digital assets. 
              <span className="font-bold"> UPI payments, instant delivery, zero hassle.</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
                className="px-8 py-4 text-lg font-black uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0px_var(--black)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_var(--black)] transition-all"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Selling Free"}
              </button>
              <button
                onClick={() => navigate("/browse")}
                className="px-8 py-4 text-lg font-black uppercase bg-white border-3 border-black shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0px_var(--black)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_var(--black)] transition-all"
              >
                Browse Products
              </button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              {["UPI & Cards", "Instant Delivery", "INR Pricing"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[var(--mint)] border-2 border-black flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-bold text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-6 rotate-2 hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-[var(--pink-400)] border-2 border-black" />
                  <div className="w-4 h-4 rounded-full bg-[var(--yellow-400)] border-2 border-black" />
                  <div className="w-4 h-4 rounded-full bg-[var(--mint)] border-2 border-black" />
                </div>
                <span className="text-xs font-bold uppercase text-gray-500">AnarchyBay Store</span>
              </div>
              
              <div className="aspect-video bg-[var(--pink-100)] border-3 border-black flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-6xl mb-2">🎨</div>
                  <div className="font-black text-lg">UI Kit Pro</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-2xl">₹2,499</div>
                  <div className="text-sm text-gray-600">by @designer</div>
                </div>
                <button className="px-6 py-3 font-bold uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[4px_4px_0px_var(--black)]">
                  Buy Now
                </button>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-[var(--yellow-400)] border-3 border-black p-4 shadow-[4px_4px_0px_var(--black)] rotate-[-8deg]">
              <div className="font-black text-sm">SOLD!</div>
              <div className="font-bold text-2xl">₹47,500</div>
              <div className="text-xs">this month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeSection() {
  const items = ["TEMPLATES", "EBOOKS", "CODE", "DESIGNS", "PRESETS", "COURSES", "ASSETS", "PLUGINS"];
  
  return (
    <div className="bg-[var(--pink-500)] border-y-3 border-black py-4 overflow-hidden">
      <div className="flex animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-8 mx-8">
            <span className="text-white font-black text-2xl uppercase whitespace-nowrap">{item}</span>
            <span className="w-3 h-3 bg-white rotate-45" />
          </span>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const cardData = [
    {
      title: 'UPI & Cards',
      description: 'Accept payments via UPI, cards, and net banking. INR pricing built-in.',
      icon: <CreditCard className="w-8 h-8" />
    },
    {
      title: 'Instant Delivery',
      description: 'Automatic file delivery. Customers get access immediately after payment.',
      icon: <Zap className="w-8 h-8" />
    },
    {
      title: 'Permanent Ownership',
      description: 'Instant download access. Customers own their purchase forever.',
      icon: <Key className="w-8 h-8" />
    },
    {
      title: 'Analytics',
      description: 'Track sales, revenue, and customer insights in real-time.',
      icon: <BarChart3 className="w-8 h-8" />
    },
    {
      title: 'Custom Storefront',
      description: 'Beautiful product pages that convert. No coding required.',
      icon: <Palette className="w-8 h-8" />
    },
    {
      title: 'Zero Fees',
      description: 'Start free. Only pay when you make sales. No hidden charges.',
      icon: <Rocket className="w-8 h-8" />
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-2 bg-[var(--pink-200)] border-3 border-black font-bold text-sm uppercase mb-4">Features</span>
        <h2 className="text-4xl md:text-5xl font-black">Everything you need to sell</h2>
      </div>

      <div className="card-grid bento-section">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="magic-bento-card magic-bento-card--text-autohide magic-bento-card--border-glow particle-container relative group"
          >
            <div className="magic-bento-card__header relative z-10">
              <div className="magic-bento-card__label group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out">
                {card.icon}
              </div>
            </div>
            <div className="magic-bento-card__content relative z-10">
              <h2 className="magic-bento-card__title">{card.title}</h2>
              <p className="magic-bento-card__description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsSection({ products, navigate }) {
  return (
    <section className="py-20 bg-[var(--pink-100)] border-y-3 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-block px-4 py-2 bg-white border-3 border-black font-bold text-sm uppercase mb-4">Marketplace</span>
            <h2 className="text-4xl md:text-5xl font-black">Featured Products</h2>
          </div>
          <button
            onClick={() => navigate("/browse")}
            className="px-6 py-3 font-bold uppercase bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
          >
            View All →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] cursor-pointer hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_var(--black)] transition-all"
            >
              <div className="aspect-[4/3] bg-[var(--pink-50)] border-b-3 border-black flex items-center justify-center overflow-hidden">
                {product.thumbnail_url ? (
                  <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">📦</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {product.category?.slice(0, 2).map((cat, j) => (
                    <span key={j} className="px-2 py-1 text-xs font-bold uppercase bg-[var(--mint)] border-2 border-black">
                      {cat}
                    </span>
                  ))}
                </div>
                <h3 className="font-black text-lg mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xl text-[var(--pink-600)]">
                    {product.currency === 'INR' ? '₹' : '$'}{product.price}
                  </span>
                  <button className="px-4 py-2 text-sm font-bold uppercase bg-[var(--pink-500)] text-white border-2 border-black">
                    View
                  </button>
                </div>
              </div>
            </div>
          )) : (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border-3 border-black shadow-[4px_4px_0px_var(--black)] animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 border-b-3 border-black" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 w-1/3" />
                  <div className="h-6 bg-gray-200 w-3/4" />
                  <div className="h-4 bg-gray-200 w-full" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
          You know all those great ideas you have?
        </h2>
      </div>

      <div className="relative max-w-5xl mx-auto flex items-center justify-center">
        <img 
          src="/howworks.png" 
          alt="How BitShelf Works" 
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(8px 8px 0px rgba(0, 0, 0, 0.1))' }}
        />
      </div>

      <div className="mt-16 grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[
          { title: "The Gumroad Way", desc: "Simple, powerful tools to sell your ideas", color: "var(--yellow-400)" },
          { title: "Start Small", desc: "Launch in minutes, not months", color: "var(--pink-400)" },
          { title: "Learn Quickly", desc: "Real feedback from real customers", color: "var(--purple)" },
          { title: "Get Better Together", desc: "Iterate and improve your product", color: "var(--mint)" },
        ].map((item, i) => (
          <div key={i} className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_var(--black)]">
            <div 
              className="w-full h-2 mb-4" 
              style={{ background: item.color }}
            />
            <h3 className="font-black text-xl mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection({ navigate, isAuthenticated }) {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[var(--pink-500)] border-3 border-white font-bold text-sm uppercase mb-4">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-black">Start free, scale as you grow</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white text-black border-3 border-white p-8">
            <div className="font-black text-sm uppercase text-[var(--pink-500)] mb-2">Free Forever</div>
            <div className="font-black text-5xl mb-4">₹0</div>
            <ul className="space-y-3 mb-8">
              {["Unlimited products", "UPI & Card payments", "Instant delivery", "Basic analytics", "5% transaction fee"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[var(--mint)] border-2 border-black flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(isAuthenticated ? "/create-product" : "/signup")}
              className="w-full py-4 font-black uppercase bg-black text-white border-3 border-black shadow-[4px_4px_0px_var(--pink-500)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--pink-500)] transition-all"
            >
              Get Started
            </button>
          </div>

          <div className="bg-[var(--pink-500)] text-white border-3 border-white p-8 relative">
            <div className="absolute -top-4 -right-4 px-4 py-2 bg-[var(--yellow-400)] text-black border-3 border-black font-bold text-sm uppercase rotate-3">
              Popular
            </div>
            <div className="font-black text-sm uppercase text-[var(--pink-100)] mb-2">Pro</div>
            <div className="font-black text-5xl mb-4">₹999<span className="text-xl">/mo</span></div>
            <ul className="space-y-3 mb-8">
              {["Everything in Free", "0% transaction fee", "Priority support", "Custom domain", "Advanced analytics", "Team collaboration"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(isAuthenticated ? "/create-product" : "/signup")}
              className="w-full py-4 font-black uppercase bg-white text-[var(--pink-600)] border-3 border-black shadow-[4px_4px_0px_var(--black)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--black)] transition-all"
            >
              Go Pro
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ navigate, isAuthenticated }) {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-[var(--yellow-400)] border-3 border-black p-8 md:p-12 shadow-[8px_8px_0px_var(--black)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--pink-400)] border-l-3 border-b-3 border-black -translate-y-1/2 translate-x-1/2 rotate-45" />
        
        <div className="relative text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to start selling?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of Indian creators selling their digital products. It takes less than 2 minutes to get started.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? "/create-product" : "/signup")}
            className="px-10 py-5 text-xl font-black uppercase bg-[var(--pink-500)] text-white border-3 border-black shadow-[6px_6px_0px_var(--black)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0px_var(--black)] transition-all"
          >
            Create Your First Product →
          </button>
        </div>
      </div>
    </section>
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
            { title: "Product", links: [["Features", "#"], ["Pricing", "#"], ["API", "#"]] },
            { title: "Company", links: [["About", "/about"], ["Blog", "#"], ["Careers", "#"]] },
            { title: "Support", links: [["Help Center", "#"], ["Contact", "#"], ["Terms", "#"]] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-black text-sm uppercase mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href], j) => (
                  <li key={j}>
                    <Link to={href} className="text-gray-400 hover:text-[var(--pink-400)] transition-colors">{label}</Link>
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