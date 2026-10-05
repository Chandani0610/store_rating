import React, { useState, useEffect } from 'react';
import { 
  Users, Store, Star, Plus, Search, Filter, RefreshCw, 
  ShieldCheck, UserCheck, Eye, X, Check, AlertCircle 
} from 'lucide-react';
import { api } from '../api';
import { useDebounce } from '../hooks/useDebounce';
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
  const debouncedStoresSearch = useDebounce(storesSearch, 300);
  const [storesSortBy, setStoresSortBy] = useState('name');
  const [storesSortOrder, setStoresSortOrder] = useState('asc');

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const debouncedUsersSearch = useDebounce(usersSearch, 300);
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
        search: debouncedStoresSearch,
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
        search: debouncedUsersSearch,
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
    }
  }, [activeTab, debouncedStoresSearch, storesSortBy, storesSortOrder]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, debouncedUsersSearch, usersRoleFilter, usersSortBy, usersSortOrder]);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            System Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform oversight, stores registry, user governance, and metrics analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadStats();
              if (activeTab === 'stores') loadStores();
              else loadUsers();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>Refresh Dashboard</span>
          </button>
        </div>
      </div>

      {/* Modern 3-Column Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Users
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalUsers}
            </span>
            <span className="text-xs text-slate-400 font-medium">registered accounts</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium">
              Users: {stats.rolesBreakdown?.USER || 0}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
              Owners: {stats.rolesBreakdown?.STORE_OWNER || 0}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium">
              Admins: {stats.rolesBreakdown?.ADMIN || 0}
            </span>
          </div>
        </div>

        {/* Total Stores */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Stores
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalStores}
            </span>
            <span className="text-xs text-slate-400 font-medium">registered stores</span>
          </div>
          <div className="mt-4 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All stores active and open for customer ratings</span>
          </div>
        </div>

        {/* Total Ratings Submitted */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Feedback Ratings
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalRatings}
            </span>
            <span className="text-xs text-slate-400 font-medium">verified submissions</span>
          </div>
          <div className="mt-4 text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-800">
            Ratings strictly adhere to 1-to-5 star scale
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2 gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('stores')}
              className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'stores'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Stores Directory</span>
              <span className={`ml-1 px-2 py-0.5 text-[10px] rounded-full font-mono ${
                activeTab === 'stores' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {stores.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'users'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Management</span>
              <span className={`ml-1 px-2 py-0.5 text-[10px] rounded-full font-mono ${
                activeTab === 'users' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {users.length}
              </span>
            </button>
          </div>

          <div>
            {activeTab === 'stores' ? (
              <button
                type="button"
                onClick={() => setIsAddStoreOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Store</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
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
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storesSearch}
                  onChange={(e) => setStoresSearch(e.target.value)}
                  placeholder="Filter stores by Name, Email, or Address (Live debounced)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
              {storesSearch && (
                <button
                  type="button"
                  onClick={() => setStoresSearch('')}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                    {storesLoading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 mx-auto mb-1" />
                          <span>Loading stores...</span>
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
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 text-xs font-bold border border-violet-500/20">
                                {s.name.charAt(0)}
                              </div>
                              <span>{s.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                            {s.email}
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={s.address}>
                            {s.address}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StarRating value={s.rating} readOnly size="sm" showText />
                              <span className="text-xs text-slate-400 font-mono">
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
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Filter users by Name, Email, or Address (Live debounced)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Role filter dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={usersRoleFilter}
                  onChange={(e) => setUsersRoleFilter(e.target.value)}
                  className="w-full md:w-48 px-3 py-2 text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
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
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
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
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 mx-auto mb-1" />
                          <span>Loading users...</span>
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
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                            {u.name}
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                            {u.email}
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {u.role === 'ADMIN' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Admin
                              </span>
                            )}
                            {u.role === 'STORE_OWNER' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                <Store className="w-3.5 h-3.5" />
                                Store Owner
                              </span>
                            )}
                            {u.role === 'USER' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                                <UserCheck className="w-3.5 h-3.5" />
                                Normal User
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {u.role === 'STORE_OWNER' ? (
                              <div className="flex items-center gap-1.5">
                                <StarRating value={u.storeRating || 0} readOnly size="sm" showText />
                                <span className="text-[11px] text-slate-400 font-mono">
                                  ({u.storeRatingCount || 0})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 font-mono text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedUserDetails(u)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
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
            onNotify('New store registered successfully!', 'success');
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
            onNotify('New user registered successfully!', 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg overflow-hidden transition-colors">
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Add New Store</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Organic Market"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@storename.com"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Store Address <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] font-mono ${isAddressValid ? 'text-emerald-500' : 'text-slate-400'}`}>
                {address.length}/400
              </span>
            </div>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full location address (max 400 chars)"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store Owner Initial Password
            </label>
            <input
              type="text"
              required
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Initial password for the store owner to log in and manage their store dashboard.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isNameValid || !isEmailValid || !isAddressValid}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
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
function AddUserModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg overflow-hidden transition-colors">
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Add New User</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] font-mono ${isNameValid ? 'text-emerald-500' : 'text-slate-400'}`}>
                {name.length}/60 (Min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Christopher James Walker"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
            >
              <option value="USER">Normal User</option>
              <option value="ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Address <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[10px] font-mono ${isAddressValid ? 'text-emerald-500' : 'text-slate-400'}`}>
                {address.length}/400
              </span>
            </div>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address (max 400 chars)"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-1">
            <div className={`flex items-center gap-1.5 ${isNameValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
              <Check className="w-3 h-3" />
              <span>Name: 20-60 chars</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isAddressValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
              <Check className="w-3 h-3" />
              <span>Address: Up to 400 chars</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isPasswordValid ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
              <Check className="w-3 h-3" />
              <span>Password: 8-16 chars, 1 uppercase, 1 special char</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
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
function UserDetailsModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md overflow-hidden transition-colors">
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">User Profile Details</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {user.role}
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-0.5">Full Name</label>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-0.5">Email Address</label>
            <div className="text-sm font-mono text-slate-700 dark:text-slate-300">{user.email}</div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-0.5">Address</label>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{user.address}</div>
          </div>

          {user.role === 'STORE_OWNER' && (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Store Owner Rating
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  {user.storeRating ? `${user.storeRating.toFixed(1)} / 5.0` : 'No ratings yet'}
                </span>
              </div>
              <StarRating value={user.storeRating || 0} readOnly size="md" />
              {user.storeName && (
                <div className="text-xs text-emerald-800 dark:text-emerald-300 pt-1">
                  Assigned Store: <strong>{user.storeName}</strong> ({user.storeRatingCount || 0} reviews)
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
