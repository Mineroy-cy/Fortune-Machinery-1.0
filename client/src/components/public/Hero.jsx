import { Typewriter } from 'react-simple-typewriter';
import { Link } from 'react-router-dom';
import { useBackground } from '@/context/BackgroundContext';
import { useLocation } from 'react-router-dom';

export default function Hero({ customTitle, customSubtitle, customButtons, pageKey }) {
  const { getBackgroundForPage } = useBackground();
  const location = useLocation();
  
  // Determine the page key for background lookup
  const currentPage = pageKey || location.pathname.replace('/', '') || 'home';
  const backgroundImage = getBackgroundForPage(currentPage);

  return (
    <section 
      className="text-white text-center py-16 md:py-24 px-4 relative overflow-hidden"
      style={{
        backgroundImage: backgroundImage?.url 
          ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage.url})`
          : 'linear-gradient(to-br, #1e40af, #3730a3)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Pattern (only if no custom background) */}
      {!backgroundImage?.url && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      )}
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {customTitle || (
            <>
              Premium Industrial
              <br className="hidden sm:block" />
              <span className="text-blue-200">Machinery</span>
              <br />
              <span className="text-yellow-300 text-xl sm:text-2xl md:text-3xl block mt-4 font-medium">
                <Typewriter
                  words={['Innovate.', 'Automate.', 'Succeed.', 'Transform.']}
                  loop={0}
                  cursor
                  cursorStyle="|"
                  typeSpeed={80}
                  deleteSpeed={50}
                  delaySpeed={1200}
                />
              </span>
            </>
          )}
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 text-blue-100 leading-relaxed">
          {customSubtitle || (
            <>
              Discover our latest machines and tools tailored for your manufacturing success. 
              Quality, reliability, and innovation in every product.
            </>
          )}
        </p>
        
        {customButtons ? (
          customButtons
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/products" 
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Explore Products
            </Link>
            <Link 
              to="/contact#contact-hero" 
              className="border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Quote
            </Link>
          </div>
        )}
        
        {/* Stats (only for home page) */}
        {currentPage === 'home' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300">500+</div>
              <div className="text-sm text-blue-200">Machines Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300">50+</div>
              <div className="text-sm text-blue-200">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300">10+</div>
              <div className="text-sm text-blue-200">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-300">24/7</div>
              <div className="text-sm text-blue-200">Support</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
