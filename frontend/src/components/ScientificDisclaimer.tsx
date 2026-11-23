import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const ScientificDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        <span>
          <strong>Scientific Notice:</strong> GharKaGod has no indoor sensors. All indoor assessments are rule-based habit reviews citing WHO & EPA guidelines.
        </span>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Scientific Integrity and Sensor Disclaimer"
      className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 my-4 text-sm text-slate-800 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">Scientific Transparency & Sensor Disclaimer</p>
          <p className="text-slate-700 leading-relaxed">
            <strong>GharKaGod possesses NO indoor environmental sensors.</strong> We never fabricate live indoor readings,
            never equate outdoor ambient smog with indoor air quality, and never promise medical cures. Outdoor data is
            fetched from regional monitoring stations; household sources are evaluated using deterministic public-health
            guidelines from the <strong>World Health Organization (WHO)</strong> and <strong>U.S. EPA</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
