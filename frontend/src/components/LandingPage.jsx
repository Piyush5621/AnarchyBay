import { useState, useEffect, useRef } from "react"; // Added useRef here
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/use-auth";
import NavBar from "./NavBar";
import { MagicBento } from "./MagicBento";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MacbookScroll } from "./ui/macbook-scroll";
// Removed conflicting import: import HeroScrollDemo from "./container-scroll-animation-demo"; 
import { 
  CreditCard, 
  Zap, 
  Box, 
  BarChart3, 
  Palette, 
  Rocket, 
  ShieldCheck, 
  Globe, 
  Key,
  Star
} from 'lucide-react';

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
        <MacbookScrollSection />
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
  const features = [
    {
      title: 'Global Payments',
      description: 'Accept payments seamlessly via UPI, Credit Cards, and Net Banking. We handle the currency conversion so you don\'t have to.',
      icon: <CreditCard className="w-6 h-6 text-white" />,
      className: "md:col-span-2", // This card takes up 2 spaces
      color: "bg-blue-500"
    },
    {
      title: 'Instant Delivery',
      description: 'Your customers get their files immediately after payment. 24/7 automation.',
      icon: <Zap className="w-6 h-6 text-white" />,
      className: "md:col-span-1",
      color: "bg-amber-500"
    },
    {
      title: 'Digital Ownership',
      description: 'Secure, encrypted download links. Customers truly own what they buy.',
      icon: <Box className="w-6 h-6 text-white" />,
      className: "md:col-span-1",
      color: "bg-emerald-500"
    },
    {
      title: 'Deep Analytics',
      description: 'Track conversion rates, revenue sources, and customer geography in real-time.',
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      className: "md:col-span-2", // This card takes up 2 spaces
      color: "bg-purple-500"
    },
    {
      title: 'Zero-Code Store',
      description: 'Drag, drop, and sell. Build a high-converting landing page in minutes without writing a single line of code.',
      icon: <Palette className="w-6 h-6 text-white" />,
      className: "md:col-span-1",
      color: "bg-pink-500"
    },
    {
      title: 'Transparent Growth',
      description: 'Start for free. No hidden fees, no monthly subscriptions. We only grow when you grow.',
      icon: <Rocket className="w-6 h-6 text-white" />,
      className: "md:col-span-2", // This card takes up 2 spaces
      color: "bg-indigo-500"
    }
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Background decoration to fix "Khali Khali" feel */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
      
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold text-pink-600 tracking-wide uppercase mb-3">
          Why Choose Us
        </h2>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
          Everything you need to <br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Sell Anything Online
          </span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          From payments to delivery, we handle the boring stuff so you can focus on creating.
        </p>
      </div>

      {/* Placeholder for your Scroll Demo */}
      <div className="mb-24 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
         <HeroScrollDemo />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`group relative p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${feature.className}`}
          >
            {/* Hover Gradient Effect */}
            <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${feature.color}`}></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Optional Arrow indicator */}
              <div className="flex items-center text-sm font-semibold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                Learn more <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


function ProductsSection({ products, navigate }) {
  return (
    <section className="py-20 bg-white border-y-3 border-black">
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

function MacbookScrollSection() {
  return (
    <section className="bg-white">
      <MacbookScroll
        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
        showGradient={false}
        title={
          <span className="font-black">
            Beautiful product pages <br /> that convert visitors to customers
          </span>
        }
      />
    </section>
  );
}

function ContainerScrollSection() {
  return (
    <section className="bg-white isolate">
      <HeroScrollDemo />
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
            { title: "Support", links: [["Help Center", "/help"], ["Contact", "/contact"], ["Terms", "/terms"]] },
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

export function HeroScrollDemo() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1)
      // We want it to finish animating when it's mostly visible
      const visible = Math.min(
        Math.max((windowHeight - rect.top) / (windowHeight + rect.height * 0.5), 0),
        1
      );
      setProgress(visible);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden py-10 perspective-[1200px]"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--pink-200)] rounded-full blur-[100px] opacity-30 -z-10" />

      {/* Animated Container */}
      <div
        className="relative z-10 w-[95%] max-w-5xl"
        style={{
          transform: `rotateX(${25 - progress * 25}deg) scale(${0.85 + progress * 0.15}) translateY(${50 - progress * 50}px)`,
          opacity: 0.6 + progress * 0.4,
          transition: "transform 0.1s ease-out, opacity 0.1s linear",
        }}
      >
        {/* Mock Browser Window - Neo Brutalist Style */}
        <div className="bg-white rounded-xl border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          
          {/* Browser Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--yellow-400)] border-b-4 border-black">
            <div className="flex gap-2">
              <span className="w-4 h-4 rounded-full bg-white border-2 border-black" />
              <span className="w-4 h-4 rounded-full bg-white border-2 border-black opacity-50" />
            </div>
            <div className="flex-1 px-4">
              <div className="w-full max-w-md mx-auto bg-white border-2 border-black rounded-full h-8 flex items-center justify-center px-4 shadow-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2 border border-black"></span>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                  store.anarchybay.com/creator/design-kit
                </span>
              </div>
            </div>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>

          {/* Browser Content (Split Layout) */}
          <div className="grid md:grid-cols-2 h-auto md:h-[450px]">
            
            {/* Left: Product Details */}
            <div className="p-8 md:p-12 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-4 border-black bg-white relative">
               
               {/* Floating Badge */}
               <div className="absolute top-6 left-6 rotate-[-6deg]">
                 <span className="px-4 py-1 bg-[var(--mint)] border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_black]">
                   Best Seller
                 </span>
               </div>

               <div className="mt-8 md:mt-0">
                 <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-5 h-5 fill-[var(--yellow-400)] text-black" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                    ))}
                    <span className="ml-2 font-bold text-sm">(124)</span>
                 </div>

                 <h1 className="text-5xl md:text-6xl font-black mb-4 text-black leading-[0.9]">
                   Supafast <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--pink-500)] to-purple-600">UI Bundle</span>
                 </h1>
                 
                 <p className="text-lg text-gray-600 mb-8 font-medium leading-relaxed max-w-sm">
                   Get 500+ handcrafted components. Ship your next project in hours, not days.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                   <div className="bg-black text-white px-6 py-4 font-black text-2xl border-2 border-black shadow-[4px_4px_0px_var(--pink-500)] -rotate-2">
                     ₹4,999
                   </div>
                   <button className="flex-1 w-full bg-[var(--yellow-400)] text-black py-4 px-8 font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all">
                     Buy Now
                   </button>
                 </div>
               </div>
            </div>

            {/* Right: Abstract Visual */}
            <div className="bg-gray-50 flex items-center justify-center p-12 relative overflow-hidden">
               {/* Pattern Background */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               
               {/* Floating Elements */}
               <div className="relative w-64 h-64">
                  {/* Back Card */}
                  <div className="absolute top-0 right-0 w-full h-full bg-[var(--mint)] border-4 border-black rounded-2xl transform rotate-6 translate-x-4 translate-y-4"></div>
                  
                  {/* Front Card */}
                  <div className="absolute top-0 right-0 w-full h-full bg-[var(--pink-500)] border-4 border-black rounded-2xl shadow-[8px_8px_0px_black] flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                     <div className="text-white text-center">
                        <div className="text-7xl mb-2">⚡</div>
                        <div className="font-black uppercase text-2xl border-b-4 border-white pb-1 inline-block">Pro Pack</div>
                     </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-12 -left-12 text-6xl animate-bounce-subtle">✨</div>
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-black rounded-full border-4 border-white flex items-center justify-center text-white font-black text-xs uppercase animate-spin-slow">
                    <svg viewBox="0 0 100 100" width="80" height="80">
                      <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent"/>
                      <text className="text-[11px] font-bold fill-white uppercase tracking-widest">
                        <textPath href="#curve">
                          Instant Download • 100% Secure •
                        </textPath>
                      </text>
                    </svg>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}