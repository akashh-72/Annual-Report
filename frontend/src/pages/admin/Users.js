import React, { useEffect, useMemo, useState } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { FiSearch, FiUsers, FiEdit, FiTrash2, FiUserPlus, FiUserCheck, FiUserX, FiFilter, FiRefreshCw, FiShield } from 'react-icons/fi';
import Pagination from '../../components/admin/Pagination';
import Badge from '../../components/admin/Badge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ExportButton from '../../components/admin/ExportButton';
import LoadingScreen from '../../components/admin/LoadingScreen';
import DataTable from '../../components/admin/DataTable';

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: '', department: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });
  const [isVisible, setIsVisible] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, students: 0, faculty: 0, admins: 0 });

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const params = useMemo(() => ({ skip: (page - 1) * 20, limit: 20, ...filters }), [page, filters]);

  const load = async () => {
    try {
      setLoading(true);
      console.log('Loading users with params:', params);
      
      const [depts, list, allUsers] = await Promise.all([
        departments.length ? Promise.resolve(departments) : adminService.getDepartments().catch((err) => {
          console.error('Failed to load departments:', err);
          return [];
        }),
        adminService.listUsers(params).catch((err) => {
          console.error('Failed to load users list:', err);
          console.error('Error details:', err.response?.data || err.message);
          return { users: [], total: 0 };
        }),
        // Get all users for stats calculation (without filters)
        adminService.listUsers({ skip: 0, limit: 10000 }).catch((err) => {
          console.error('Failed to load all users for stats:', err);
          return { users: [], total: 0 };
        })
      ]);
      
      console.log('Departments:', depts);
      console.log('Users list response:', list);
      console.log('All users response:', allUsers);
      
      if (depts && depts.length > 0) {
        setDepartments(depts);
      }
      
      const usersList = list.users || [];
      const totalCount = list.total || 0;
      
      console.log('Setting users:', usersList.length, 'Total:', totalCount);
      
      setUsers(usersList);
      setTotal(totalCount);
      
      // Calculate stats from all users (not filtered)
      const allUserList = allUsers.users || [];
      const active = allUserList.filter(u => u.is_active).length;
      const inactive = allUserList.filter(u => !u.is_active).length;
      const students = allUserList.filter(u => u.role === 'student').length;
      const faculty = allUserList.filter(u => u.role === 'faculty').length;
      const admins = allUserList.filter(u => u.role === 'admin').length;
      
      console.log('Stats:', { total: allUsers.total || 0, active, inactive, students, faculty, admins });
      
      setStats({ total: allUsers.total || 0, active, inactive, students, faculty, admins });
    } catch (e) {
      console.error('Failed to load users:', e);
      console.error('Error stack:', e.stack);
      toast.error('Failed to load users: ' + (e.message || 'Unknown error'));
      setUsers([]);
      setTotal(0);
      setStats({ total: 0, active: 0, inactive: 0, students: 0, faculty: 0, admins: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]);

  const onFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toggleStatus = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: 'Toggle User Status',
      message: 'Are you sure you want to change this user\'s status?',
      onConfirm: async () => {
        try {
          await adminService.toggleUserStatus(userId);
          toast.success('User status updated');
          load();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (e) {
          toast.error('Failed to update status');
        }
      }
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (action === 'activate' || action === 'deactivate') {
      setConfirmDialog({
        isOpen: true,
        type: 'warning',
        title: `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`,
        onConfirm: async () => {
          try {
            await Promise.all(selectedUsers.map(id => adminService.toggleUserStatus(id)));
            toast.success(`Successfully ${action}d users`);
            setSelectedUsers([]);
            load();
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          } catch (e) {
            toast.error(`Failed to ${action} users`);
          }
        }
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!editingUser || !editingUser.id) {
        toast.error('Invalid user data');
        return;
      }
      
      // Prepare update data (only include fields that can be updated)
      const updateData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department
      };
      
      await adminService.updateUser(editingUser.id, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      load();
    } catch (e) {
      console.error('Failed to update user:', e);
      const message = e.response?.data?.detail || 'Failed to update user';
      toast.error(message);
    }
  };

  const columns = [
    {
      header: 'Name',
      key: 'name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.student_id || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Email',
      key: 'email',
      sortable: true,
      className: 'text-sm text-gray-600'
    },
    {
      header: 'Role',
      key: 'role',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'admin' ? 'danger' : value === 'faculty' ? 'warning' : 'info'}>
          {value}
        </Badge>
      )
    },
    {
      header: 'Department',
      key: 'department',
      sortable: true,
      className: 'text-sm text-gray-600'
    },
    {
      header: 'Activities',
      key: 'activity_count',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || 0}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'is_active',
      sortable: true,
      render: (value) => <Badge variant={value ? 'success' : 'danger'}>{value ? 'Active' : 'Inactive'}</Badge>
    }
  ];

  const exportHeaders = ['Name', 'Email', 'Role', 'Department', 'Student_ID', 'Activities', 'Status'];
  const exportData = users.map(u => ({
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    student_id: u.student_id || 'N/A',
    activity_count: u.activity_count || 0,
    is_active: u.is_active ? 'Active' : 'Inactive'
  }));

  if (loading && users.length === 0) {
    return <LoadingScreen message="Loading users..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div 
        data-animate
        id="users-hero"
        className={`relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-3xl shadow-2xl p-8 transition-all duration-1000 ${isVisible['users-hero'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Admin • Users
                </span>
                <span className="px-3 py-1 bg-cyan-500/20 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center">
                  <FiUsers className="mr-1.5 h-3 w-3" />
                  {total} Users
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
              <p className="text-blue-100 text-lg">Manage user accounts, roles, and permissions</p>
            </div>
            <div className="flex items-center gap-3">
              <ExportButton data={exportData} filename="users" headers={exportHeaders} />
              <button 
                onClick={load} 
                className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                aria-label="Refresh users"
              >
                <FiRefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div 
        data-animate
        id="users-stats"
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 delay-100 ${isVisible['users-stats'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiUsers className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <h3 className="text-white font-semibold">Total Users</h3>
            <p className="text-blue-100 text-sm mt-1">All registered</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiUserCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.active}</span>
            </div>
            <h3 className="text-white font-semibold">Active Users</h3>
            <p className="text-green-100 text-sm mt-1">Currently enabled</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiUserX className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.inactive}</span>
            </div>
            <h3 className="text-white font-semibold">Inactive Users</h3>
            <p className="text-red-100 text-sm mt-1">Disabled accounts</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FiShield className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.admins}</span>
            </div>
            <h3 className="text-white font-semibold">Administrators</h3>
            <p className="text-orange-100 text-sm mt-1">Admin access</p>
          </div>
        </div>
      </div>

      {/* Role Distribution Cards */}
      <div 
        data-animate
        id="role-distribution"
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-150 ${isVisible['role-distribution'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-500 rounded-xl shadow-md">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
            <span className="text-4xl font-bold text-blue-600">{stats.students}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Students</h3>
          <p className="text-sm text-gray-600 mt-1">Regular student accounts</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-500 rounded-xl shadow-md">
              <FiUserCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-4xl font-bold text-purple-600">{stats.faculty}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Faculty</h3>
          <p className="text-sm text-gray-600 mt-1">Teaching staff members</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-red-500 rounded-xl shadow-md">
              <FiShield className="h-6 w-6 text-white" />
            </div>
            <span className="text-4xl font-bold text-red-600">{stats.admins}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Admins</h3>
          <p className="text-sm text-gray-600 mt-1">System administrators</p>
        </div>
      </div>

      {/* Filters Section */}
      <div 
        data-animate
        id="users-filters"
        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-1000 delay-200 ${isVisible['users-filters'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFilter className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFilter('search', e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select value={filters.role} onChange={(e) => onFilter('role', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select value={filters.department} onChange={(e) => onFilter('department', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div 
          data-animate
          className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FiUsers className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-semibold text-blue-900">
                {selectedUsers.length} user(s) selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Deactivate
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div 
        data-animate
        id="users-table"
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-1000 delay-300 hover:shadow-xl ${isVisible['users-table'] !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <DataTable
          columns={columns}
          data={users}
          loading={loading && users.length > 0}
          emptyMessage="No users found"
          emptyIcon={FiUsers}
          selectable
          selectedRows={selectedUsers}
          onSelectRows={setSelectedUsers}
          actions={(row) => (
            <>
              <button
                onClick={() => handleEditUser(row)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                title="Edit user"
              >
                <FiEdit className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggleStatus(row.id)}
                className={`p-2 rounded-lg transition-all ${row.is_active ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                title={row.is_active ? 'Deactivate' : 'Activate'}
              >
                {row.is_active ? <FiUserX className="h-5 w-5" /> : <FiUserCheck className="h-5 w-5" />}
              </button>
            </>
          )}
        />
        {total > 20 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <Modal title="Edit User" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default Users;
