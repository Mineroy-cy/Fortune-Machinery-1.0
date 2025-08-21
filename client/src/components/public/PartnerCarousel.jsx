import { useEffect, useState, useRef } from 'react';
import { partnerAPI } from '@/services/publicAPI';

export default function PartnerCarousel() {
  const [partners, setPartners] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef();

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true);
        const { data } = await partnerAPI.getAll();
        setPartners(data);
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPartners();
  }, []);

  // Auto-looping
  useEffect(() => {
    if (partners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % partners.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [partners]);

  if (loading) {
    return (
      <div className="w-full py-12 bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading partners...</p>
        </div>
      </div>
    );
  }

  if (!partners.length) return null;

  return (
    <div className="w-full py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Our Trusted Partners</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We collaborate with industry leaders to deliver the best machinery solutions
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
          
          <div className="flex transition-transform duration-1000 ease-in-out" 
               style={{ transform: `translateX(-${index * 120}px)` }}>
            {partners.concat(partners).map((p, i) => (
              <div key={i} className="mx-6 flex-shrink-0" style={{ width: 120 }}>
                <a 
                  href={p.website || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300 group-hover:shadow-lg">
                    <img
                      src={p.logo?.url || '/placeholder.jpg'}
                      alt={p.name}
                      className="h-12 w-full object-contain transition-all duration-300"
                      onError={e => (e.target.src = '/placeholder.jpg')}
                    />
                    <p className="text-xs text-gray-600 mt-2 text-center truncate group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dots indicator */}
        {partners.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {partners.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setIndex(i)}
                aria-label={`Go to partner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 