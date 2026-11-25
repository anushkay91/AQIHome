import React, { useState, useEffect } from 'react';
import {
  Filter, CheckCircle2, X, Send, Bot, BookOpen, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { Recommendation, ExplainResponse, TrackedAction } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const RecommendationsPage: React.FC = () => {
  const { household } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trackedActions, setTrackedActions] = useState<TrackedAction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCost, setSelectedCost] = useState<string>('all');

  // Gemini AI Modal state
  const [activeRecForAi, setActiveRecForAi] = useState<Recommendation | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [aiResponse, setAiResponse] = useState<ExplainResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const householdId = household?.id;
    if (!householdId) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        const [recs, tracked] = await Promise.all([
          api.getRecommendations(householdId),
          api.getTrackedActions(householdId)
        ]);
        if (isMounted) {
          setRecommendations(recs);
          setTrackedActions(tracked);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load recommendations', err);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [household?.id]);

  const handleOpenAiExplainer = async (rec: Recommendation) => {
    setActiveRecForAi(rec);
    setAiResponse(null);
    setCustomQuestion('');
    setAiLoading(true);

    if (!household) return;

    try {
      const exp = await api.explainRecommendation(household.id, rec.id, {
        question: undefined,
        language_preference: aiLanguage
      });
      setAiResponse(exp);
    } catch (err) {
      console.error('Failed to get explanation', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !activeRecForAi || !customQuestion.trim()) return;
    setAiLoading(true);

    try {
      const exp = await api.explainRecommendation(household.id, activeRecForAi.id, {
        question: customQuestion.trim(),
        language_preference: aiLanguage
      });
      setAiResponse(exp);
    } catch (err) {
      console.error('Failed follow up', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleTrackAction = async (rec: Recommendation) => {
    if (!household) return;
    const existing = trackedActions.find(a => a.action_key === rec.action_key);

    try {
      if (existing) {
        const nextStatus = existing.status === 'completed' ? 'planned' : 'completed';
        const updated = await api.updateTrackedAction(household.id, existing.id, {
          status: nextStatus
        });
        setTrackedActions(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await api.createTrackedAction(household.id, {
          recommendation_id: rec.id,
          action_key: rec.action_key,
          title: rec.title,
          category: rec.category,
          status: 'completed',
          notes: 'Marked as completed from recommendations'
        });
        setTrackedActions(prev => [...prev, created]);
      }
    } catch (err) {
      console.error('Error toggling tracked action', err);
    }
  };

  const filteredRecs = recommendations.filter(r => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesCost = selectedCost === 'all' || r.cost_category === selectedCost;
    return matchesCat && matchesCost;
  });

  const getPriorityBadge = (tier: string) => {
    switch (tier) {
      case 'urgent_safety':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">Urgent Safety</span>;
      case 'high_impact':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-clean-100 text-clean-900 border border-clean-300">High Impact</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">Routine Habit</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-clean-700">Module 2</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Affordable Clean-Air Actions
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Prioritized by safety, physical reduction mechanism, cost feasibility, and outdoor smog conditions.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
            <Filter className="w-4 h-4" />
            <span>Category:</span>
          </div>

          {[
            { id: 'all', label: 'All Categories' },
            { id: 'combustion_heating', label: 'Combustion & Heating' },
            { id: 'cooking_smoke', label: 'Cooking & Exhaust' },
            { id: 'dust_and_cleaning', label: 'Dust & Cleaning' },
            { id: 'ventilation_timing', label: 'Ventilation Timing' },
            { id: 'air_cleaning', label: 'Air Cleaning (DIY)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition focus-ring ${
                selectedCategory === cat.id
                  ? 'bg-clean-700 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cost Filter */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 mr-2">Budget:</span>
          {[
            { id: 'all', label: 'All Costs' },
            { id: 'free_no_cost', label: 'Zero-Cost (₹0)' },
            { id: 'under_500_inr', label: 'Under ₹500' },
            { id: 'under_3000_inr', label: 'Under ₹3,000' },
          ].map((cost) => (
            <button
              key={cost.id}
              onClick={() => setSelectedCost(cost.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition focus-ring ${
                selectedCost === cost.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cost.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {filteredRecs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          No recommendations match your selected filters. Try choosing "All Categories" or running a new assessment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecs.map((rec) => {
            const isUrgent = rec.priority_tier === 'urgent_safety';
            const tracked = trackedActions.find(a => a.action_key === rec.action_key);
            const isCompleted = tracked?.status === 'completed';

            return (
              <div
                key={rec.id}
                className={`rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition ${
                  isUrgent
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-200 bg-white hover:border-clean-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {getPriorityBadge(rec.priority_tier)}

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        {rec.cost_category === 'free_no_cost' ? '₹0 (Free)' : `~₹${rec.estimated_cost_inr}`}
                      </span>
                      <span className="text-[10px] text-slate-400">Illustrative Estimate</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-snug">
                    {rec.title}
                  </h3>

                  <div className="mt-2 text-xs text-clean-800 font-medium bg-clean-50 px-2.5 py-1 rounded-lg border border-clean-200 inline-block">
                    Triggered by: {rec.household_trigger}
                  </div>

                  <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                    {rec.qualitative_impact}
                  </p>

                  {/* Safety Boundary / Limitations */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-800 block">Boundary & Limitations:</span>
                    <p>{rec.limitations}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Ask Gemini AI Button */}
                  <button
                    onClick={() => handleOpenAiExplainer(rec)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition focus-ring"
                  >
                    <Bot className="w-4 h-4 text-purple-700" />
                    <span>Explain with GharKaGod AI</span>
                  </button>

                  {/* Impact Tracker Toggle */}
                  <button
                    onClick={() => handleToggleTrackAction(rec)}
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition focus-ring ${
                      isCompleted
                        ? 'bg-clean-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? 'Completed ✓' : 'Mark as Adopted'}</span>
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gemini AI Contextual Explanation Modal */}
      {activeRecForAi && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-explainer-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="ai-explainer-title" className="text-lg font-bold text-slate-900">
                    GharKaGod AI Assistant
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evidence-Based Clean Air Coach • Google Gemini API
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveRecForAi(null)}
                aria-label="Close dialog"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Action Info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Explaining Action: </span>
              <span className="font-bold text-slate-900">{activeRecForAi.title}</span>
            </div>

            {/* AI Response Display */}
            {aiLoading ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-sm text-slate-600 font-medium">
                  GharKaGod AI is preparing your contextual explanation...
                </p>
              </div>
            ) : aiResponse ? (
              <div className="space-y-4 text-sm">
                
                {/* Generation Flag Badge */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    aiResponse.is_ai_generated
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {aiResponse.is_ai_generated ? '✨ Gemini GenAI Contextualized' : '🛡️ Verified Deterministic Fallback'}
                  </span>
                  <span className="text-slate-400 text-[11px]">Strict Scientific Honesty Guard Active</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 space-y-2">
                  <p className="font-semibold text-purple-950">Why This Matters For Your Home:</p>
                  <p className="text-slate-800 leading-relaxed">{aiResponse.answer}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Scientific Mechanism:</span>
                    <p className="text-slate-600">{aiResponse.scientific_rationale}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-clean-50 border border-clean-200">
                    <span className="font-bold text-clean-950 block mb-1">Practical Tip:</span>
                    <p className="text-clean-900">{aiResponse.practical_tip}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-950 block mb-1">Safety Boundary:</span>
                  <p className="text-amber-900">{aiResponse.safety_boundary}</p>
                </div>

                <div className="pt-2 text-xs text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Authoritative Citation: {aiResponse.source_reference}</span>
                </div>

              </div>
            ) : null}

            {/* Custom Question Form */}
            <form onSubmit={handleAskFollowup} className="pt-4 border-t border-slate-100 space-y-3">
              <label htmlFor="user-followup" className="block text-xs font-semibold text-slate-700">
                Ask a follow-up question about this action:
              </label>
              <div className="flex gap-2">
                <input
                  id="user-followup"
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="e.g. How do I seal doors if I only have old towels?"
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus-ring"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !customQuestion.trim()}
                  className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold hover:bg-purple-800 disabled:opacity-50 transition flex items-center gap-1 focus-ring"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <ScientificDisclaimer />

    </div>
  );
};
