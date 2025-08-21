import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '@/services/publicAPI';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        const { data } = await userAPI.getProfile();
        setUser(data);
        await loadCart();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('userToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await userAPI.login(credentials);
      localStorage.setItem('userToken', data.token);
      setUser(data.user);
      await loadCart();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await userAPI.register(userData);
      localStorage.setItem('userToken', data.token);
      setUser(data.user);
      await loadCart();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    setCart({ items: [] });
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await userAPI.updateProfile(profileData);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  const uploadProfileImage = async (imageBase64) => {
    try {
      const { data } = await userAPI.uploadProfileImage(imageBase64);
      setUser(prev => ({ ...prev, profile_image: data.profile_image }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Image upload failed' 
      };
    }
  };

  const loadCart = async () => {
    try {
      const { data } = await userAPI.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const addToCart = async (machineId, quantity = 1) => {
    try {
      const { data } = await userAPI.addToCart(machineId, quantity);
      setCart(data.cart);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add to cart' 
      };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const { data } = await userAPI.updateCartItem(itemId, quantity);
      setCart(data.cart);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update cart' 
      };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await userAPI.removeFromCart(itemId);
      setCart(data.cart);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to remove from cart' 
      };
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await userAPI.clearCart();
      setCart(data.cart);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to clear cart' 
      };
    }
  };

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    user,
    cart,
    loading,
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    loadCart
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 