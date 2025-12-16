import { useState } from 'react';
import { useContact } from '../hooks/use-contact.js';
import { toast } from 'sonner';
import NavBar from './NavBar.jsx';
import { Link } from 'react-router-dom';

export default function Contact() {
  const { submit, isLoading } = useContact();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await submit(payload);
      toast.success('Message sent successfully! We will reply soon 🎉');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact submit error:', err);
      toast.error(
        err?.message || 'Unable to send message. Please try again later.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="pt-20">
        {/* ================= HERO ================= */}
        <section className="py-20 bg-white border-b-3 border-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-block px-4 py-2 bg-[var(--pink-500)] text-white border-3 border-black font-bold text-sm uppercase mb-6 shadow-[3px_3px_0px_var(--black)]">
              Contact AnarchyBay
            </span>

            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Let’s talk 👋
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Questions, feedback, partnerships, or technical issues —
              <span className="font-bold"> we’d love to hear from you.</span>
              <br />
              Real people. Fast replies. No bots.
            </p>
          </div>
        </section>

        {/* ================= TRUST SIGNALS ================= */}
        <section className="py-14 bg-[var(--pink-50)] border-b-3 border-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: '⚡',
                title: 'Fast Replies',
                desc: 'Most messages answered within 24 hours',
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                desc: 'Your data is never shared or sold',
              },
              {
                icon: '🤝',
                title: 'Human Support',
                desc: 'Talk directly to the AnarchyBay team',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_var(--black)]"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-black text-lg mb-2">{item.title}</h3>
                <p className="text-gray-700 font-bold text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= FORM + INFO ================= */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* ---- Contact Form ---- */}
            <div className="bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] p-8">
              <h2 className="text-3xl font-black mb-2">Send us a message</h2>
              <p className="text-gray-700 font-bold mb-6">
                Fill the form below and we’ll get back to you shortly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  className="w-full p-4 border-3 border-black font-bold"
                />

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Your Email"
                  className="w-full p-4 border-3 border-black font-bold"
                />

                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Subject (optional)"
                  className="w-full p-4 border-3 border-black font-bold"
                />

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Your Message"
                  className="w-full p-4 border-3 border-black font-bold resize-none"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-8 py-4 text-lg font-black uppercase bg-[var(--pink-500)] text-white border-3 border-black
                             shadow-[4px_4px_0px_var(--black)] transition-all
                             hover:translate-x-[-2px] hover:translate-y-[-2px]
                             hover:shadow-[6px_6px_0px_var(--black)]
                             disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? '✉️ Sending...' : '✉️ Send Message'}
                </button>
              </form>
            </div>

            {/* ---- Info Cards ---- */}
            <div className="space-y-6">
              <div className="bg-[var(--mint-100)] border-3 border-black p-6 shadow-[4px_4px_0px_var(--black)]">
                <h3 className="font-black mb-2">📧 Email Support</h3>
                <p className="font-bold">support@anarchybay.local</p>
                <p className="text-sm font-bold text-gray-700 mt-2">
                  Best for detailed questions or attachments
                </p>
              </div>

              <div className="bg-[var(--yellow-100)] border-3 border-black p-6 shadow-[4px_4px_0px_var(--black)]">
                <h3 className="font-black mb-2">⏱ Response Time</h3>
                <ul className="text-sm font-bold space-y-1">
                  <li>• Email: within 24 hours</li>
                  <li>• Critical issues: same day</li>
                </ul>
              </div>

              <div className="bg-[var(--pink-100)] border-3 border-black p-6 shadow-[4px_4px_0px_var(--black)]">
                <h3 className="font-black mb-2">📚 Help Center</h3>
                <p className="text-sm font-bold mb-2">
                  Find instant answers to common questions.
                </p>
                <Link
                  to="/help"
                  className="inline-block font-black text-[var(--pink-600)] hover:underline"
                >
                  Browse FAQs →
                </Link>
              </div>

              <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0px_var(--black)]">
                <h3 className="font-black mb-2">🌍 Community</h3>
                <p className="text-sm font-bold text-gray-700">
                  Trusted by creators, developers, and digital sellers across
                  India.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-20 px-4 sm:px-6 bg-[var(--yellow-400)] border-t-3 border-black">
          <div className="max-w-4xl mx-auto text-center border-3 border-black p-10 bg-white shadow-[8px_8px_0px_var(--black)]">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Still need help?
            </h2>
            <p className="text-lg font-bold mb-6">
              Explore guides, policies, and documentation in our Help Center.
            </p>

            <Link
              to="/help"
              className="inline-block px-8 py-4 text-lg font-black uppercase bg-[var(--pink-500)] text-white border-3 border-black
                         shadow-[4px_4px_0px_var(--black)] transition-all
                         hover:translate-x-[-2px] hover:translate-y-[-2px]
                         hover:shadow-[6px_6px_0px_var(--black)]"
            >
              Visit Help Center →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
