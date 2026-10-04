import React, { useState, useEffect } from 'react';
import { Store, Search, Star, Edit3, PlusCircle, CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { api } from '../api';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';

export default function NormalUserView({ onNotify }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Rating Modal
  const [activeStoreForRating, setActiveStoreForRating] = useState(null);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await api.getStores({
        search,
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
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Stores Directory & Reviews
          </h1>
          <p className="text-sm text-slate-500">
            Browse registered stores, view overall ratings, and submit or modify your ratings
          </p>
        </div>
        <div>
          <button
            onClick={loadStores}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Requirement: Can search for stores by Name and Address */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by Name or Address..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl whitespace-nowrap"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Requirement: Store listings should display:
          - Store Name
          - Address
          - Overall Rating
          - User's Submitted Rating
          - Option to submit a rating
          - Option to modify their submitted rating */}
      {/* Requirement: All tables should support sorting (ascending/descending) for key fields */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
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
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading stores...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No stores found matching your search.
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const hasRated = store.userSubmittedRating !== null && store.userSubmittedRating > 0;

                  return (
                    <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Store Name */}
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold border border-indigo-100">
                            {store.name.charAt(0)}
                          </div>
                          <span>{store.name}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4 text-slate-600 max-w-sm truncate" title={store.address}>
                        {store.address}
                      </td>

                      {/* Overall Rating */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StarRating value={store.overallRating} readOnly size="sm" showText />
                          <span className="text-xs text-slate-400">
                            ({store.totalRatings} {store.totalRatings === 1 ? 'vote' : 'votes'})
                          </span>
                        </div>
                      </td>

                      {/* User's Submitted Rating */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {hasRated ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{store.userSubmittedRating} / 5 Stars</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Not rated yet
                          </span>
                        )}
                      </td>

                      {/* Action: Option to submit rating / Option to modify submitted rating */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {hasRated ? (
                          <button
                            type="button"
                            onClick={() => setActiveStoreForRating(store)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modify Rating</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveStoreForRating(store)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
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

// Requirement: Can submit ratings (between 1 to 5) for individual stores.
// Option to submit a rating / Option to modify their submitted rating
function RatingModal({ store, onClose, onSuccess }) {
  const isModification = store.userSubmittedRating !== null && store.userSubmittedRating > 0;
  const [rating, setRating] = useState(store.userSubmittedRating || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ratingDescriptions = {
    1: '1 Star - Poor',
    2: '2 Stars - Fair',
    3: '3 Stars - Good',
    4: '4 Stars - Very Good',
    5: '5 Stars - Excellent',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <h3 className="font-semibold text-slate-800">
              {isModification ? 'Modify Your Rating' : 'Submit Rating'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-center">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="text-lg font-bold text-slate-900">{store.name}</div>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto truncate">{store.address}</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Score (1 to 5)
            </div>
            <StarRating value={rating} onChange={(val) => setRating(val)} size="xl" />
            <div className="text-sm font-semibold text-indigo-600">
              {ratingDescriptions[rating]}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
            >
              {loading ? 'Submitting...' : isModification ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
