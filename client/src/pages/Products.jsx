import { useEffect, useState } from 'react';
import { categoryAPI, subcategoryAPI, machinesAPI } from '@/services/publicAPI';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import PublicNavbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import CategoryCard from '@/components/public/CategoryCard';
import UniversalCard from '@/components/public/UniversalCard';
import { useInView } from 'react-intersection-observer';
import { X, ChevronDown, ChevronRight, Star, Eye, ArrowRight, Play, ShoppingCart, LogIn } from 'lucide-react';
import Footer from '@/components/public/Footer';

const LazyImage = ({ src, alt, className, fallback = '/placeholder.jpg' }) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' });
  const [imageError, setImageError] = useState(false);
  
  // Simple image URL handling
  const getImageUrl = () => {
    if (src && typeof src === 'object' && src.url) {
      return src.url;
    }
    if (src && typeof src === 'string') {
      return src;
    }
    return fallback;
  };
  
  const imageSrc = getImageUrl();
  
  return (
    <div ref={ref} style={{ minHeight: 100 }}>
      {inView && !imageError ? (
        <img 
          src={imageSrc} 
          alt={alt} 
          className={className} 
          loading="lazy"
          onError={() => {
            setImageError(true);
          }}
        />
      ) : (
        <div className={`${className} bg-gray-200 flex items-center justify-center`}>
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-1">🔧</div>
            <div className="text-xs">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

const Breadcrumb = ({ crumbs, onCrumbClick }) => (
  <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
    {crumbs.map((crumb, idx) => (
      <span key={idx} className="flex items-center">
        <button 
          className="hover:text-blue-600 transition-colors font-medium" 
          onClick={() => onCrumbClick(idx)}
        >
          {crumb.label}
        </button>
        {idx < crumbs.length - 1 && <ArrowRight size={14} className="mx-2" />}
      </span>
    ))}
  </nav>
);

export default function Products() {
  const { user, addToCart } = useUser();
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // URL parameter handling - only run on initial load and searchParams change
  useEffect(() => {
    const categoryId = searchParams.get('category');
    const subcategoryId = searchParams.get('subcategory');
    const machineId = searchParams.get('machine');

    // Clear all state first
    setExpandedCategory(null);
    setExpandedSubcategory(null);
    setSelectedMachine(null);

    // Then set based on URL params
    if (categoryId && categories.length > 0) {
      const category = categories.find(cat => cat._id === categoryId);
      if (category) {
        setExpandedCategory(category);
      }
    }

    if (subcategoryId && subcategories.length > 0) {
      const subcategory = subcategories.find(sub => sub._id === subcategoryId);
      if (subcategory) {
        setExpandedSubcategory(subcategory);
      }
    }

    if (machineId && machines.length > 0) {
      const machine = machines.find(m => m._id === machineId);
      if (machine) {
        setSelectedMachine(machine);
      }
    }
  }, [searchParams]); // Only depend on searchParams, not the data arrays

  // Separate effect to handle subcategory loading when category changes
  useEffect(() => {
    if (expandedCategory) {
      setLoading(true);
      subcategoryAPI.getByCategory(expandedCategory._id).then((res) => {
        setSubcategories(res.data);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setSubcategories([]);
    }
  }, [expandedCategory]);

  // Separate effect to handle machine loading when subcategory changes
  useEffect(() => {
    if (expandedSubcategory) {
      setLoading(true);
      machinesAPI.getAll().then((res) => {
        console.log('🔍 Products - All machines from API:', res.data);
        const filtered = res.data.filter(m => m.subcategory_id === expandedSubcategory._id || m.subcategory_id?._id === expandedSubcategory._id);
        console.log('🔍 Products - Filtered machines for subcategory:', filtered);
        console.log('🔍 Products - First machine cover_image:', filtered[0]?.cover_image);
        setMachines(filtered);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setMachines([]);
    }
  }, [expandedSubcategory]);

  // Breadcrumb logic
  const crumbs = [
    { label: 'Main Categories', onClick: () => handleCrumbClick(0) },
  ];
  if (expandedCategory) crumbs.push({ label: expandedCategory.name, onClick: () => handleCrumbClick(1) });
  if (expandedSubcategory) crumbs.push({ label: expandedSubcategory.name, onClick: () => handleCrumbClick(2) });
  if (selectedMachine) crumbs.push({ label: selectedMachine.name });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const { data } = await categoryAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('❌ Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Hamburger menu logic
  const handleHamburgerClick = () => setHamburgerOpen((open) => !open);
  const handleCategoryMenuClick = (cat) => {
    // Clear subcategory and machine when navigating to a new category
    navigate(`/products?category=${cat._id}#hero`);
    if (window.innerWidth < 768) setHamburgerOpen(false);
  };
  
  const handleSubcategoryMenuClick = (sub) => {
    if (expandedCategory) {
      // Clear machine when navigating to a subcategory
      navigate(`/products?category=${expandedCategory._id}&subcategory=${sub._id}#hero`);
      if (window.innerWidth < 768) setHamburgerOpen(false);
    }
  };

  // Breadcrumb click logic
  const handleCrumbClick = (idx) => {
    if (idx === 0) {
      // Navigate to main categories - clear all state
      navigate('/products#hero');
    } else if (idx === 1 && expandedCategory) {
      // Navigate to category level - clear subcategory and machine
      navigate(`/products?category=${expandedCategory._id}#hero`);
    } else if (idx === 2 && expandedCategory && expandedSubcategory) {
      // Navigate to subcategory level - clear machine only
      navigate(`/products?category=${expandedCategory._id}&subcategory=${expandedSubcategory._id}#hero`);
    }
  };

  const handleAddToCart = (machine) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      addToCart(machine._id, 1);
      alert('Machine added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add machine to cart. Please try again.');
    }
  };

  // Related machines (same subcategory, exclude current)
  const relatedMachines = selectedMachine && machines.filter(m => m._id !== selectedMachine._id);

  // Tab toggle for machine detail
  const [machineTab, setMachineTab] = useState('gallery');

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <PublicNavbar />
      
      {/* Hero Section with custom content */}
      <Hero 
        pageKey="products"
        customTitle={
          <>
            Our
            <br />
            <span className="text-blue-200">Products</span>
          </>
        }
        customSubtitle="Explore our comprehensive range of industrial machinery and equipment designed for your success."
      />

      {/* Flex container for sidebar + main content */}
      <div className="flex flex-row w-full mt-4" style={{minHeight: 'calc(100vh - 8rem)'}}>
        {/* Sidebar */}
        <div className={`w-80 flex-shrink-0 bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-80 md:block md:shadow-lg ${hamburgerOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="font-bold text-lg text-gray-800">Categories</h2>
            <button 
              className="md:hidden p-1 hover:bg-gray-200 rounded transition-colors"
              onClick={() => setHamburgerOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Categories list */}
          <div className="overflow-y-auto h-full pb-20">
            {categories.map((cat) => (
              <div key={cat._id} className="border-b border-gray-100">
                <button 
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 font-medium text-gray-700 flex items-center justify-between transition-colors"
                  onClick={() => handleCategoryMenuClick(cat)}
                >
                  <span>{cat.name}</span>
                  {expandedCategory && expandedCategory._id === cat._id ? (
                    <ChevronDown size={16} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                </button>
                {expandedCategory && expandedCategory._id === cat._id && subcategories.length > 0 && (
                  <div className="bg-gray-50 border-l-2 border-blue-200">
                    {subcategories.map((sub) => (
                      <button 
                        key={sub._id} 
                        className="block w-full text-left px-6 py-2 hover:bg-blue-100 text-sm text-gray-600 transition-colors"
                        onClick={() => handleSubcategoryMenuClick(sub)}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overlay for mobile */}
        {hamburgerOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setHamburgerOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto" style={{height: 'calc(100vh - 8rem)'}}>
          {/* Dynamic Heading - now inside main content area */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {selectedMachine
              ? selectedMachine.name
              : expandedSubcategory
                ? 'Products'
                : expandedCategory
                  ? 'Subcategories'
                  : 'Main Categories'}
          </h1>
          <Breadcrumb crumbs={crumbs} onCrumbClick={handleCrumbClick} />
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}
          
          {/* Main content logic */}
          {!loading && !expandedCategory && !expandedSubcategory && !selectedMachine && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <CategoryCard 
                  key={cat._id} 
                  category={cat} 
                  onClick={() => setExpandedCategory(cat)} 
                />
              ))}
            </div>
          )}
          
          {!loading && expandedCategory && !expandedSubcategory && !selectedMachine && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{expandedCategory.name}</h2>
                <p className="text-gray-600">{expandedCategory.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map((sub) => (
                  <UniversalCard
                    key={sub._id}
                    item={sub}
                    type="subcategory"
                    onClick={() => setExpandedSubcategory(sub)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {!loading && expandedSubcategory && !selectedMachine && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{expandedSubcategory.name}</h2>
                <p className="text-gray-600">{expandedSubcategory.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map((m) => (
                  <UniversalCard
                    key={m._id}
                    item={m}
                    type="machine"
                    onClick={() => setSelectedMachine(m)}
                    showPrice={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          {!loading && selectedMachine && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-2/3">
                    {selectedMachine.demo_video?.url ? (
                      <video 
                        src={selectedMachine.demo_video.url} 
                        controls 
                        className="w-full h-96 object-cover" 
                        poster={selectedMachine.video_thumbnail?.url}
                      />
                    ) : (
                      <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🔧</div>
                          <p>No Demo Video Available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="lg:w-1/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {selectedMachine.is_featured && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star size={12} />
                            Featured
                          </span>
                        )}
                        {selectedMachine.is_new && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            New
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedMachine.name}</h2>
                      <p className="text-gray-700 mb-4 leading-relaxed">{selectedMachine.description}</p>
                      {selectedMachine.price && (
                        <div className="text-2xl font-bold text-green-600 mb-4">{selectedMachine.price}</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        onClick={() => navigate('/contact#contact-hero')}
                      >
                        Order Now
                      </button>
                      <button 
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        onClick={() => navigate('/contact#contact-hero')}
                      >
                        Get Quotation
                      </button>
                      <button 
                        className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                        onClick={() => handleAddToCart(selectedMachine)}
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                      <button 
                        className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        onClick={() => navigate('/contact#contact-hero')}
                      >
                        Request More Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tab toggle for gallery/features */}
              <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setMachineTab('gallery')}
                      className={`px-6 py-4 font-medium transition-colors ${
                        machineTab === 'gallery' 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Gallery
                    </button>
                    <button
                      onClick={() => setMachineTab('features')}
                      className={`px-6 py-4 font-medium transition-colors ${
                        machineTab === 'features' 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Features & Specs
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {machineTab === 'gallery' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.isArray(selectedMachine.gallery_images) && selectedMachine.gallery_images.length > 0 ? (
                        selectedMachine.gallery_images.map((img, i) => (
                          <div key={i} className="group overflow-hidden rounded-lg">
                            <LazyImage 
                              src={img.url} 
                              alt={`Gallery ${i + 1}`} 
                              className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300" 
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                          <div className="text-4xl mb-2">📷</div>
                          <p>No gallery images available</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h4>
                        <ul className="space-y-2">
                          {selectedMachine.specifications?.map((spec, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Features</h4>
                        <ul className="space-y-2">
                          {selectedMachine.features?.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Related machines */}
              {relatedMachines && relatedMachines.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Machines</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedMachines.map((m) => (
                      <UniversalCard
                        key={m._id}
                        item={m}
                        type="machine"
                        onClick={() => setSelectedMachine(m)}
                        showPrice={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Our experts are here to help you find the perfect machinery solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact#contact-hero')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Quote
            </button>
            <button 
              onClick={() => navigate('/contact#contact-hero')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <LogIn className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to add items to your cart.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/login');
                  }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/register');
                  }}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full text-gray-500 px-6 py-2 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 