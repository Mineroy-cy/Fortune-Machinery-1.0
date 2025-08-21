import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, User, ShoppingCart, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout, getCartItemCount } = useUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileDropdown]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' 
        : 'bg-gray-900/90 backdrop-blur-sm'
    }`}>
      <div className="px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-white hover:text-blue-300 transition-colors">
            Fortune Machinery
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-blue-300 transition-colors font-medium">Home</Link>
            <Link to="/products" className="text-white hover:text-blue-300 transition-colors font-medium">Products</Link>
            <Link to="/videos" className="text-white hover:text-blue-300 transition-colors font-medium">Videos</Link>
            <Link to="/success-stories" className="text-white hover:text-blue-300 transition-colors font-medium">Success Stories</Link>
            <Link to="/about" className="text-white hover:text-blue-300 transition-colors font-medium">About</Link>
            <Link to="/contact#contact-hero" className="text-white hover:text-blue-300 transition-colors font-medium">Contact</Link>
            
            {/* User Authentication */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Cart Link */}
                <Link 
                  to="/cart" 
                  className="relative flex items-center gap-2 text-white hover:text-blue-300 transition-colors font-medium"
                >
                  <ShoppingCart size={18} />
                  Cart
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors font-medium"
                  >
                    <div className="relative">
                      {user.profile_image?.url ? (
                        <img
                          src={user.profile_image.url}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <span>{user.name}</span>
                    <ChevronDown size={16} className={`transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <Settings size={16} />
                        Edit Profile
                      </Link>
                      
                      <Link
                        to="/cart"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <ShoppingCart size={16} />
                        View Cart
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white hover:text-blue-300 transition-colors font-medium">Login</Link>
                <Link to="/register" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Sign Up</Link>
                <Link to="/admin/login" className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium">Admin</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="flex flex-col space-y-2 pt-4 pb-4 border-t border-gray-700/50">
            <Link 
              to="/" 
              className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium"
              onClick={closeMenu}
            >
              Products
            </Link>
            <Link 
              to="/videos" 
              className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium"
              onClick={closeMenu}
            >
              Videos
            </Link>
            <Link 
              to="/success-stories" 
              className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium"
              onClick={closeMenu}
            >
              Success Stories
            </Link>
            <Link 
              to="/about" 
              className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium"
              onClick={closeMenu}
            >
              About
            </Link>
            <Link 
              to="/contact#contact-hero" 
              className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium"
              onClick={closeMenu}
            >
              Contact
            </Link>
            
            {/* Mobile User Authentication */}
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    {user.profile_image?.url ? (
                      <img
                        src={user.profile_image.url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <Link 
                  to="/profile" 
                  className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
                  onClick={closeMenu}
                >
                  <Settings size={18} />
                  Edit Profile
                </Link>
                <Link 
                  to="/cart" 
                  className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
                  onClick={closeMenu}
                >
                  <ShoppingCart size={18} />
                  Cart ({getCartItemCount()})
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium flex items-center gap-2 w-full text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors text-white font-medium"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-4 mt-2 text-center text-white font-medium"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
                <Link 
                  to="/admin/login" 
                  className="bg-gray-600 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors mx-4 mt-2 text-center text-white font-medium"
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
