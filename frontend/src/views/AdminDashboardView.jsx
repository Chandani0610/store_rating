import React, { useState, useEffect } from 'react';
import { 
  Users, Store, Star, Plus, Search, Filter, RefreshCw, 
  ShieldCheck, UserCheck, Eye, X, Check, AlertCircle 
} from 'lucide-react';
import { api } from '../api';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';

export default function AdminDashboardView({ onNotify }) {
  // Active Tab: 'stores' | 'users'
  const [activeTab, setActiveTab] = useState('stores');

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0, rolesBreakdown: {} });
  const [statsLoading, setStatsLoading] = useState(false);

  // Stores State
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesSearch, setStoresSearch] = useState('');
  const [storesSortBy, setStoresSortBy] = useState('name');
  const [storesSortOrder, setStoresSortOrder] = useState('asc');

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('ALL');
  const [usersSortBy, setUsersSortBy] = useState('name');
  const [usersSortOrder, setUsersSortOrder] = useState('asc');

  // Modals
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Fetch Dashboard Stats
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Stores
  const loadStores = async () => {
    setStoresLoading(true);
    try {
      const params = {
        search: storesSearch,
        sortBy: storesSortBy,
        sortOrder: storesSortOrder,
      };
      const res = await api.getAdminStores(params);
      if (res.success) {
        setStores(res.stores);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStoresLoading(false);
    }
  };

  // Fetch Users
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        search: usersSearch,
        role: usersRoleFilter,
        sortBy: usersSortBy,
        sortOrder: usersSortOrder,
      };
      const res = await api.getAdminUsers(params);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'stores') {
      loadStores();
    } else {
      loadUsers();
    }
  }, [activeTab, storesSearch, storesSortBy, storesSortOrder, usersSearch, usersRoleFilter, usersSortBy, usersSortOrder]);

  const handleStoresSort = (field) => {
    if (storesSortBy === field) {
      setStoresSortOrder(storesSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoresSortBy(field);
      setStoresSortOrder('asc');
    }
  };

  const handleUsersSort = (field) => {
    if (usersSortBy === field) {
      setUsersSortOrder(usersSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUsersSortBy(field);
      setUsersSortOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Platform management, stores registry, users administration, and metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadStats();
              if (activeTab === 'stores') loadStores();
              else loadUsers();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Requirement: Dashboard displaying Total number of users, Total number of stores, Total number of submitted ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalUsers}
            </span>
            <span className="text-xs text-slate-500 font-medium">registered</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <span>Users: <strong className="text-slate-700">{stats.rolesBreakdown?.USER || 0}</strong></span>
            <span>•</span>
            <span>Owners: <strong className="text-slate-700">{stats.rolesBreakdown?.STORE_OWNER || 0}</strong></span>
            <span>•</span>
            <span>Admins: <strong className="text-slate-700">{stats.rolesBreakdown?.ADMIN || 0}</strong></span>
          </div>
        </div>

        {/* Total Stores */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Stores
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalStores}
            </span>
            <span className="text-xs text-slate-500 font-medium">on platform</span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-700 font-medium pt-3 border-t border-slate-100">
            All active & eligible for rating
          </div>
        </div>

        {/* Total Ratings Submitted */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Submitted Ratings
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalRatings}
            </span>
            <span className="text-xs text-slate-500 font-medium">feedbacks recorded</span>
          </div>
          <div className="mt-3 text-[11px] text-amber-700 font-medium pt-3 border-t border-slate-100">
            Ratings strictly range 1 to 5
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('stores')}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'stores'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Stores Directory</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
                {stores.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Management</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
                {users.length}
              </span>
            </button>
          </div>

          <div className="pb-2">
            {activeTab === 'stores' ? (
              <button
                type="button"
                onClick={() => setIsAddStoreOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Store</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= STORES TAB CONTENT ================= */}
        {activeTab === 'stores' && (
          <div className="space-y-4">
            {/* Requirement: Can apply filters on all listings based on Name, Email, Address */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storesSearch}
                  onChange={(e) => setStoresSearch(e.target.value)}
                  placeholder="Filter stores by Name, Email, or Address..."
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              {storesSearch && (
                <button
                  type="button"
                  onClick={() => setStoresSearch('')}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Requirement: Can view a list of stores with details: Name, Email, Address, Rating */}
            {/* Requirement: All tables should support sorting (ascending/descending) for key fields */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <SortableHeader
                        label="Store Name"
                        field="name"
                        currentSort={storesSortBy}
                        currentOrder={storesSortOrder}
                        onSort={handleStoresSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSort={storesSortBy}
                        currentOrder={storesSortOrder}
                        onSort={handleStoresSort}
                      />
                      <SortableHeader
                        label="Address"
                        field="address"
                        currentSort={storesSortBy}
                        currentOrder={storesSortOrder}
                        onSort={handleStoresSort}
                      />
                      <SortableHeader
                        label="Rating"
                        field="rating"
                        currentSort={storesSortBy}
                        currentOrder={storesSortOrder}
                        onSort={handleStoresSort}
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {storesLoading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          Loading stores...
                        </td>
                      </tr>
                    ) : stores.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          No stores found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      stores.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold">
                                {s.name.charAt(0)}
                              </div>
                              <span>{s.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                            {s.email}
                          </td>
                          <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={s.address}>
                            {s.address}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StarRating value={s.rating} readOnly size="sm" showText />
                              <span className="text-xs text-slate-400">
                                ({s.totalRatings} {s.totalRatings === 1 ? 'rating' : 'ratings'})
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= USERS TAB CONTENT ================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Requirement: Can apply filters on all listings based on Name, Email, Address, and Role */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Filter users by Name, Email, or Address..."
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={usersRoleFilter}
                  onChange={(e) => setUsersRoleFilter(e.target.value)}
                  className="w-full md:w-48 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Normal User</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>

              {(usersSearch || usersRoleFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setUsersSearch('');
                    setUsersRoleFilter('ALL');
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Requirement: Can view a list of normal and admin users with: Name, Email, Address, Role */}
            {/* Requirement: Can view details of all users, including Name, Email, Address, and Role. If user is a Store Owner, their Rating should also be displayed. */}
            {/* Requirement: All tables should support sorting (ascending/descending) for key fields */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <SortableHeader
                        label="Name"
                        field="name"
                        currentSort={usersSortBy}
                        currentOrder={usersSortOrder}
                        onSort={handleUsersSort}
                      />
                      <SortableHeader
                        label="Email"
                        field="email"
                        currentSort={usersSortBy}
                        currentOrder={usersSortOrder}
                        onSort={handleUsersSort}
                      />
                      <SortableHeader
                        label="Address"
                        field="address"
                        currentSort={usersSortBy}
                        currentOrder={usersSortOrder}
                        onSort={handleUsersSort}
                      />
                      <SortableHeader
                        label="Role"
                        field="role"
                        currentSort={usersSortBy}
                        currentOrder={usersSortOrder}
                        onSort={handleUsersSort}
                      />
                      <SortableHeader
                        label="Store Rating"
                        field="rating"
                        currentSort={usersSortBy}
                        currentOrder={usersSortOrder}
                        onSort={handleUsersSort}
                      />
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No users found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {u.name}
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                            {u.email}
                          </td>
                          <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {u.role === 'ADMIN' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <ShieldCheck className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                            {u.role === 'STORE_OWNER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                <Store className="w-3 h-3" />
                                Store Owner
                              </span>
                            )}
                            {u.role === 'USER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <UserCheck className="w-3 h-3" />
                                Normal User
                              </span>
                            )}
                          </td>
                          {/* Requirement: If the user is a Store Owner, their Rating should also be displayed */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {u.role === 'STORE_OWNER' ? (
                              <div className="flex items-center gap-1.5">
                                <StarRating value={u.storeRating || 0} readOnly size="sm" showText />
                                <span className="text-[11px] text-slate-400">
                                  ({u.storeRatingCount || 0})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedUserDetails(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
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
        )}
      </div>

      {/* Add New Store Modal */}
      {isAddStoreOpen && (
        <AddStoreModal
          onClose={() => setIsAddStoreOpen(false)}
          onSuccess={() => {
            setIsAddStoreOpen(false);
            loadStores();
            loadStats();
            onNotify('New store created successfully!', 'success');
          }}
        />
      )}

      {/* Add New User Modal */}
      {isAddUserOpen && (
        <AddUserModal
          onClose={() => setIsAddUserOpen(false)}
          onSuccess={() => {
            setIsAddUserOpen(false);
            loadUsers();
            loadStats();
            onNotify('New user created successfully!', 'success');
          }}
        />
      )}

      {/* User Details Modal */}
      {selectedUserDetails && (
        <UserDetailsModal
          user={selectedUserDetails}
          onClose={() => setSelectedUserDetails(null)}
        />
      )}
    </div>
  );
}

// Modal for Adding Store
function AddStoreModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('StoreOwner@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validations per documentation:
  // Address: Max 400 characters
  // Email: valid email
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isNameValid = name.trim().length >= 3 && name.trim().length <= 60;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid || !isEmailValid || !isAddressValid) {
      setError('Please satisfy all validation criteria.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.addAdminStore({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerPassword,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to create store.');
      }
    } catch (err) {
      setError('Connection error with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Add New Store</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Organic Market"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@storename.com"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Store Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">{address.length}/400</span>
            </div>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full location address (max 400 chars)"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Owner Initial Password
            </label>
            <input
              type="text"
              required
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Initial password for the store owner to log in and manage this store.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isNameValid || !isEmailValid || !isAddressValid}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for Adding User
// Requirement: Can add new users with details: Name, Email, Password, Address (and Role)
function AddUserModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validations per documentation:
  // Name: Min 20 characters, Max 60 characters
  // Address: Max 400 characters
  // Password: 8-16 characters, at least 1 uppercase and 1 special char
  // Email: valid email
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecial;

  const isFormValid = isNameValid && isEmailValid && isAddressValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please satisfy all validation requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.addAdminUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        password,
        role,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to create user.');
      }
    } catch (err) {
      setError('Connection error with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Add New User</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] ${isNameValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                {name.length}/60 (Min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Christopher James Walker"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              <option value="USER">Normal User</option>
              <option value="ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">{address.length}/400</span>
            </div>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address (max 400 chars)"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
            <div className={isNameValid ? 'text-emerald-700' : 'text-slate-500'}>
              ✓ Name: 20-60 chars
            </div>
            <div className={isAddressValid ? 'text-emerald-700' : 'text-slate-500'}>
              ✓ Address: Up to 400 chars
            </div>
            <div className={isPasswordValid ? 'text-emerald-700' : 'text-slate-500'}>
              ✓ Password: 8-16 chars, 1 uppercase, 1 special char
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for User Details
// Requirement: Can view details of all users, including Name, Email, Address, and Role.
// If the user is a Store Owner, their Rating should also be displayed.
function UserDetailsModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">User Profile Details</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Role</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
              {user.role}
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-0.5">Full Name</label>
            <div className="text-sm font-semibold text-slate-900">{user.name}</div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-0.5">Email Address</label>
            <div className="text-sm font-mono text-slate-700">{user.email}</div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-0.5">Address</label>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{user.address}</div>
          </div>

          {/* Requirement: If the user is a Store Owner, their Rating should also be displayed */}
          {user.role === 'STORE_OWNER' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  Store Owner Rating
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  {user.storeRating ? `${user.storeRating.toFixed(1)} / 5.0` : 'No ratings yet'}
                </span>
              </div>
              <StarRating value={user.storeRating || 0} readOnly size="md" />
              {user.storeName && (
                <div className="text-xs text-emerald-800 pt-1">
                  Store: <strong>{user.storeName}</strong> ({user.storeRatingCount || 0} reviews)
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
