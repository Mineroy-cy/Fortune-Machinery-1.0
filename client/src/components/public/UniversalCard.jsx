import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Eye } from 'lucide-react';

const UniversalCard = ({ item, type, onClick, className = '' }) => {
  // Get item name based on type
  const itemName = item.name || item.title || 'Untitled';
  
  // Get image URL based on type
  let imageUrl = '';
  if (type === 'category') {
    imageUrl = item.image?.url;
  } else if (type === 'subcategory') {
    imageUrl = item.image?.url;
  } else if (type === 'machine') {
    imageUrl = item.cover_image?.url;
  } else if (type === 'video') {
    // Handle both transformed data (thumbnail_url) and nested structure (thumbnail.url)
    imageUrl = item.thumbnail_url || item.thumbnail?.url || item.video_thumbnail?.url;
  }

  // Transform image URL for better display
  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    imageUrl = imageUrl.replace('/upload/', '/upload/c_fill,w_400,h_192,g_center/');
  }

  const cardContent = (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:shadow-xl ${className}`}>
      
      <div className="relative">
        {imageUrl ? (
          <div className="w-full h-48 relative">
            <img
              src={imageUrl}
              alt={itemName}
              className="w-full h-full object-cover transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {type === 'video' ? '🎥' : type === 'machine' ? '🔧' : '📁'}
              </div>
              <div className="text-sm">No image</div>
            </div>
          </div>
        )}

        {/* Video Play Button */}
        {type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <Play size={24} className="text-gray-800" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {type === 'machine' && item.is_new && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              New
            </span>
          )}
          {type === 'machine' && item.is_featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star size={12} />
              Featured
            </span>
          )}
          {type === 'video' && item.is_featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star size={12} />
              Featured
            </span>
          )}
          {type === 'video' && item.is_highlighted && (
            <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              ⭐ Highlighted
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {itemName}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.description?.slice(0, 120)}...
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {type === 'category' && (
              <Link
                to={`/products?category=${item._id}#hero`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View Products
              </Link>
            )}
            
            {type === 'subcategory' && (
              <button 
                onClick={() => onClick?.(item)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View Machines
              </button>
            )}
            
            {type === 'machine' && (
              <>
                <button 
                  onClick={() => onClick?.(item)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Learn More
                </button>
                <Link 
                  to="/contact#contact-hero"
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Get Quote
                </Link>
              </>
            )}
            
            {type === 'video' && (
              <button
                onClick={() => onClick?.(item)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Play size={16} />
                Watch Video
              </button>
            )}
          </div>
          
          {type === 'machine' && (
            <button
              onClick={() => onClick?.(item)}
              className="text-gray-700 hover:text-black"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return cardContent;
};

export default UniversalCard; 