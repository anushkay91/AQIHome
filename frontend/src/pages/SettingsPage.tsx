import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Trash2, ShieldCheck, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const SettingsPage: React.FC = () => {
  const { household, logout, setHousehold } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(household?.name || '');
  const [city, setCity] = useState(household?.city || 'New Delhi');
  const [budgetTier, setBudgetTier] = useState(household?.budget_tier || 'low_cost_under_500');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;
    setLoading(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateHousehold(household.id, {
        name,
        city,
        budget_tier: budgetTier
      });
      setHousehold(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') return;
    setDeleteLoading(true);

    try {
      await api.deleteAllData();
      logout();
      navigate('/');
    } catch {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Household Settings & Privacy Controls
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage household profile, clean-air preferences, and exercise GDPR/DPDP data sovereignty.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-clean-50 border border-clean-300 text-clean-900 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-clean-700" />
          <span>Household profile successfully updated!</span>
        </div>
      )}

      {/* Household Profile Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Household Configuration
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="set-name">
                Household Name
              </label>
              <input
                id="set-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="set-city">
                City / Smog Zone
              </label>
              <input
                id="set-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" htmlFor="set-budget">
              Preferred Budget Tier
            </label>
            <select
              id="set-budget"
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus-ring bg-white"
            >
              <option value="zero_cost">Zero-Cost Only (Behavioral & Routine: ₹0)</option>
              <option value="low_cost_under_500">Low-Cost (Under ₹500)</option>
              <option value="moderate_under_3000">Moderate (Under ₹3,000)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-clean-600 hover:bg-clean-700 text-white font-semibold text-sm rounded-xl transition focus-ring shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Privacy by Design & Data Deletion */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-red-950">Privacy & Data Sovereignty</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          GharKaGod never tracks precise GPS coordinates, stores medical records, or sells your household habits.
          You retain 100% control over your data.
        </p>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900 block text-sm">Permanent Data Deletion</span>
            <span className="text-xs text-slate-500">
              Permanently purges your account, households, assessment submissions, and action history from the database.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-semibold transition focus-ring flex items-center justify-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete My Household Data</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
                Confirm Permanent Data Deletion
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              This action is permanent and cannot be undone. All your assessments, action history, and household profiles
              will be permanently purged from the server.
            </p>

            <div className="space-y-2">
              <label htmlFor="confirm-delete-input" className="block text-xs font-semibold text-slate-700">
                Type <strong>delete</strong> below to confirm:
              </label>
              <input
                id="confirm-delete-input"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.toLowerCase() !== 'delete' || deleteLoading}
                onClick={handleDeleteAllData}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50"
              >
                {deleteLoading ? 'Purging...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ScientificDisclaimer />

    </div>
  );
};
