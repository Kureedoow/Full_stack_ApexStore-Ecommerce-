import React, { useEffect, useState } from 'react';
import { Search, Shield, ShieldAlert, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import adminApi from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatDate';
import getImageUrl from '../../utils/getImageUrl';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers({
        page,
        limit: 10,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });
      const data = res.data?.data || res.data;
      setUsers(data.users || data.items || (Array.isArray(data) ? data : []));
      setTotalPages(data.pagination?.totalPages || data.pages || 1);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleToggle = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateUserRole(user._id, nextRole);
      toast.success(`Role updated to ${nextRole}`);
      fetchUsers(currentPage);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = !user.isActive;
    try {
      await adminApi.updateUserStatus(user._id, nextStatus);
      toast.success(nextStatus ? 'User activated' : 'User deactivated');
      fetchUsers(currentPage);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(userToDelete._id);
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
      fetchUsers(currentPage);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User Profile',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
            {row.avatar ? (
              <img src={getImageUrl(row.avatar)} alt={row.firstName} className="w-full h-full object-cover" />
            ) : (
              <span>{row.firstName?.[0] || 'U'}</span>
            )}
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">
              {row.firstName} {row.lastName}
            </span>
            <span className="block text-[11px] font-mono text-slate-400">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleRoleToggle(row)}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
            row.role === 'admin'
              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Click to toggle role"
        >
          {row.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
          <span className="capitalize">{row.role}</span>
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleStatusToggle(row)}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
          }`}
          title="Click to toggle active status"
        >
          {row.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
          <span>{row.isActive ? 'Active' : 'Disabled'}</span>
        </button>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined On',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            setUserToDelete(row);
            setDeleteModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="User Accounts">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Registered Accounts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit user permissions, grant administrative rights, and manage account statuses
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="user">Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyTitle="No accounts found"
        emptyDescription="No users matched the criteria."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchUsers(page)}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User Account"
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900">{userToDelete?.email}</strong>? Their orders and data may be affected.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;
