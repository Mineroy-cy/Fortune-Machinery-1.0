import { useEffect, useState } from 'react';
import { aboutAPI } from '@/services/publicAPI';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import Footer from '@/components/public/Footer';
import PartnerCarousel from '@/components/public/PartnerCarousel';

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        setLoading(true);
        const { data } = await aboutAPI.get();
        setAbout(data);
      } catch (error) {
        console.error('Error loading about data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAbout();
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      
      {/* Hero Section with custom content */}
      <Hero 
        pageKey="about"
        customTitle={
          <>
            About
            <br />
            <span className="text-blue-200">Fortune Machinery</span>
          </>
        }
        customSubtitle="Learn more about Fortune Machinery and why we are the trusted partner for your industrial needs."
      />
      
      <div className="max-w-5xl mx-auto py-16 px-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading about information...</p>
          </div>
        ) : about ? (
          <>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Our Story</h2>
              <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {about.description}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Why Choose Us</h2>
              <ul className="space-y-3">
                {about.whyChooseUs?.map((why, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{why}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {about.images?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {about.images.map((img, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded-lg">
                      <img 
                        src={img.url} 
                        alt={`About ${idx + 1}`} 
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => (e.target.src = '/placeholder.jpg')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">About Information</h3>
            <p className="text-gray-600">No about information available yet.</p>
          </div>
        )}
        
        <PartnerCarousel />
      </div>
      
      <Footer />
    </div>
  );
} 