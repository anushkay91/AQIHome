import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Wind, Sparkles, Activity, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const LandingPage: React.FC = () => {
  const { startGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleGuestDemo = async () => {
    await startGuestMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-clean-100 text-clean-800 border border-clean-300 mb-6 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-clean-700" aria-hidden="true" />
              <span>PromptWar GenAI Challenge — Household Clean Air SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Protect Your Family from Winter Smog{' '}
              <span className="text-clean-600 block sm:inline">Without Costly Gadgets.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              <strong>GharKaGod (घर का गॉड)</strong> is an evidence-backed clean-air assistant designed for South Asian homes.
              Identify hidden indoor pollution sources, get low-cost daily routines, and track healthy habits with complete scientific transparency.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGuestDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-clean-600 hover:bg-clean-700 shadow-md hover:shadow-lg transition focus-ring flex items-center justify-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <Link
                to="/auth?mode=register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition focus-ring flex items-center justify-center gap-2"
              >
                Create Account
              </Link>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              ⚡ Demo requires zero credentials or API keys. Starts immediately with real-time smog integration.
            </p>

            {/* Scientific Disclaimer Callout */}
            <div className="mt-10 text-left">
              <ScientificDisclaimer />
            </div>

          </div>
        </div>
      </section>

      {/* Epistemological Distinction Box: How GharKaGod Operates */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Scientific Transparency in Action
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Unlike gimmicks claiming to measure indoor pollution through a mobile phone, we make strict, honest distinctions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Wind className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">1. Verified Outdoor Data</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Real ambient monitoring station data fetched from the European Atmosphere Monitoring Service / Open-Meteo,
                  benchmarked against India's CPCB National AQI standards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-800">
                ✓ Verified Live Regional Data
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">2. Deterministic Rule Engine</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Every indoor source (unvented gas burners, coal angithi, incense smoke, mosquito coils) is flagged using
                  peer-reviewed WHO, EPA, and Lancet public-health research.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-clean-800">
                ✓ Evidence-Based Source Identification
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">3. GenAI Contextualizer</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Google Gemini personalizes explanations, translates concepts into plain vernacular language, and answers
                  household follow-ups without ever fabricating measurements.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-800">
                ✓ Strict Server-Side Sandboxing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Modules */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-clean-700">Product Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Three Coordinated Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-clean-600 text-white flex items-center justify-center mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pollution Detective</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                A rapid 10-point household questionnaire evaluating cooking fuels, exhaust ducting, heating habits, incense,
                and mold. Identifies hazards like lethal Carbon Monoxide from coal angithis and NO2 spikes from unvented stoves.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-clean-600 text-white flex items-center justify-center mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Affordable Actions</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Prioritized interventions based on cost (₹0 to ₹3,000), safety, and outdoor smog conditions.
                Features pot-lid cooking, wet mopping dust control, timed ventilation windows, and DIY Corsi-Rosenthal box purifiers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-clean-600 text-white flex items-center justify-center mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Impact Tracker</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Persisted habit progress tracking before vs after changes. Quantifies addressed pollution vectors and completion rates
                while maintaining strict scientific honesty on directional physical benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm space-y-3">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
            <Shield className="w-5 h-5 text-clean-500" />
            <span>GharKaGod (घर का गॉड)</span>
          </div>
          <p>
            Developed for the PromptWar GenAI Challenge. Dedicated to affordable, scientifically sound household smog protection.
          </p>
          <div className="text-xs text-slate-500 pt-4 border-t border-slate-800">
            Authoritative References: WHO Global Air Quality Guidelines (2021), U.S. EPA IAQ Standards, India Central Pollution Control Board (CPCB).
          </div>
        </div>
      </footer>
    </div>
  );
};
