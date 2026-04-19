import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { 
  Users, 
  RefreshCw, 
  Trash2, 
  UserX, 
  Eye, 
  ShieldAlert,
  Search,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection);
      const querySnapshot = await getDocs(q);
      
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. check Firestore rules.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete data for ${username}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
      toast.success(`User ${username} data removed from library.`);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user record.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-panel-page animate-fade-in">
      <div className="admin-header">
        <div>
          <h1 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users className="text-primary" size={32} /> User Management
          </h1>
          <p className="text-secondary">Manage and monitor application users</p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={() => fetchUsers(true)}
          disabled={refreshing || loading}
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="admin-card">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ margin: 0, flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by username or ID..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.03)' }}
            />
          </div>
          <div className="stats-badge badge-watchlist">
            {users.length} Total Users
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="loader"></div>
            <p>Gathering user intelligence...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Watchlist</th>
                  <th>Watched</th>
                  <th>ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td data-label="User">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                          <span className="username">{user.username || 'Anonymous'}</span>
                          <span className="user-id" style={{ opacity: 0.6 }}>{user.email || 'No email registered'}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Watchlist">
                      <span className="stats-badge badge-watchlist">
                        {user.watchlist?.length || 0} items
                      </span>
                    </td>
                    <td data-label="Watched">
                      <span className="stats-badge badge-watched">
                        {user.watched?.length || 0} items
                      </span>
                    </td>
                    <td data-label="ID">
                      <span className="user-id">{user.id}</span>
                    </td>
                    <td data-label="Actions" className="actions-cell">
                      <button 
                        className="admin-action-btn delete" 
                        title="Delete User Record"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <UserX size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>{searchTerm ? 'No users matching your search.' : 'No users found in database.'}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={14} /> Admin Access Verified via Obsidian Protocol
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
