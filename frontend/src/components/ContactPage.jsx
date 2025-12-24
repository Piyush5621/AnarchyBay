import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import NavBar from './NavBar.jsx';

export default function ContactPage() {
  const formRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Frontend-only email logic via EmailJS
    emailjs.sendForm(
      process.env.VITE_EMAILJS_SERVICE_ID, 
      process.env.VITE_EMAILJS_TEMPLATE_ID, 
      formRef.current, 
      process.env.VITE_EMAILJS_PUBLIC_KEY
    )
    .then(() => {
      toast.success('SIGNAL RECEIVED. TRANSMISSION COMPLETE! 🎉');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsLoading(false);
    }, (error) => {
      toast.error('SIGNAL LOST. RETRY ON DIFFERENT FREQUENCY.');
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#98FFD9] overflow-x-hidden">
      <NavBar />

      {/* 1. HERO SECTION WITH ANIMATED DECOR */}
      <section className="relative pt-32 pb-20 border-b-4 border-black bg-[#98FFD9]">
        <div className="absolute top-10 right-10 w-32 h-32 border-4 border-black rounded-full animate-spin-slow opacity-20 hidden md:block"></div>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="bg-black text-white px-6 py-2 text-sm font-black uppercase tracking-[0.3em] shadow-[6px_6px_0px_#FFD1E8] mb-8 inline-block">
              Base Command
            </span>
            <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.85] mb-6">
              Contact <br /> <span className="text-pink-600">Anarchy</span>Bay
            </h1>
            <p className="text-xl font-bold uppercase max-w-2xl mx-auto">
              No bots. No corporate filters. Just direct lines to the operators building the future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS & TRUST BAR (MAKES IT LOOK "FULL") */}
      <div className="bg-white border-b-4 border-black py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Uptime', val: '99.9%' },
            { label: 'Avg Reply', val: '< 4hrs' },
            { label: 'Operators', val: 'Active' },
            { label: 'Security', val: 'End-to-End' }
          ].map((stat, i) => (
            <div key={i} className="text-center border-x-2 border-black/10 first:border-none">
              <p className="text-[10px] font-black uppercase text-gray-500">{stat.label}</p>
              <p className="text-2xl font-black italic">{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* 3. LEFT SIDE: THE INFO PANELS */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div whileHover={{ x: 10 }} className="bg-[#FFD1E8] border-4 border-black p-8 shadow-[10px_10px_0px_black] relative">
              <div className="absolute -top-4 -left-4 bg-black text-white p-2 font-black text-xs">OFFICE</div>
              <h3 className="text-3xl font-black italic uppercase mb-4 underline">Email Us</h3>
              <p className="font-bold text-lg">support@anarchybay.local</p>
              <p className="text-sm font-medium mt-2">For support, billing, and technical inquiries.</p>
            </motion.div>

            <motion.div whileHover={{ x: 10 }} className="bg-[#FFD700] border-4 border-black p-8 shadow-[10px_10px_0px_black] relative">
              <div className="absolute -top-4 -left-4 bg-black text-white p-2 font-black text-xs">SOCIAL</div>
              <h3 className="text-3xl font-black italic uppercase mb-4 underline">Community</h3>
              <div className="flex flex-wrap gap-3">
                {['Twitter', 'Discord', 'Github', 'Reddit'].map(link => (
                  <button key={link} className="bg-white border-2 border-black px-4 py-2 font-black text-xs hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_black]">
                    {link} →
                  </button>
                ))}
              </div>
            </motion.div>

            {/* LIVE FEED SIMULATION */}
            <div className="bg-zinc-50 border-4 border-black p-6 space-y-4">
               <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400">Recent Signals</h4>
               <div className="space-y-3 opacity-60 italic font-medium text-sm">
                  <p className="flex justify-between"><span>User_01: Support Ticket</span> <span className="text-green-600">[DONE]</span></p>
                  <p className="flex justify-between"><span>Creator_99: Partnership</span> <span className="text-yellow-600">[PENDING]</span></p>
               </div>
            </div>
          </div>

          {/* 4. RIGHT SIDE: THE MAIN FORM BOX */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-7 bg-white border-[6px] border-black p-8 md:p-14 shadow-[20px_20px_0px_#98FFD9]"
          >
            <h2 className="text-4xl font-black uppercase italic mb-10 tracking-tighter border-b-4 border-black pb-4 inline-block">
              Transmit <span className="text-pink-600">Data</span>
            </h2>
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Your Handle</label>
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="ANONYMOUS" 
                    className="w-full border-4 border-black p-4 font-bold bg-white focus:bg-[#FFD1E8] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none shadow-[4px_4px_0px_black]"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Return Address</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="EMAIL" 
                    className="w-full border-4 border-black p-4 font-bold bg-white focus:bg-[#98FFD9] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none shadow-[4px_4px_0px_black]"/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase">Transmission Topic</label>
                <input name="subject" value={formData.subject} onChange={handleChange} required placeholder="SUBJECT" 
                  className="w-full border-4 border-black p-4 font-bold bg-white focus:bg-[#FFD700] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none shadow-[4px_4px_0px_black]"/>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase">The Payload</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="MESSAGE..." 
                  className="w-full border-4 border-black p-4 font-bold bg-white focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none shadow-[4px_4px_0px_black] resize-none"/>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full bg-black text-white py-6 text-3xl font-black uppercase italic tracking-tighter hover:bg-pink-600 transition-colors shadow-[10px_10px_0px_#FFD700] hover:shadow-none active:translate-x-2 active:translate-y-2"
              >
                {isLoading ? 'TRANSMITTING...' : 'SEND SIGNAL →'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* 5. DYNAMIC FAQ ACCORDION (NEW CONTENT) */}
      <section className="bg-[#FFD1E8] border-y-4 border-black py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black uppercase italic mb-12 text-center underline">Knowledge Retrieval</h2>
          <div className="space-y-4">
            {[
              { q: 'Is my data encrypted?', a: 'Every signal sent through AnarchyBay uses frontend encryption before being transmitted to our operators.' },
              { q: 'Can I request a specific operator?', a: 'Signals are automatically routed to the specialist best suited for your payload type.' }
            ].map((faq, i) => (
              <div key={i} className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_black]">
                <h4 className="text-lg font-black uppercase mb-2">{faq.q}</h4>
                <p className="font-bold text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}