import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    id: "01",
    title: "What is Anarchy Bay?",
    content:
      "Anarchy Bay is a digital marketplace specifically designed for Indian creators to sell their digital assets—templates, code, ebooks, and more—with ease.",
  },
  {
    id: "02",
    title: "How do I start selling?",
    content:
      "Simply create an account, upload your digital product, set your price in INR, and you're ready to share your store link with the world.",
  },
  {
    id: "03",
    title: "What are the fees?",
    content:
      "We believe in your growth. Our free plan has a small 5% transaction fee, while our Pro plan offers 0% transaction fees for a low monthly subscription.",
  },
  {
    id: "04",
    title: "How do payments work?",
    content:
      "We support UPI, credit/debit cards, and net banking. Payments are securely processed and channeled to your account.",
  },
  {
    id: "05",
    title: "What can I sell?",
    content:
      "Anything digital! From Notion templates and UI kits to ebooks and software source code. If it's a file, you can sell it.",
  },
  {
    id: "06",
    title: "How is delivery handled?",
    content:
      "Delivery is fully automated. As soon as the customer completes the payment, they receive an instant download link for the product.",
  },
  {
    id: "07",
    title: "Is there a product limit?",
    content:
      "No. Whether you are on the Free or Pro plan, you can upload and sell unlimited products on your storefront.",
  },
  {
    id: "08",
    title: "Can I use my own domain?",
    content:
      "Yes! Our Pro plan allows you to connect a custom domain to your Anarchy Bay store for a fully branded experience.",
  },
];

export function Accordion05() {
  return (
    <div className="w-full max-w-4xl mx-auto py-20 px-4 text-center">
      <h2 className="text-4xl md:text-6xl font-black uppercase mb-12 tracking-tighter">FAQ</h2>
      <Accordion type="single" collapsible className="w-full border-t-3 border-black text-left">
        {items.map((item) => (
          <AccordionItem value={item.id} key={item.id} className="border-black">
            <AccordionTrigger className="group text-left px-4 md:px-8 text-black/40 duration-300 hover:no-underline cursor-pointer data-[state=open]:text-black hover:text-black">
              <div className="flex flex-1 items-center gap-6 md:gap-12">
                <p className="text-sm md:text-lg font-black">{item.id}</p>
                <h3 className="uppercase text-2xl md:text-5xl font-black tracking-tighter transition-transform duration-300 group-hover:translate-x-2">
                  {item.title}
                </h3>
              </div>
            </AccordionTrigger>

            <AccordionContent className="text-lg md:text-2xl font-bold bg-yellow-400 text-black p-6 md:p-12 border-t-3 border-black">
              <div className="max-w-2xl">
                {item.content}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
