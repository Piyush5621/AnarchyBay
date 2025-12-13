import NavBar from './NavBar';

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <NavBar />
      
      <div className="pt-20 px-4 sm:px-6 md:px-8 pb-8 md:pb-12 mx-2 sm:mx-4 md:mx-8 my-4 md:my-8 border-2 md:border-4 border-black">
        <div className="excerpt max-w-none">
          <div className="title__container text-center mb-8 md:mb-16">
            <h1 className="font-['Brush_Script_MT',cursive] text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-normal mt-6 md:mt-12 mb-4">
              Anarchy Bay
            </h1>
            <img 
              className="flower mx-auto mt-4 mb-6 h-32 sm:h-40 md:h-48 lg:h-64 object-contain"
              src="https://raw.githubusercontent.com/melipi/img-repo/main/flower-silhouette.png"
              alt="flower silhouette"
            />
            <h2 className="text-base sm:text-lg md:text-xl leading-6 md:leading-8 italic mt-2 md:mt-4">A marketplace for everyone</h2>
            <h3 className="w-48 sm:w-60 mx-auto my-6 md:my-12 py-2 text-lg sm:text-xl md:text-2xl leading-6 md:leading-8 font-normal italic border-t-[0.15rem] border-b-[0.15rem] border-black">
              Our Story
            </h3>
          </div>

          <div className="lg:columns-[22rem] gap-6">
            <p className="text-justify my-4 leading-6 first-letter:font-['Fleur_De_Leah',cursive] first-letter:text-4xl sm:first-letter:text-5xl first-letter:p-1 first-letter:float-left first-letter:mr-1 first-letter:mt-[-1rem] first-letter:mb-[-0.25rem] text-base sm:text-lg md:text-xl leading-7 md:leading-8 italic mb-6 md:mb-8">
              Welcome to AnarchyBay, where freedom meets commerce.
            </p>

            <p className="text-justify my-4 leading-6 text-sm sm:text-base">
              In a world dominated by gatekeepers and intermediaries, we believe in something different. AnarchyBay is a decentralized marketplace built on the principles of freedom, transparency, and community. Here, anyone can buy and sell without barriers, without excessive fees, and without compromising their autonomy.
            </p>

            <p className="text-justify my-4 leading-6 text-sm sm:text-base">
              Our platform was born from a simple idea: commerce should be free and accessible to all. Whether you're a creator selling digital art, a craftsperson offering handmade goods, or an entrepreneur launching your first product, AnarchyBay provides the tools and freedom you need to thrive. We don't believe in restrictive policies or hidden agendas—just honest, peer-to-peer exchange.
            </p>

            <p className="text-justify my-4 leading-6 text-sm sm:text-base">
              What makes us different? We embrace the chaos and beauty of an open marketplace. No algorithmic manipulation. No preferential treatment. No corporate overlords deciding what you can see, buy, or sell. Just real people connecting with real products and services. Every transaction on AnarchyBay is a vote for a more democratic economy.
            </p>

            <p className="text-justify my-4 leading-6 text-sm sm:text-base">
              Our community is our strength. From tech enthusiasts to vintage collectors, from indie artists to sustainable living advocates—AnarchyBay brings together diverse voices and visions. We celebrate individuality and encourage authentic expression. Whether you're here to discover unique finds or share your creations with the world, you'll find a welcoming space that respects your independence.
            </p>

            <p className="text-justify my-4 leading-6 text-sm sm:text-base">
              Security and privacy are paramount. While we champion freedom, we also protect our users with robust encryption, transparent policies, and user-controlled data. You decide what to share, when to share it, and with whom. Your trust is sacred to us, and we work tirelessly to maintain a safe environment where commerce can flourish organically.
            </p>

            <p className="text-justify my-4 leading-6 text-sm sm:text-base">
              Join us in reimagining what a marketplace can be. Buy freely. Sell fearlessly. Connect authentically. This is AnarchyBay—where your commerce, your rules. Together, we're building an economy that puts power back in the hands of individuals, one transaction at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}