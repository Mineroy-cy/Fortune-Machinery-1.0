import { useEffect, useState } from 'react';
import { statsAPI } from '@/services/adminAPI';
import AdminNavbar from '@/components/admin/AdminNavbar';

const statCards = [
  { key: 'totalCategories', label: 'Categories' },
  { key: 'totalSubcategories', label: 'Subcategories' },
  { key: 'totalMachines', label: 'Machines' },
  { key: 'totalVideos', label: 'Videos' },
  { key: 'totalPartners', label: 'Partners' },
  { key: 'totalContacts', label: 'Contacts' },
  { key: 'totalSuccessStories', label: 'Success Stories' },
  { key: 'featuredMachines', label: 'Featured Machines' },
  { key: 'newMachines', label: 'New Machines' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    statsAPI.getStats().then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-10">Loading stats...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          <h2 className="text-2xl font-bold mb-4">Admin Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <div key={card.key} className="bg-white rounded shadow p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">{stats[card.key]}</div>
                <div className="text-gray-700 text-lg font-medium text-center">{card.label}</div>
              </div>
            ))}
          </div>
          {/* Optionally, show recent activity here */}
        </div>
      </div>
    </div>
  );
}
