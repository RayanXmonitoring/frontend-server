'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { usersCollection, suspendUser, deleteUser } from '@/lib/firebase/firestore';
import { toast } from 'react-hot-toast';
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Terdaftar
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {user.displayName || 'Tanpa Nama'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isSuspended 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.isSuspended ? '⛔ Nonaktif' : '✅ Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspend(user.id, user.isSuspended)}
                          className={`p-1 ${
                            user.isSuspended
                              ? 'text-green-600 hover:text-green-800 dark:text-green-400'
                              : 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400'
                          }`}
                          title={user.isSuspended ? 'Aktifkan' : 'Nonaktifkan'}
                        >
                          {user.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Block className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Hapus"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <People className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada user ditemukan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
      }
