import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Package,
  User,
  Search,
  TrendingUp,
  Star,
  Tag
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompactUserBadges } from './role-badges';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SVGFilter = () => {
  return (
    <svg width="0" height="0">
      <filter id="blob">
        <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
        <feColorMatrix
          values="
      1 0 0 0 0
      0 1 0 0 0
      0 0 1 0 0
      0 0 0 18 -9
    "
          result="blob"
        />
        <feBlend in="SourceGraphic" in2="blob" />
      </filter>
    </svg>
  );
};

const ShortcutButton = ({ icon, label, onClick }) => {
  return (
    <button onClick={onClick}>
      <div className="rounded-full cursor-pointer hover:shadow-lg opacity-30 hover:opacity-100 transition-[opacity,shadow] duration-200">
        <div className="size-16 aspect-square flex items-center justify-center flex-col gap-1">
          {icon}
          <span className="text-[10px] font-bold">{label}</span>
        </div>
      </div>
    </button>
  );
};

const SpotlightPlaceholder = ({ text, className }) => {
  return (
    <motion.div
      layout
      className={cn('absolute text-gray-500 flex items-center pointer-events-none z-10', className)}
    >
      <AnimatePresence mode="popLayout">
        <motion.p
          layoutId={`placeholder-${text}`}
          key={`placeholder-${text}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

const SpotlightInput = ({
  placeholder,
  value,
  onChange,
  placeholderClassName
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center w-full justify-start gap-2 px-6 h-16">
      <motion.div layoutId="search-icon">
        <Search />
      </motion.div>
      <div className="flex-1 relative text-2xl">
        {!value && (
          <SpotlightPlaceholder text={placeholder} className={placeholderClassName} />
        )}

        <motion.input
          ref={inputRef}
          layout="position"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none ring-none relative z-20"
          placeholder=""
        />
      </div>
    </div>
  );
};

const SearchResultCard = ({ icon, label, description, type, price, onClick, isLast, isSelected, profileData }) => {
  return (
    <button onClick={onClick} className="overflow-hidden w-full group/card text-left">
      <div
        className={cn(
          'flex items-center text-black justify-start gap-3 py-2 px-2 rounded-xl w-full transition-all',
          isLast && 'rounded-b-3xl',
          isSelected ? 'bg-white shadow-md' : 'hover:bg-white hover:shadow-md'
        )}
      >
        <div className="size-8 [&_svg]:stroke-[1.5] [&_svg]:size-6 aspect-square flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{label}</p>
            {type === 'creator' && profileData && (
              <CompactUserBadges
                roles={profileData.roles || [profileData.role]}
                isVerifiedSeller={profileData.is_verified_seller}
                showAdminBadge={profileData.show_admin_badge}
              />
            )}
          </div>
          <p className="text-xs opacity-50 truncate">{description}</p>
        </div>
        {price && (
          <div className="text-sm font-bold text-pink-600 flex-shrink-0">₹{price}</div>
        )}
        <div className="flex-shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <span className="text-xs font-bold uppercase text-gray-500">{type}</span>
        </div>
      </div>
    </button>
  );
};

const SearchResultsContainer = ({ searchResults, onHover, onResultClick, selectedIndex }) => {
  if (searchResults.length === 0) {
    return (
      <motion.div
        layout
        className="px-2 border-t flex flex-col bg-neutral-100 w-full py-8"
      >
        <div className="text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No results found</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      onMouseLeave={() => onHover(null)}
      className="px-2 border-t flex flex-col bg-neutral-100 max-h-96 overflow-y-auto w-full py-2"
    >
      {searchResults.map((result, index) => {
        return (
          <motion.div
            key={`search-result-${result.id}-${index}`}
            onMouseEnter={() => onHover(index)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.2,
              ease: 'easeOut'
            }}
          >
            <SearchResultCard
              icon={result.icon}
              label={result.label}
              description={result.description}
              type={result.type}
              price={result.price}
              onClick={() => onResultClick(result)}
              isLast={index === searchResults.length - 1}
              isSelected={index === selectedIndex}
              profileData={result.type === 'creator' ? result.data : null}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const MarketplaceSpotlight = ({
  isOpen = true,
  handleClose = () => {}
}) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [hoveredSearchResult, setHoveredSearchResult] = useState(null);
  const [hoveredShortcut, setHoveredShortcut] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null);

  const shortcuts = [
    {
      label: 'Products',
      icon: <Package />,
      filter: 'products',
      onClick: () => {
        setActiveFilter('products');
        setSearchValue('');
      }
    },
    {
      label: 'Trending',
      icon: <TrendingUp />,
      filter: 'trending',
      onClick: () => {
        setActiveFilter('trending');
        setSearchValue('');
      }
    },
    {
      label: 'Top Rated',
      icon: <Star />,
      filter: 'top_rated',
      onClick: () => {
        setActiveFilter('top_rated');
        setSearchValue('');
      }
    },
    {
      label: 'Categories',
      icon: <Tag />,
      filter: 'categories',
      onClick: () => {
        setActiveFilter('categories');
        setSearchValue('');
      }
    }
  ];

  // Prevent body scroll when modal is open - FIX FOR PAGE SCROLL ISSUE
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      setIsSearching(true);
      try {
        const results = [];
        
        // Handle filter-based searches (TOP RATED, TRENDING, ETC.)
        if (activeFilter && !searchValue.trim()) {
          let endpoint = '';
          
          if (activeFilter === 'trending') {
            // Sort by most purchases/downloads
            endpoint = `${API_URL}/api/products/list?sortBy=purchases&limit=10`;
          } else if (activeFilter === 'top_rated') {
            // Sort by highest rating
            endpoint = `${API_URL}/api/products/list?sortBy=rating&limit=10`;
          } else if (activeFilter === 'products') {
            endpoint = `${API_URL}/api/products/list?limit=10`;
          } else if (activeFilter === 'categories') {
            endpoint = `${API_URL}/api/products/list?limit=10`;
          }
          
          if (endpoint) {
            const res = await fetch(endpoint);
            const data = await res.json();
            
            if (data.products) {
              data.products.forEach(product => {
                results.push({
                  id: product.id,
                  type: 'product',
                  icon: <Package className="text-pink-500" />,
                  label: product.name,
                  description: product.short_description || product.description || 'No description',
                  price: product.price,
                  data: product
                });
              });
            }
          }
          
          setSearchResults(results);
          setSelectedIndex(0);
          setIsSearching(false);
          return;
        }
        
        // Handle text search
        if (!searchValue.trim()) {
          setSearchResults([]);
          setSelectedIndex(0);
          setIsSearching(false);
          return;
        }

        const searchQuery = searchValue.trim();
        const isHashtagSearch = searchQuery.startsWith('#');
        const cleanQuery = isHashtagSearch ? searchQuery.slice(1) : searchQuery;

        // Search products - handles name, description, tags, categories
        const productsRes = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(cleanQuery)}`);
        const productsData = await productsRes.json();

        // Also search by tags if it's a hashtag or looks like a tag
        let tagProducts = [];
        if (isHashtagSearch || cleanQuery.length > 2) {
          try {
            const tagRes = await fetch(`${API_URL}/api/products/list?search=${encodeURIComponent(cleanQuery)}&limit=10`);
            const tagData = await tagRes.json();
            if (tagData.products) {
              tagProducts = tagData.products;
            }
          } catch (e) {
            console.log('Tag search failed:', e);
          }
        }

        // Combine and deduplicate products
        const productMap = new Map();
        
        if (productsData.products) {
          productsData.products.forEach(product => {
            productMap.set(product.id, product);
          });
        }
        
        tagProducts.forEach(product => {
          if (!productMap.has(product.id)) {
            productMap.set(product.id, product);
          }
        });

        // Add products to results (limit to 8)
        Array.from(productMap.values()).slice(0, 8).forEach(product => {
          results.push({
            id: product.id,
            type: 'product',
            icon: <Package className="text-pink-500" />,
            label: product.name,
            description: product.short_description || product.description || 'No description',
            price: product.price,
            data: product
          });
        });

        // Search creators using the profile search endpoint - CASE INSENSITIVE
        // Only search creators if not a hashtag search
        if (!isHashtagSearch) {
          try {
            const creatorsRes = await fetch(`${API_URL}/api/profile/search?q=${encodeURIComponent(cleanQuery)}&limit=5`);
            const creatorsData = await creatorsRes.json();

            // Add creators to results with proper name display
            if (creatorsData.profiles && creatorsData.profiles.length > 0) {
              creatorsData.profiles.forEach(profile => {
                // Use name as primary fallback since username/display_name are often NULL
                const creatorName = profile.display_name || profile.name || profile.username || 'Creator';
                const username = profile.username || '';
                const bio = profile.bio || '';
                
                results.push({
                  id: profile.id,
                  type: 'creator',
                  icon: <User className="text-blue-500" />,
                  label: creatorName,
                  description: bio || (username ? `@${username}` : `${profile.role || 'Creator'}`),
                  data: profile
                });
              });
            }
          } catch (e) {
            console.log('Creator search failed:', e);
          }
        }

        setSearchResults(results);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const searchTimeout = setTimeout(fetchData, 300);
    return () => clearTimeout(searchTimeout);
  }, [searchValue, activeFilter]);

  // Update hover when using keyboard
  useEffect(() => {
    setHoveredSearchResult(selectedIndex);
  }, [selectedIndex]);

  const handleResultClick = (result, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (result.type === 'product') {
      navigate(`/product/${result.id}`);
      handleClose();
    } else if (result.type === 'creator') {
      // Navigate to creator's profile page
      navigate(`/profile/${result.id}`);
      handleClose();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  const handleSearchValueChange = (value) => {
    setSearchValue(value);
    if (value.trim()) {
      setActiveFilter(null); // Clear filter when typing
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
            filter: 'blur(20px) url(#blob)',
            scaleX: 1.3,
            scaleY: 1.1,
            y: -10
          }}
          animate={{
            opacity: 1,
            filter: 'blur(0px) url(#blob)',
            scaleX: 1,
            scaleY: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            filter: 'blur(20px) url(#blob)',
            scaleX: 1.3,
            scaleY: 1.1,
            y: 10
          }}
          transition={{
            stiffness: 550,
            damping: 50,
            type: 'spring'
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-[15vh] bg-black/30 backdrop-blur-sm"
          onClick={handleClose}
        >
          <SVGFilter />

          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
              setHovered(false);
              setHoveredShortcut(null);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ filter: 'url(#blob)' }}
            className={cn(
              'w-full flex items-center justify-end gap-4 z-20 group',
              '[&>div]:bg-neutral-100 [&>div]:text-black [&>div]:rounded-full [&>div]:backdrop-blur-xl',
              '[&_svg]:size-7 [&_svg]:stroke-[1.4]',
              'max-w-3xl px-4'
            )}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                layoutId="search-input-container"
                transition={{
                  layout: {
                    duration: 0.5,
                    type: 'spring',
                    bounce: 0.2
                  }
                }}
                style={{
                  borderRadius: '30px'
                }}
                className="h-full w-full flex flex-col items-center justify-start z-10 relative shadow-lg overflow-hidden border"
              >
                <SpotlightInput
                  placeholder={
                    hoveredShortcut !== null
                      ? shortcuts[hoveredShortcut].label
                      : hoveredSearchResult !== null
                      ? searchResults[hoveredSearchResult]?.label || 'Search'
                      : 'Search products, creators...'
                  }
                  placeholderClassName={
                    hoveredSearchResult !== null ? 'text-black bg-white' : 'text-gray-500'
                  }
                  value={searchValue}
                  onChange={handleSearchValueChange}
                />

                {(searchValue || isSearching || activeFilter) && (
                  <SearchResultsContainer
                    searchResults={searchResults}
                    onHover={setHoveredSearchResult}
                    onResultClick={handleResultClick}
                    selectedIndex={selectedIndex}
                  />
                )}
              </motion.div>
              {hovered &&
                !searchValue &&
                shortcuts.map((shortcut, index) => (
                  <motion.div
                    key={`shortcut-${index}`}
                    onMouseEnter={() => setHoveredShortcut(index)}
                    layout
                    initial={{ scale: 0.7, x: -1 * (64 * (index + 1)) }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{
                      scale: 0.7,
                      x:
                        1 *
                        (16 * (shortcuts.length - index - 1) + 64 * (shortcuts.length - index - 1))
                    }}
                    transition={{
                      duration: 0.8,
                      type: 'spring',
                      bounce: 0.2,
                      delay: index * 0.05
                    }}
                    className="rounded-full cursor-pointer"
                  >
                    <ShortcutButton 
                      icon={shortcut.icon} 
                      label={shortcut.label} 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        shortcut.onClick();
                      }} 
                    />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { MarketplaceSpotlight };
