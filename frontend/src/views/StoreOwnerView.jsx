import React, { useState, useEffect } from 'react';
import { Store, Star, Users, Search, RefreshCw, Calendar, Mail, MapPin, Award } from 'lucide-react';
import { api } from '../api';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';

export default function StoreOwnerView({ user, onNotify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreOwnerDashboard({
        search,
        sortBy,
        sortOrder,
      });
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading your store owner dashboard...
      </div>
    );
  }

  if (data && !data.hasStore) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Store Assigned</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {data.message || 'There is currently no store linked to your account. Please contact the System Administrator to link your store.'}
        </p>
      </div>
    );
  }

  const { store, averageRating, totalRatings, ratingBreakdown, ratings } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Store Owner Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {store?.name || 'My Store Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{store?.address}</span>
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Requirement: Dashboard functionalities:
          - See the average rating of their store
          - View a list of users who have submitted ratings for their store */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Rating Big Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Average Rating
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-600">out of 5.0</span>
                <span className="text-xs text-slate-400">
                  {totalRatings} total {totalRatings === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <StarRating value={averageRating} readOnly size="lg" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Store Email: <strong className="text-slate-700 font-mono">{store?.email}</strong></span>
          </div>
        </div>

        {/* Rating Breakdown Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rating Distribution
            </span>
            <span className="text-xs font-medium text-slate-400">
              All ratings (1 to 5)
            </span>
          </div>

          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingBreakdown?.[stars] || 0;
              const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-slate-600 font-medium">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="w-16 text-right text-slate-500 font-mono">
                    <span>{count} ({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requirement: View a list of users who have submitted ratings for their store */}
      {/* Requirement: All tables should support sorting (ascending/descending) for key fields */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Users Who Submitted Ratings
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {ratings?.length || 0}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <SortableHeader
                    label="User Name"
                    field="name"
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="User Email"
                    field="email"
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Rating Given"
                    field="rating"
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Submitted / Updated Date"
                    field="date"
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {ratings?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No ratings submitted yet for your store.
                    </td>
                  </tr>
                ) : (
                  ratings?.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {r.user.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {r.user.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating value={r.rating} readOnly size="sm" />
                          <span className="text-xs font-semibold text-slate-700 ml-1">
                            {r.rating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(r.updatedAt || r.ratedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
    </div>
  );
}
