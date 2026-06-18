'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { usersCollection } from '@/lib/firebase/firestore';
import toast from 'react-hot-toast';
import { AdminPanelSettings, Refresh, Search, Save } from '@mui/icons-material';

export default function AdminRolesPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(usersCollection, userId), {
        role: newRole,
        updatedAt: new Date()
      });
      toast.success('Role berhasil diupdate');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error('Gagal update role: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'reseller': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Manajemen Role
        </h1>
        <button
          onClick={fetchUsers}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Refresh className="w-4 h-4" />
          <span>Refresh</span>
        </button>
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
                    Role Saat Ini
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Ubah Role
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? '👑 Admin' :
                         user.role === 'reseller' ? '📦 Reseller' :
                         '👤 User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <select
                          defaultValue={user.role || 'user'}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="reseller">Reseller</option>
                          <option value="user">User</option>
                        </select>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {user.role || 'user'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              const select = e.target.closest('tr').querySelector('select');
                              handleRoleChange(user.id, select.value);
                            }}
                            className="btn-success flex items-center space-x-1 text-sm px-3 py-1"
                          >
                            <Save className="w-4 h-4" />
                            <span>Simpan</span>
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="btn-danger text-sm px-3 py-1"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="btn-primary flex items-center space-x-1 text-sm px-3 py-1"
                        >
                          <AdminPanelSettings className="w-4 h-4" />
                          <span>Edit Role</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <AdminPanelSettings className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada user ditemukan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
