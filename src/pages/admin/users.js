'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        if (mounted) setUsers(response.data.users || []);
      } catch (err) {
        if (mounted) setError('Không tải được danh sách người dùng');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUsers();

    // load current user id to prevent self-demotion UI
    const loadCurrent = async () => {
      try {
        const r = await axios.get('/api/auth/me');
        if (mounted && r?.data?.user?.id) setCurrentUserId(r.data.user.id);
      } catch (e) {
        // ignore
      }
    };

    loadCurrent();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => {
      return [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [search, users]);

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'USER' : 'ADMIN';
    setSavingId(user.id);
    setError('');

    try {
      await axios.put('/api/admin/users', {
        userId: user.id,
        role: nextRole,
      });

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, role: nextRole.toLowerCase() } : item
        )
      );
    } catch (err) {
      setError('Không cập nhật được vai trò người dùng');
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleLock = async (user) => {
    const nextStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    setSavingId(user.id);
    setError('');

    try {
      await axios.put('/api/admin/users', {
        userId: user.id,
        status: nextStatus,
      });

      setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)));
    } catch (err) {
      setError('Không thay đổi được trạng thái người dùng');
    } finally {
      setSavingId(null);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setError('');
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditName('');
    setEditEmail('');
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingId(editingUser.id);
    try {
      await axios.put('/api/admin/users', {
        userId: editingUser.id,
        name: editName,
        email: editEmail,
      });

      setUsers((current) => current.map((u) => (u.id === editingUser.id ? { ...u, name: editName, email: editEmail } : u)));
      closeEdit();
    } catch (err) {
      setError('Không lưu được thông tin người dùng');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản Lý Người Dùng</h1>
            <p className="mt-2 text-sm text-slate-500">Danh sách người dùng và vai trò hiện tại.</p>
          </div>

          <div className="w-full md:max-w-sm">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, vai trò..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Đơn hàng</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={7}>Đang tải...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={7}>Không có người dùng phù hợp</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4 font-medium text-slate-900">#{user.id}</td>
                      <td className="px-4 py-4 text-slate-700">{user.name}</td>
                      <td className="px-4 py-4 text-slate-700">{user.email}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'LOCKED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{user.order_count}</td>
                      <td className="px-4 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(user)}
                          disabled={
                            savingId === user.id || (currentUserId && currentUserId === user.id && user.role === 'admin')
                          }
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingId === user.id
                            ? 'Đang lưu...'
                            : currentUserId === user.id && user.role === 'admin'
                            ? 'Không thể hạ quyền'
                            : user.role === 'admin'
                            ? 'Hạ quyền'
                            : 'Nâng quyền'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleLock(user)}
                          disabled={savingId === user.id || (currentUserId && currentUserId === user.id)}
                          className="ml-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingId === user.id ? 'Đang lưu...' : user.status === 'LOCKED' ? 'Mở khóa' : 'Khóa'}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="ml-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editingUser ? (
        <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold">Chỉnh sửa người dùng</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Tên</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-md border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Email</label>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-md border px-3 py-2" />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeEdit} className="rounded-md px-4 py-2 border">Hủy</button>
              <button onClick={handleSaveEdit} disabled={savingId === editingUser.id} className="rounded-md bg-blue-600 px-4 py-2 text-white">{savingId === editingUser.id ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}