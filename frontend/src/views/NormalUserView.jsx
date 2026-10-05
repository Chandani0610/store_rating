import React, { useState, useEffect, useMemo } from 'react';
import { Store, Search, Star, Edit3, PlusCircle, RefreshCw, X, AlertCircle, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';

export default function NormalUserView({ onNotify }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Quick filter logic: 'ALL' | 'RATED_BY_ME' | 'UNRATED' | 'TOP_RATED' | 'HIGH_RATED'
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Rating Modal state
  const [activeStoreForRating, setActiveStoreForRating] = useState(null);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await api.getStores({
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });
      if (res.success) {
        setStores(res.stores);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [debouncedSearch, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = stores.length;
    const myRatedCount = stores.filter(s => s.userSubmittedRating !== null && s.userSubmittedRating > 0).length;
    const sumOverall = stores.reduce((acc, s) => acc + (s.overallRating || 0), 0);
    const avgOverall = total > 0 ? (sumOverall / total).toFixed(1) : '0.0';
    return { total, myRatedCount, avgOverall };
  }, [stores]);

  // Client-side quick filter logic
  const filteredStores = useMemo(() => {
    if (activeFilter === 'RATED_BY_ME') {
      return stores.filter(s => s.userSubmittedRating !== null && s.userSubmittedRating > 0);
    }
    if (activeFilter === 'UNRATED') {
      return stores.filter(s => s.userSubmittedRating === null || s.userSubmittedRating === 0);
    }
    if (activeFilter === 'TOP_RATED') {
      return stores.filter(s => s.overallRating >= 4.5);
    }
    if (activeFilter === 'HIGH_RATED') {
      return stores.filter(s => s.overallRating >= 4.0);
    }
    return stores;
  }, [stores, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Customer Rating Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Stores Directory & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore registered local stores, compare overall ratings, and submit or modify your personal feedback.
          </p>
        </div>

        <button
          onClick={loadStores}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-xs transition-all self-start md:self-auto cursor-pointer active:scale-95"
          title="Refresh stores directory"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Stores</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Stores You Rated</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.myRatedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform Average</span>
            <div className="text-2xl font-black text-amber-500 mt-1">{stats.avgOverall} <span className="text-xs text-slate-400 font-normal">/ 5.0</span></div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Search Bar & Quick Filters */}
      <div className="space-y-3">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by Name or Address (Live debounced search)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Quick Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Stores', count: stores.length },
            { id: 'RATED_BY_ME', label: 'My Reviews', count: stats.myRatedCount },
            { id: 'UNRATED', label: 'Unrated by Me', count: stats.total - stats.myRatedCount },
            { id: 'TOP_RATED', label: 'Top Rated (4.5+ ★)', count: stores.filter(s => s.overallRating >= 4.5).length },
            { id: 'HIGH_RATED', label: 'High Rated (4.0+ ★)', count: stores.filter(s => s.overallRating >= 4.0).length },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                <SortableHeader
                  label="Store Name"
                  field="name"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Address"
                  field="address"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Overall Rating"
                  field="overallRating"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Your Rating"
                  field="userRating"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Loading stores directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400">
                    <Store className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <span>No stores found matching your criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const hasRated = store.userSubmittedRating !== null && store.userSubmittedRating > 0;

                  return (
                    <tr
                      key={store.id}
                      className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Store Name */}
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                            {store.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {store.name}
                            </div>
                            <span className="text-[11px] text-slate-400 font-normal">Store ID #{store.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-sm truncate" title={store.address}>
                        {store.address}
                      </td>

                      {/* Overall Rating */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StarRating value={store.overallRating} readOnly size="sm" showText />
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                            ({store.totalRatings} {store.totalRatings === 1 ? 'vote' : 'votes'})
                          </span>
                        </div>
                      </td>

                      {/* User's Submitted Rating */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {hasRated ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{store.userSubmittedRating} / 5 Stars</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                            Not rated yet
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {hasRated ? (
                          <button
                            type="button"
                            onClick={() => setActiveStoreForRating(store)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modify Rating</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveStoreForRating(store)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-indigo-500/20 active:scale-95"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Submit Rating</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Submission / Modification Modal */}
      {activeStoreForRating && (
        <RatingModal
          store={activeStoreForRating}
          onClose={() => setActiveStoreForRating(null)}
          onSuccess={(newRating, isMod) => {
            setActiveStoreForRating(null);
            loadStores();
            onNotify(
              isMod
                ? `Updated rating to ${newRating} stars for ${activeStoreForRating.name}`
                : `Submitted rating of ${newRating} stars for ${activeStoreForRating.name}`,
              'success'
            );
          }}
        />
      )}
    </div>
  );
}

function RatingModal({ store, onClose, onSuccess }) {
  const isModification = store.userSubmittedRating !== null && store.userSubmittedRating > 0;
  const [rating, setRating] = useState(store.userSubmittedRating || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ratingDescriptions = {
    1: '1 Star - Poor experience',
    2: '2 Stars - Fair experience',
    3: '3 Stars - Good store',
    4: '4 Stars - Very good quality',
    5: '5 Stars - Outstanding & Recommended',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitRating(store.id, rating);
      if (res.success) {
        onSuccess(rating, isModification);
      } else {
        setError(res.message || 'Failed to submit rating.');
      }
    } catch (err) {
      setError('Connection error with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">
              {isModification ? 'Modify Your Store Rating' : 'Submit Store Rating'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-center">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{store.name}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto truncate">{store.address}</p>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Your Rating (1 to 5 Stars)
            </div>
            <StarRating value={rating} onChange={(val) => setRating(val)} size="xl" />
            <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {ratingDescriptions[rating]}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting...' : isModification ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
