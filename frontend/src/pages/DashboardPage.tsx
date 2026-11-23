import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wind, Activity, Sparkles, CheckSquare, AlertTriangle,
  ArrowRight, RefreshCw, ChevronRight, AlertOctagon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { OutdoorAqiContext, AssessmentResult, TrackerSummary } from '../types';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const DashboardPage: React.FC = () => {
  const { household, isGuestDemo } = useAuth();

  const [outdoorAqi, setOutdoorAqi] = useState<OutdoorAqiContext | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | null>(null);
  const [trackerSummary, setTrackerSummary] = useState<TrackerSummary | null>(null);
  const [refreshingAqi, setRefreshingAqi] = useState<boolean>(false);

  const loadDashboardData = async () => {
    if (!household) return;
    try {
      const aqiPromise = api.getOutdoorAqi(household.city);
      const assessPromise = api.getLatestAssessment(household.id).catch(() => null);
      const trackerPromise = api.getTrackerSummary(household.id).catch(() => null);

      const [aqiRes, assessRes, trackerRes] = await Promise.all([
        aqiPromise, assessPromise, trackerPromise
      ]);

      setOutdoorAqi(aqiRes);
      setLatestAssessment(assessRes);
      setTrackerSummary(trackerRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [household?.id, household?.city]);

  const handleRefreshAqi = async () => {
    if (!household?.city) return;
    setRefreshingAqi(true);
    try {
      const fresh = await api.getOutdoorAqi(household.city);
      setOutdoorAqi(fresh);
    } catch {
      // Ignore
    } finally {
      setRefreshingAqi(false);
    }
  };

  const getAqiColorClasses = (category: string) => {
    switch (category.toLowerCase()) {
      case 'good':
        return { badge: 'bg-emerald-600 text-white' };
      case 'satisfactory':
        return { badge: 'bg-green-600 text-white' };
      case 'moderate':
        return { badge: 'bg-yellow-500 text-slate-900' };
      case 'poor':
        return { badge: 'bg-orange-600 text-white' };
      case 'very poor':
        return { badge: 'bg-red-600 text-white' };
      default:
        return { badge: 'bg-rose-900 text-white' };
    }
  };

  const urgentHazards = latestAssessment?.identified_sources.filter(s => s.severity === 'urgent_safety') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {household?.name || 'Welcome Home'}
            </h1>
            {isGuestDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                Guest Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Monitoring household air hygiene for <strong>{household?.city}</strong> • Dwelling: {household?.dwelling_type?.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/detective"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-clean-600 hover:bg-clean-700 shadow-sm transition flex items-center gap-1.5 focus-ring"
          >
            <Activity className="w-4 h-4" />
            <span>{latestAssessment ? 'Reassess Household' : 'Run Pollution Detective'}</span>
          </Link>
        </div>
      </div>

      {/* Urgent Safety Hazard Callout (if active) */}
      {urgentHazards.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-red-200 text-red-900 uppercase tracking-wide">
                Critical Safety Alert
              </span>
              <h2 className="text-lg font-bold text-red-950">
                {urgentHazards.length} Acute Combustion Hazard(s) Identified
              </h2>
              <div className="space-y-2 text-sm text-red-900">
                {urgentHazards.map((h, i) => (
                  <div key={i} className="bg-white/80 p-3 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-950">{h.source_name}</p>
                    <p className="text-xs text-red-800 mt-0.5">{h.why_it_matters}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Link
                  to="/recommendations"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-900 underline"
                >
                  <span>Review Urgent Safety Mitigations Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Real-Time Outdoor AQI & Habit Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1 & 2: Outdoor Air Quality & Ventilation Guidance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Outdoor Smog Level</h2>
                  <p className="text-xs text-slate-500">
                    Live Open-Meteo European Atmosphere Service • CPCB NAQI Standard
                  </p>
                </div>
              </div>

              <button
                onClick={handleRefreshAqi}
                disabled={refreshingAqi}
                title="Refresh outdoor air quality"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition focus-ring"
              >
                <RefreshCw className={`w-4 h-4 ${refreshingAqi ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {outdoorAqi ? (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {outdoorAqi.aqi}
                    </span>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getAqiColorClasses(outdoorAqi.aqi_category).badge}`}>
                        {outdoorAqi.aqi_category}
                      </span>
                      <span className="block text-xs text-slate-500 mt-1">National Air Quality Index (NAQI)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                    <div>
                      <span className="font-semibold block text-slate-900">{outdoorAqi.pm25} µg/m³</span>
                      <span>Fine PM2.5</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-900">{outdoorAqi.pm10} µg/m³</span>
                      <span>Coarse PM10</span>
                    </div>
                    {outdoorAqi.no2 && (
                      <div>
                        <span className="font-semibold block text-slate-900">{outdoorAqi.no2} µg/m³</span>
                        <span>Gas NO₂</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specific Ventilation Advisory */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-sm">
                  <p className="font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Dynamic Ventilation Advisory:</span>
                  </p>
                  <p className="text-amber-900 leading-relaxed text-xs sm:text-sm">
                    {outdoorAqi.ventilation_advisory}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Fetching outdoor air quality data...
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified regional station reading</span>
            <span>Refreshed: {outdoorAqi ? new Date(outdoorAqi.timestamp).toLocaleTimeString() : '...'}</span>
          </div>
        </div>

        {/* Card 3: Impact Tracker Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Habit Progress</h2>
                  <p className="text-xs text-slate-500">Impact Tracker Summary</p>
                </div>
              </div>
              <Link to="/tracker" className="text-xs text-clean-700 font-semibold hover:underline flex items-center gap-0.5">
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {trackerSummary ? (
              <div className="mt-6 space-y-5">
                {/* Completion Metric */}
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">Completion Rate</span>
                    <span className="text-xl font-extrabold text-clean-700">{trackerSummary.completion_rate_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-clean-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, trackerSummary.completion_rate_percent)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="block text-2xl font-bold text-slate-900">{trackerSummary.completed_count}</span>
                    <span className="text-[11px] text-slate-500">Habits Adopted</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="block text-2xl font-bold text-slate-900">{trackerSummary.sources_addressed_count}</span>
                    <span className="text-[11px] text-slate-500">Sources Addressed</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {trackerSummary.directional_impact_summary}
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Complete your first assessment to track habits!
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/tracker"
              className="w-full py-2 px-3 rounded-lg bg-clean-50 hover:bg-clean-100 text-clean-800 text-xs font-semibold transition text-center block"
            >
              Update Impact Log
            </Link>
          </div>
        </div>

      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Shortcut 1 */}
        <Link
          to="/detective"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-clean-300 hover:shadow-md transition focus-ring block"
        >
          <div className="w-12 h-12 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-clean-700 transition">
            1. Pollution Detective
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Assess indoor cooking, heating, ventilation, incense, and mold without sensors.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-clean-700 gap-1">
            <span>{latestAssessment ? 'View latest results' : 'Start 2-min assessment'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Shortcut 2 */}
        <Link
          to="/recommendations"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-clean-300 hover:shadow-md transition focus-ring block"
        >
          <div className="w-12 h-12 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-clean-700 transition">
            2. Affordable Actions
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Prioritized low-cost hacks (₹0 - ₹3,000) personalized with Gemini GenAI explanations.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-clean-700 gap-1">
            <span>Explore action plans</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Shortcut 3 */}
        <Link
          to="/tracker"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-clean-300 hover:shadow-md transition focus-ring block"
        >
          <div className="w-12 h-12 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-clean-700 transition">
            3. Impact Tracker
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Record completion dates, mark habits, and compare before-and-after practices.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-clean-700 gap-1">
            <span>Track daily habits</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>

      </div>

      {/* Scientific Transparency Footer */}
      <ScientificDisclaimer />

    </div>
  );
};
