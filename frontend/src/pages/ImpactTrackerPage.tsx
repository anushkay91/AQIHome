import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, TrendingUp, Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { TrackerSummary, TrackedAction } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const ImpactTrackerPage: React.FC = () => {
  const { household } = useAuth();
  const [summary, setSummary] = useState<TrackerSummary | null>(null);
  const [actions, setActions] = useState<TrackedAction[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');

  useEffect(() => {
    const householdId = household?.id;
    if (!householdId) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        const [sumRes, actRes] = await Promise.all([
          api.getTrackerSummary(householdId),
          api.getTrackedActions(householdId)
        ]);
        if (isMounted) {
          setSummary(sumRes);
          setActions(actRes);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load impact tracker data', err);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [household?.id]);

  const handleUpdateStatus = async (action: TrackedAction, newStatus: 'planned' | 'started' | 'completed' | 'skipped') => {
    if (!household) return;
    try {
      const updated = await api.updateTrackedAction(household.id, action.id, {
        status: newStatus
      });
      setActions(prev => prev.map(a => a.id === updated.id ? updated : a));
      const freshSummary = await api.getTrackerSummary(household.id);
      setSummary(freshSummary);
    } catch (err) {
      console.error('Failed to update action status', err);
    }
  };

  const handleSaveNotes = async (actionId: string) => {
    if (!household) return;
    try {
      const updated = await api.updateTrackedAction(household.id, actionId, {
        notes: notesText
      });
      setActions(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditingNotesId(null);
    } catch (err) {
      console.error('Failed to save action notes', err);
    }
  };

  const filteredActions = actions.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-clean-700">Module 3</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Household Impact Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track adherence to evidence-based clean-air habits and compare lifestyle changes over time.
          </p>
        </div>

        <Link
          to="/recommendations"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition focus-ring text-center"
        >
          + Add Recommended Actions
        </Link>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Habit Completion Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-clean-700">{summary.completion_rate_percent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-clean-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, summary.completion_rate_percent)}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Actions Adopted</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{summary.completed_count}</span>
              <span className="text-xs text-slate-500">of {summary.total_actions} planned</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Active protective routines</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Sources Addressed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{summary.sources_addressed_count}</span>
              <span className="text-xs text-slate-500">of {summary.total_sources_identified} identified</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Targeted risk vectors</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Actions In-Progress</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-amber-600">{summary.started_count}</span>
              <span className="text-xs text-slate-500">in rollout</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Habits currently being established</p>
          </div>

        </div>
      )}

      {/* Directional Impact Mechanism Explanation */}
      {summary && (
        <div className="bg-clean-50/70 border border-clean-200 p-6 rounded-2xl">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-clean-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-bold text-clean-950 text-base">Directional Environmental Benefit:</h2>
              <p className="text-sm text-clean-900 leading-relaxed">
                {summary.directional_impact_summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions Table & Habit Status Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filter Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-bold text-slate-900 text-lg">Household Action Log</h2>

          <div className="flex items-center gap-2">
            {['all', 'completed', 'started', 'planned', 'skipped'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition focus-ring ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredActions.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No actions match the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActions.map((action) => {
              const isEditingNotes = editingNotesId === action.id;

              return (
                <div key={action.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition space-y-3">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {action.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-100 border text-slate-700">
                          {action.category.replace(/_/g, ' ')}
                        </span>
                        {action.completed_at && (
                          <span className="flex items-center gap-1 text-clean-700 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Completed on {new Date(action.completed_at).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Changer Buttons */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      {(['planned', 'started', 'completed', 'skipped'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(action, st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition focus-ring ${
                            action.status === st
                              ? st === 'completed'
                                ? 'bg-clean-600 text-white shadow-sm'
                                : st === 'started'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="pt-2 text-xs">
                    {isEditingNotes ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Add reflection or routine note (e.g. 'Installed weatherstrip on south door')"
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus-ring"
                        />
                        <button
                          onClick={() => handleSaveNotes(action.id)}
                          className="px-3 py-1.5 bg-clean-600 text-white rounded-lg font-semibold hover:bg-clean-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1.5 text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-semibold text-slate-700">Notes:</span>
                        <span className="italic">{action.notes || 'No notes added yet.'}</span>
                        <button
                          onClick={() => {
                            setEditingNotesId(action.id);
                            setNotesText(action.notes || '');
                          }}
                          className="text-clean-700 hover:underline font-semibold ml-2 inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{action.notes ? 'Edit' : 'Add Note'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Scientific Transparency Disclaimer */}
      <ScientificDisclaimer />

    </div>
  );
};
