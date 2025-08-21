import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '@/services/publicAPI';

const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider = ({ children }) => {
  const [backgrounds, setBackgrounds] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackgrounds();
  }, []);

  const loadBackgrounds = async () => {
    try {
      setLoading(true);
      const { data } = await settingsAPI.getAll();
      const backgroundsMap = {};
      data.forEach(setting => {
        if (setting.background_image?.url) {
          backgroundsMap[setting.page] = setting.background_image;
        }
      });
      setBackgrounds(backgroundsMap);
    } catch (error) {
      console.error('Failed to load background images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundForPage = (page) => {
    return backgrounds[page] || null;
  };

  const refreshBackgrounds = () => {
    loadBackgrounds();
  };

  const value = {
    backgrounds,
    loading,
    getBackgroundForPage,
    refreshBackgrounds,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}; 