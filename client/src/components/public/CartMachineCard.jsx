import { useNavigate } from 'react-router-dom';
import { Trash, Plus, Minus, ExternalLink, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { machinesAPI } from '@/services/publicAPI';

export default function CartMachineCard({ item, onRemove, onUpdateQuantity }) {
  const machine = item.machine_id;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!machine) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle size={16} />
          <span className="font-medium">Machine Unavailable</span>
        </div>
        <p className="text-gray-500">This machine is no longer available in our catalog.</p>
        <button
          onClick={() => onRemove(item._id)}
          className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove from Cart
        </button>
      </div>
    );
  }

  const getMediaUrl = (media) => {
    if (!media) return '';
    if (typeof media === 'string') return media;
    return media.url;
  };

  const handleLearnMore = async () => {
    setLoading(true);
    try {
      // Check if machine still exists
      await machinesAPI.getById(machine._id);
      // If successful, navigate to the machine detail
      navigate(`/products?machine=${machine._id}`);
    } catch (error) {
      // If machine doesn't exist, alert user
      alert('This machine is out of stock or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative">
        {getMediaUrl(machine.cover_image) ? (
          <img
            src={getMediaUrl(machine.cover_image)}
            alt={machine.name}
            className="w-full h-48 object-cover"
            onError={(e) => (e.target.src = '/placeholder.jpg')}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">🔧</div>
              <div className="text-sm">No image</div>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {machine.is_featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          )}
          {machine.is_new && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              New
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {machine.name}
        </h3>
        
        {/* Price */}
        {machine.price && (
          <p className="text-lg font-bold text-blue-600 mb-3">
            {machine.price}
          </p>
        )}
        
        {/* Quantity Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus size={16} className={item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={() => onRemove(item._id)}
            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
            title="Remove from cart"
          >
            <Trash size={16} />
          </button>
        </div>
        
        {/* Learn More Button */}
        <button
          onClick={handleLearnMore}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ExternalLink size={16} />
          {loading ? 'Checking...' : 'Learn More'}
        </button>
      </div>
    </div>
  );
} 