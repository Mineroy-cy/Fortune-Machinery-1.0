import { useEffect, useState } from 'react';
import { contactAPI } from '@/services/adminAPI';
import AdminNavbar from '@/components/admin/adminNavbar';

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionMsg, setActionMsg] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data } = await contactAPI.getAll();
      setContacts(data);
    } catch (err) {
      setActionMsg('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markRead(id);
      setActionMsg('Marked as responded.');
      loadContacts();
    } catch {
      setActionMsg('Failed to mark as responded.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await contactAPI.delete(id);
      setActionMsg('Contact deleted.');
      loadContacts();
    } catch {
      setActionMsg('Failed to delete contact.');
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'responded') return c.responded;
    if (filter === 'unresponded') return !c.responded;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Contact Manager</h2>
            <div>
              <button className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setFilter('all')}>All</button>
              <button className={`ml-2 px-3 py-1 rounded ${filter === 'unresponded' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`} onClick={() => setFilter('unresponded')}>Unresponded</button>
              <button className={`ml-2 px-3 py-1 rounded ${filter === 'responded' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setFilter('responded')}>Responded</button>
            </div>
          </div>
          {actionMsg && <div className="mb-4 text-blue-700">{actionMsg}</div>}
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No contacts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Message</th>
                    <th className="p-2 border">Date Received</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((c) => (
                    <tr key={c._id} className={c.responded ? 'bg-green-50' : ''}>
                      <td className="p-2 border">{c.name}</td>
                      <td className="p-2 border">{c.email}</td>
                      <td className="p-2 border">{c.subject}</td>
                      <td className="p-2 border max-w-xs truncate" title={c.message}>{c.message}</td>
                      <td className="p-2 border text-sm">
                        {formatDate(c.created_at || c.createdAt)}
                      </td>
                      <td className="p-2 border">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          c.responded 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {c.responded ? 'Responded' : 'Unresponded'}
                        </span>
                      </td>
                      <td className="p-2 border flex gap-2">
                        {!c.responded && (
                          <button className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700" onClick={() => handleMarkRead(c._id)}>Mark as Responded</button>
                        )}
                        <button className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700" onClick={() => handleDelete(c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 