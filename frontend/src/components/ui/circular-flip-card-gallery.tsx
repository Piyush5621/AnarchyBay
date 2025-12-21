"use client"

import { useState, useEffect, useRef } from "react"

// A simple utility for conditional class names
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ")

// --- Card Data ---
const cardData = [
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&crop=center",
    title: "Golden Hour",
    description: "Capturing the perfect moment when day meets night",
  },
  {
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=600&fit=crop&crop=center",
    title: "Paradise Found",
    description: "Escape to pristine beaches and crystal waters",
  },
  {
    image: "https://images.unsplash.com/photo-1609172303465-56c68ad89aae?w=400&h=600&fit=crop&crop=center",
    title: "Vintage Memories",
    description: "Preserving moments with timeless elegance",
  },
  {
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=600&fit=crop&crop=center",
    title: "Natural Beauty",
    description: "Finding art in nature's simplest forms",
  },
  {
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=600&fit=crop&crop=center",
    title: "Creative Expression",
    description: "Where imagination meets artistic vision",
  },
  {
    image: "https://images.unsplash.com/photo-1681986367283-c6a5fbf3a7b2?w=400&h=600&fit=crop&crop=center",
    title: "Mountain Majesty",
    description: "Standing tall among nature's giants",
  },
  {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop&crop=center",
    title: "Urban Lines",
    description: "Geometry and light in modern spaces",
  },
  {
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=600&fit=crop&crop=center",
    title: "Warm Moments",
    description: "Finding comfort in life's simple pleasures",
  },
  {
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop&crop=center",
    title: "Cosmic Wonder",
    description: "Exploring the infinite beauty above us",
  },
]

interface FlipCardProps {
  image: string;
  title: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;
}

// --- FlipCard Component ---
function FlipCard({ image, title, description, className, style }: FlipCardProps) {
  return (
    <div
      className={cn(
        "group w-24 h-32 md:w-28 md:h-36 rounded-none [perspective:1000px] transition-transform duration-300 ease-in-out hover:scale-110",
        className,
      )}
      style={style}
    >
      <div className="relative w-full h-full rounded-none shadow-[4px_4px_0px_var(--black)] border-2 border-black transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front side - Image */}
        <div className="absolute inset-0 rounded-none [backface-visibility:hidden]">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover rounded-none"
            onError={(e: any) => {
              e.target.onerror = null
              e.target.src = "https://placehold.co/400x600/ffffff/000000?text=Image"
            }}
          />
        </div>
        {/* Back side - Title and Description */}
        <div className="absolute inset-0 rounded-none bg-yellow-400 border-2 border-black flex flex-col items-center justify-center p-3 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <h3 className="font-black text-xs md:text-sm text-black mb-1 text-balance uppercase">{title}</h3>
          <p className="text-[10px] md:text-xs text-black font-bold leading-snug">{description}</p>
        </div>
      </div>
    </div>
  )
}

// --- Main App Component (Circular Gallery) ---
export default function CircularGallery() {
  const galleryRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0)
  const [rotation, setRotation] = useState(0)

  // Effect for responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (galleryRef.current) {
        const gallerySize = galleryRef.current.offsetWidth
        setSize(gallerySize)
      }
    }

    updateSize() // Initial size

    const resizeObserver = new ResizeObserver(updateSize)
    if (galleryRef.current) {
      resizeObserver.observe(galleryRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  // Effect for animation loop
  useEffect(() => {
    let animationFrameId: number
    const animate = () => {
      setRotation((prevRotation) => prevRotation + 0.00005)
      animationFrameId = requestAnimationFrame(animate)
    }
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  const radius = size * (size < 640 ? 0.35 : 0.38)
  const centerX = size / 2
  const centerY = size / 2

  return (
    <div className="font-sans bg-transparent text-black py-10 flex items-center justify-center p-4 overflow-hidden w-full relative">
         <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
      <div
        ref={galleryRef}
        className="relative w-full max-w-[400px] sm:max-w-[600px] md:max-w-[800px] aspect-square flex items-center justify-center"
      >
        {/* Central text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black text-center text-balance mb-4 leading-[0.85] uppercase italic">
            Visualizing <br/> <span className="text-pink-500 underline decoration-black underline-offset-8">The Shelf</span>
          </h1>
          <p className="text-xs md:text-sm text-black/80 uppercase tracking-[0.5em] font-black bg-yellow-300 px-4 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Hover to Explore
          </p>
        </div>

        {/* Circular arrangement of cards */}
        {size > 0 &&
          [...cardData, ...cardData.slice(0, 3)].map((card, index, arr) => {
            const angle = (index / arr.length) * 2 * Math.PI - Math.PI / 2 + rotation
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)

            return (
              <FlipCard
                key={index}
                {...card}
                className="absolute hover:z-20 scale-110 md:scale-125"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${(angle + Math.PI / 2) * (180 / Math.PI)}deg)`,
                }}
              />
            )
          })}
      </div>
    </div>
  )
}
