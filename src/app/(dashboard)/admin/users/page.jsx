'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { usersCollection, suspendUser, deleteUser } from '@/lib/firebase/firestore';
import toast from 'react-hot-toast';
import { 
  PersonAdd, 
  Edit, 
  Delete, 
  Block, 
  CheckCircle,
  Search,
  Refresh,
  People
} from '@mui/icons-material';

export default function AdminUsersPage() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(usersCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    } catch (error) {
      toast.error('Gagal mengambil data user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId, currentStatus) => {
    if (!confirm(`Yakin ingin ${currentStatus ? 'mengaktifkan' : 'menonaktifkan'} user ini?`)) return;
    
    const { success, error } = await suspendUser(userId, !currentStatus);
    if (success) {
      toast.success(`User ${!currentStatus ? 'dinonaktifkan' : 'diaktifkan'} berhasil`);
      fetchUsers();
    } else {
      toast.error('Gagal mengubah status user: ' + error);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan!')) return;
    
    const { success, error } = await deleteUser(userId);
    if (success) {
      toast.success('User berhasil dihapus');
      fetchUsers();
    } else {
      toast.error('Gagal menghapus user: ' + error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      reseller: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    const labels = {
      admin: '👑 Admin',
      reseller: '📦 Reseller',
      user: '👤 User'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100'}`}>
        {labels[role] || role || 'User'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Kelola User
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchUsers}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Refresh className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="btn-success flex items-center space-x-2 text-sm"
          >
            <PersonAdd className="w-4 h-4" />
            <span>Tambah User</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray
