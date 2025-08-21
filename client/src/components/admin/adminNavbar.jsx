import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '@/services/adminAPI';
import { useState } from 'react';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await authAPI.logout();
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/categories', label: 'Categories' },
    { path: '/admin/subcategories', label: 'Subcategories' },
    { path: '/admin/machines', label: 'Machines' },
    { path: '/admin/videos', label: 'Videos' },
    { path: '/admin/partners', label: 'Partners' },
    { path: '/admin/success-stories', label: 'Success Stories' },
    { path: '/admin/user-feedback', label: 'User Feedback' },
    { path: '/admin/user-success-stories', label: 'User Success Stories' },
    { path: '/admin/about', label: 'About Manager' },
    { path: '/admin/contacts', label: 'Contacts' },
    { path: '/admin/settings', label: 'Settings' },
    { path: '/admin/subscriptions', label: 'Subscriptions' },
  ];

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors mb-1
              ${location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-200 hover:bg-gray-700 hover:text-white'}
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-0 left-0 z-50 flex items-center h-16 bg-gray-800 w-full px-4 shadow-lg">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-300 hover:text-white focus:outline-none focus:text-white mr-4"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">Admin Panel</h1>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 bg-gray-900 text-white z-40">
        <div className="flex flex-col w-64 h-screen bg-gray-900 shadow-xl">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white shadow-xl transform transition-transform duration-200 md:hidden"
            style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            <div className="flex items-center h-16 px-6 border-b border-gray-700 justify-between">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
      {/* Spacer for main content on desktop */}
      <div className="md:ml-64" />
    </>
  );
}
