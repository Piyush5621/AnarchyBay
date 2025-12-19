import { X } from "lucide-react";

export default function HelpDocs({ onClose }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-3xl mx-4 bg-white border-3 border-black shadow-[8px_8px_0px_var(--black)] overflow-hidden animate-spotlight-in max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b-3 border-black px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">How to Use</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-4 text-[var(--pink-600)]">🔍 Basic Search</h3>
            <p className="text-gray-700 mb-3">
              Type anything to search products, sellers, and categories. Press <kbd className="px-2 py-1 bg-gray-100 border-2 border-gray-300 rounded text-xs font-bold">⌘K</kbd> or <kbd className="px-2 py-1 bg-gray-100 border-2 border-gray-300 rounded text-xs font-bold">Ctrl+K</kbd> to open search anywhere.
            </p>
            <div className="bg-[var(--yellow-100)] border-2 border-black p-4 space-y-2">
              <div className="font-bold">Examples:</div>
              <div className="text-sm font-mono space-y-1">
                <div>• <span className="bg-white px-2 py-1 border border-black">design templates</span></div>
                <div>• <span className="bg-white px-2 py-1 border border-black">icons</span></div>
                <div>• <span className="bg-white px-2 py-1 border border-black">productivity tools</span></div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4 text-[var(--pink-600)]">⚡ Search Bangs (Advanced Filters)</h3>
            <p className="text-gray-700 mb-3">
              Use <kbd className="px-2 py-1 bg-gray-100 border-2 border-gray-300 rounded text-xs font-bold">!</kbd> to access powerful search filters called "bangs". Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 border border-gray-300 rounded">!</span> to see all available bangs.
            </p>
            
            <div className="space-y-4">
              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-sm font-bold bg-[var(--pink-500)] text-white border-2 border-black">!c</span>
                  <span className="font-bold">Category Search</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Search within a specific category</p>
                <div className="text-xs font-mono bg-gray-50 p-2 border border-gray-200 rounded space-y-1">
                  <div>!c design templates</div>
                  <div>!c code snippets</div>
                  <div>!c photography</div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-sm font-bold bg-[var(--pink-500)] text-white border-2 border-black">!p</span>
                  <span className="font-bold">Price Filter</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Filter by maximum price</p>
                <div className="text-xs font-mono bg-gray-50 p-2 border border-gray-200 rounded space-y-1">
                  <div>!p 500 design</div>
                  <div>!p 1000 templates</div>
                  <div>!p 100</div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-sm font-bold bg-[var(--pink-500)] text-white border-2 border-black">!s</span>
                  <span className="font-bold">Seller Search</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Search for specific creators and sellers</p>
                <div className="text-xs font-mono bg-gray-50 p-2 border border-gray-200 rounded space-y-1">
                  <div>!s john</div>
                  <div>!s design studio</div>
                  <div>!s creative agency</div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-sm font-bold bg-[var(--pink-500)] text-white border-2 border-black">!new</span>
                  <span className="font-bold">Newest Products</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Show newest products first</p>
                <div className="text-xs font-mono bg-gray-50 p-2 border border-gray-200 rounded space-y-1">
                  <div>!new templates</div>
                  <div>!new icons</div>
                  <div>!new</div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-sm font-bold bg-[var(--pink-500)] text-white border-2 border-black">!top</span>
                  <span className="font-bold">Top Rated</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Show highest rated products</p>
                <div className="text-xs font-mono bg-gray-50 p-2 border border-gray-200 rounded space-y-1">
                  <div>!top design</div>
                  <div>!top code</div>
                  <div>!top</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4 text-[var(--pink-600)]">⌨️ Keyboard Navigation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded font-bold">↑↓</kbd>
                  <span className="text-sm">Navigate results</span>
                </div>
              </div>
              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded font-bold">Enter</kbd>
                  <span className="text-sm">Select item</span>
                </div>
              </div>
              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded font-bold">ESC</kbd>
                  <span className="text-sm">Close search</span>
                </div>
              </div>
              <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-gray-100 border-2 border-gray-300 rounded font-bold">⌘K</kbd>
                  <span className="text-sm">Open search</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4 text-[var(--pink-600)]">💡 Pro Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-[var(--mint)] border-2 border-black p-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-bold mb-1">Combine Filters</div>
                  <div className="text-sm text-gray-700">Use multiple bangs together: <span className="font-mono bg-white px-2 py-1 border border-black">!c design !p 500</span></div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[var(--mint)] border-2 border-black p-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-bold mb-1">Quick Access</div>
                  <div className="text-sm text-gray-700">Use category buttons when search is empty for instant browsing</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[var(--mint)] border-2 border-black p-4">
                <span className="text-2xl">🚀</span>
                <div>
                  <div className="font-bold mb-1">Fast Navigation</div>
                  <div className="text-sm text-gray-700">Press Enter without selecting to search all results for your query</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
