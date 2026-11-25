import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon, AlertTriangle, Info,
  ArrowRight, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { AssessmentResult, IdentifiedSource } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const AssessmentResultsPage: React.FC = () => {
  const { household } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const householdId = household?.id;
    if (!householdId) {
      return;
    }
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const res = await api.getLatestAssessment(householdId);
        if (isMounted) setAssessment(res);
      } catch (err) {
        if (isMounted) console.error('Failed to load assessment', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLatest();

    return () => {
      isMounted = false;
    };
  }, [household?.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading assessment results...
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Assessment Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          You haven't run a Pollution Detective assessment for this household yet.
        </p>
        <Link
          to="/detective"
          className="px-6 py-3 rounded-xl bg-clean-600 text-white font-semibold text-sm hover:bg-clean-700 transition"
        >
          Start Assessment Now
        </Link>
      </div>
    );
  }

  const urgentSources = assessment.identified_sources.filter(s => s.severity === 'urgent_safety');
  const prioritySources = assessment.identified_sources.filter(s => s.severity === 'priority_review');
  const concernSources = assessment.identified_sources.filter(s => s.severity === 'potential_concern');

  const renderSourceCard = (source: IdentifiedSource, idx: number) => {
    const isUrgent = source.severity === 'urgent_safety';
    const isPriority = source.severity === 'priority_review';

    return (
      <div
        key={idx}
        className={`p-6 rounded-2xl border shadow-sm space-y-3 ${
          isUrgent
            ? 'bg-red-50/60 border-red-300'
            : isPriority
            ? 'bg-amber-50/40 border-amber-300'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
            ) : isPriority ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-slate-500 shrink-0" />
            )}
            <h3 className="font-bold text-slate-900 text-base">{source.source_name}</h3>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
              isUrgent
                ? 'bg-red-200 text-red-950 border border-red-300'
                : isPriority
                ? 'bg-amber-200 text-amber-950 border border-amber-300'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {source.severity.replace(/_/g, ' ')}
          </span>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{source.why_it_matters}</p>

        {/* Pollutants Pill List */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-500">Possible Contaminants:</span>
          {source.possible_pollutants.map((p, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-xs font-medium bg-white border border-slate-200 text-slate-800"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Evidence & Reference Footer */}
        <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Ref: {source.evidence_reference}</span>
          </span>
          <span className="italic text-slate-400">{source.confidence_note}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-clean-700">Module 1 Results</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Identified Household Pollution Vectors
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Found <strong>{assessment.identified_sources.length}</strong> potential indoor risk factors for {household?.name}.
          </p>
        </div>

        <Link
          to="/recommendations"
          className="px-6 py-3 rounded-xl bg-clean-600 hover:bg-clean-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 focus-ring"
        >
          <span>View Tailored Affordable Actions</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Urgent Safety Sources */}
      {urgentSources.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-950">Urgent Safety Hazards ({urgentSources.length})</h2>
          </div>
          <div className="space-y-4">
            {urgentSources.map(renderSourceCard)}
          </div>
        </section>
      )}

      {/* Priority Review Sources */}
      {prioritySources.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Priority for Review ({prioritySources.length})</h2>
          </div>
          <div className="space-y-4">
            {prioritySources.map(renderSourceCard)}
          </div>
        </section>
      )}

      {/* Potential Concern Sources */}
      {concernSources.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900">Potential Concerns ({concernSources.length})</h2>
          </div>
          <div className="space-y-4">
            {concernSources.map(renderSourceCard)}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <div className="p-6 rounded-2xl bg-clean-50 border border-clean-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-clean-950">
          Ready to reduce your family's exposure?
        </h3>
        <p className="text-sm text-clean-800 max-w-xl mx-auto">
          We have synthesized these findings into prioritized, low-cost and no-cost interventions personalized for your home.
        </p>
        <Link
          to="/recommendations"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-clean-600 hover:bg-clean-700 text-white font-semibold text-sm shadow transition focus-ring"
        >
          <span>Explore Affordable Recommendations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ScientificDisclaimer />

    </div>
  );
};
