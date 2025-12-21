import React, { useState } from 'react';
import { Check, Star, Shield, Zap, Lock, Bell, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import NavBar from './NavBar.jsx';

export default function ProPlanComingSoon() {
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    // Simulation of API call
    console.log("User added to waitlist:", email);
    
    setNotified(true);
    toast.success("You're on the list! We'll notify you when Pro launches. 🚀");
    setEmail('');
  };

  const proFeatures = [
    { 
      icon: <Zap className="w-6 h-6" />, 
      title: "0% Transaction Fee", 
      desc: "Keep 100% of what you earn. No hidden cuts." 
    },
    { 
      icon: <Shield className="w-6 h-6" />, 
      title: "Priority Support", 
      desc: "Jump the queue with 24/7 dedicated assistance." 
    },
    { 
      icon: <Star className="w-6 h-6" />, 
      title: "Custom Domain", 
      desc: "Remove 'anarchybay' from your URL. Your brand, your rules." 
    },
    { 
      icon: <TrendingUp className="w-6 h-6" />, 
      title: "Advanced Analytics", 
      desc: "Deep dive into visitor behavior and sales trends." 
    },
    { 
      icon: <Users className="w-6 h-6" />, 
      title: "Team Collaboration", 
      desc: "Invite staff and manage permissions securely." 
    },
    { 
      icon: <Check className="w-6 h-6" />, 
      title: "Verified Badge", 
      desc: "Build instant trust with the blue checkmark." 
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-20">
        {/* ================= HERO SECTION ================= */}
        <section className="py-20 border-b-3 border-black bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text & Form */}
            <div>
              <span className="inline-block px-4 py-2 bg-[var(--yellow-400)] text-black border-3 border-black font-black text-sm uppercase mb-6 shadow-[4px_4px_0px_var(--black)] rotate-[-2deg]">
                Coming Soon
              </span>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Go <span className="bg-[var(--pink-500)] text-white px-2">PRO</span>.
                <br />
                Scale Faster.
              </h1>

              <p className="text-xl text-gray-800 font-bold mb-8 leading-relaxed max-w-md">
                We are building the ultimate toolkit for serious sellers. 
                Zero fees, custom branding, and powerful insights are just around the corner.
              </p>

              {/* Waitlist Form */}
              {!notified ? (
                <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-4 max-w-md">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-4 py-3 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-[var(--yellow-200)]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-black text-white font-black uppercase border-3 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_var(--black)] flex items-center justify-center gap-2"
                  >
                    <Bell className="w-5 h-5" />
                    Notify Me
                  </button>
                </form>
              ) : (
                <div className="p-4 border-3 border-black bg-[var(--green-100)] shadow-[4px_4px_0px_var(--black)] flex items-center gap-4 max-w-md">
                  <div className="bg-black text-white p-2 rounded-full">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">You're on the list!</h3>
                    <p className="text-sm font-bold text-gray-700">We'll email you when Pro launches.</p>
                  </div>
                </div>
              )}
              
              <p className="mt-4 text-sm font-bold text-gray-500 flex items-center gap-2">
                <Lock className="w-4 h-4" /> No spam. Unsubscribe anytime.
              </p>
            </div>

            {/* Right: The "Pro Card" Visual */}
            <div className="relative group perspective-1000">
              {/* Floating Elements */}
              <div className="absolute -top-10 -right-10 bg-[var(--mint-300)] border-3 border-black p-4 shadow-[4px_4px_0px_var(--black)] z-20 rotate-12 hidden md:block">
                <span className="font-black text-xl">🚀 Launching Q4</span>
              </div>

              {/* The Card */}
              <div className="bg-white border-3 border-black p-8 shadow-[12px_12px_0px_var(--black)] relative overflow-hidden transition-transform group-hover:translate-y-[-5px]">
                {/* Decorative Ribbon */}
                <div className="absolute top-6 -right-12 bg-[var(--pink-500)] text-white text-xs font-black px-12 py-2 rotate-45 border-y-2 border-black">
                  EARLY ACCESS
                </div>

                <div className="mb-8 text-center border-b-3 border-black pb-6 border-dashed">
                  <h2 className="text-3xl font-black uppercase mb-2">Pro Plan</h2>
                  <div className="flex justify-center items-baseline gap-1">
                    <span className="text-6xl font-black">₹999</span>
                    <span className="text-xl font-bold text-gray-500">/mo</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center gap-3 font-bold text-gray-700">
                     <Check className="w-6 h-6 text-[var(--green-600)] stroke-[3]" />
                     <span>Everything in Free</span>
                   </div>
                   <div className="flex items-center gap-3 font-bold text-gray-700">
                     <Check className="w-6 h-6 text-[var(--green-600)] stroke-[3]" />
                     <span>0% Transaction Fees</span>
                   </div>
                   <div className="flex items-center gap-3 font-bold text-gray-700">
                     <Check className="w-6 h-6 text-[var(--green-600)] stroke-[3]" />
                     <span>Custom Domain</span>
                   </div>
                   <div className="flex items-center gap-3 font-bold text-gray-700">
                     <Check className="w-6 h-6 text-[var(--green-600)] stroke-[3]" />
                     <span>Priority Support</span>
                   </div>
                </div>

                <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-black uppercase border-3 border-gray-300 cursor-not-allowed flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Currently Closed
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ================= FEATURES GRID ================= */}
        <section className="py-20 bg-[var(--pink-50)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">Why Go Pro?</h2>
              <p className="text-xl font-bold text-gray-600">Unlock the tools you need to build an empire.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {proFeatures.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border-3 border-black p-8 shadow-[8px_8px_0px_var(--black)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_var(--black)] transition-all"
                >
                  <div className="w-12 h-12 bg-[var(--yellow-400)] border-3 border-black flex items-center justify-center mb-6 rounded-none shadow-[4px_4px_0px_var(--black)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};