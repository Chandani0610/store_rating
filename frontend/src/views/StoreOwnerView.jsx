import React, { useState, useEffect, useMemo } from 'react';
import { Store, Star, Users, Search, RefreshCw, Calendar, Mail, MapPin, Award, ThumbsUp, Filter, X } from 'lucide-react';
import { api } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';

export default function StoreOwnerView({ user, onNotify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Interactive star filter from distribution bar: null | 1 | 2 | 3 | 4 | 5
  const [starFilter, setStarFilter] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreOwnerDashboard({
        search: debouncedSearch,
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
  }, [debouncedSearch, sortBy, sortOrder]);

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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="inline-flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="font-medium">Loading your store owner dashboard...</span>
        </div>
      </div>
    );
  }

  if (data && !data.hasStore) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Store Assigned</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {data.message || 'There is currently no store linked to your account. Please contact the System Administrator to link your store.'}
        </p>
      </div>
    );
  }

  const { store, averageRating = 0, totalRatings = 0, ratingBreakdown = {}, ratings = [] } = data || {};

  // Additional smart metric: Satisfaction Rate (% of 4 and 5 stars)
  const positiveRatingsCount = (ratingBreakdown[5] || 0) + (ratingBreakdown[4] || 0);
  const satisfactionRate = totalRatings > 0 ? Math.round((positiveRatingsCount / totalRatings) * 100) : 0;

  // Filter ratings client-side if a specific star rating was clicked
  const displayedRatings = starFilter !== null
    ? ratings.filter(r => r.rating === starFilter)
    : ratings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Store Owner Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {store?.name || 'My Store Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{store?.address}</span>
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating Big Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Overall Average Rating
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">out of 5.0</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {totalRatings} total {totalRatings === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <StarRating value={averageRating} readOnly size="lg" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Store Contact: <strong className="text-slate-700 dark:text-slate-200 font-mono">{store?.email}</strong></span>
          </div>
        </div>

        {/* Customer Satisfaction Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Customer Satisfaction
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <ThumbsUp className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {satisfactionRate}%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Positive Feedback
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Based on the proportion of 4-star and 5-star ratings submitted by verified customers.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{positiveRatingsCount}</strong> of {totalRatings} ratings are 4+ stars
          </div>
        </div>

        {/* Rating Breakdown Distribution (Interactive) */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rating Distribution
            </span>
            <span className="text-[11px] text-slate-400">Click bar to filter</span>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingBreakdown?.[stars] || 0;
              const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
              const isSelected = starFilter === stars;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setStarFilter(isSelected ? null : stars)}
                  className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/30'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-transparent'
                  }`}
                  title={`Filter by ${stars} star reviews`}
                >
                  <div className="flex items-center gap-1 w-10 text-slate-700 dark:text-slate-300 font-semibold shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="w-14 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px] shrink-0">
                    <span>{count} ({percentage}%)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviewers List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Customer Reviews & Ratings
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {displayedRatings.length}
            </span>
            {starFilter !== null && (
              <button
                type="button"
                onClick={() => setStarFilter(null)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <span>Showing {starFilter}★ only</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviewer name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                  <SortableHeader
                    label="Customer Name"
                    field="name"
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Customer Email"
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
                    label="Date Submitted"
                    field="date"
                    currentSort={sortBy}
                    currentOrder={sortOrder}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {displayedRatings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No ratings found matching criteria.
                    </td>
                  </tr>
                ) : (
                  displayedRatings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {r.user.name.charAt(0)}
                          </div>
                          <span>{r.user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {r.user.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating value={r.rating} readOnly size="sm" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                            {r.rating}.0
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(r.updatedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}</span>
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
