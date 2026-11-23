import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../api';
import { useAuth } from '../context/AuthContext';

const PROMINENT_CITIES = [
  "New Delhi", "Delhi", "Gurugram", "Noida", "Ghaziabad",
  "Faridabad", "Patna", "Lucknow", "Kanpur", "Kolkata",
  "Mumbai", "Jaipur", "Chandigarh", "Bengaluru", "Chennai",
  "Hyderabad", "Pune", "Ahmedabad"
];

export const HouseholdSetupPage: React.FC = () => {
  const { setHousehold } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('My Family Residence');
  const [city, setCity] = useState('New Delhi');
  const [customCity, setCustomCity] = useState('');
  const [dwellingType, setDwellingType] = useState('apartment');
  const [approxRooms, setApproxRooms] = useState(3);
  const [hasElderlyOrInfants, setHasElderlyOrInfants] = useState(false);
  const [hasRespiratoryConditions, setHasRespiratoryConditions] = useState(false);
  const [budgetTier, setBudgetTier] = useState('low_cost_under_500');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const finalCity = city === 'other' ? (customCity.trim() || 'New Delhi') : city;

    try {
      const created = await api.createHousehold({
        name,
        city: finalCity,
        dwelling_type: dwellingType,
        approx_rooms: approxRooms,
        has_elderly_or_infants: hasElderlyOrInfants,
        has_respiratory_conditions: hasRespiratoryConditions,
        budget_tier: budgetTier
      });
      setHousehold(created);
      navigate('/dashboard');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to save household profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Setup Household Profile</h1>
            <p className="text-sm text-slate-600">
              Tailor air quality recommendations to your location, dwelling, and budget.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Household Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="h-name">
              Household Name
            </label>
            <input
              id="h-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Verma Residence, Flat 402"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus-ring"
            />
          </div>

          {/* City / Region */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="h-city">
              City / Smog Zone
            </label>
            <div className="relative">
              <select
                id="h-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus-ring bg-white"
              >
                {PROMINENT_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="other">Other City (Enter manually)</option>
              </select>
            </div>
            {city === 'other' && (
              <input
                type="text"
                required
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="Enter city name..."
                className="mt-2 w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus-ring"
              />
            )}
            <p className="mt-1 text-xs text-slate-500">
              Used solely to fetch verified ambient outdoor air quality from regional monitoring stations.
            </p>
          </div>

          {/* Dwelling Type & Rooms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="h-type">
                Dwelling Type
              </label>
              <select
                id="h-type"
                value={dwellingType}
                onChange={(e) => setDwellingType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus-ring bg-white"
              >
                <option value="apartment">Multi-story Apartment</option>
                <option value="independent_house">Independent House / Rowhouse</option>
                <option value="chawl_or_tenement">Chawl / Tenement</option>
                <option value="slum_cluster_or_informal">Informal Settlement / Basti</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="h-rooms">
                Approximate Rooms
              </label>
              <input
                id="h-rooms"
                type="number"
                min={1}
                max={20}
                value={approxRooms}
                onChange={(e) => setApproxRooms(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus-ring"
              />
            </div>
          </div>

          {/* Vulnerability Considerations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-sm font-semibold text-slate-800 block">
              Occupant Vulnerability Considerations (Optional)
            </span>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasElderlyOrInfants}
                onChange={(e) => setHasElderlyOrInfants(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-clean-600 focus-ring"
              />
              <span className="text-sm text-slate-700">
                Home includes <strong>infants, young children (under 5)</strong>, or <strong>elderly family members (65+)</strong>.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasRespiratoryConditions}
                onChange={(e) => setHasRespiratoryConditions(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-clean-600 focus-ring"
              />
              <span className="text-sm text-slate-700">
                Any occupant diagnosed with <strong>asthma, COPD, bronchitis</strong>, or acute dust allergies.
              </span>
            </label>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="h-budget">
              Household Clean-Air Budget Tier
            </label>
            <select
              id="h-budget"
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus-ring bg-white"
            >
              <option value="zero_cost">Zero-Cost Only (Behavioral & Routine hacks: ₹0)</option>
              <option value="low_cost_under_500">Low-Cost (Under ₹500 - vinegar, weatherstripping, bed nets)</option>
              <option value="moderate_under_3000">Moderate (Under ₹3,000 - Corsi-Rosenthal DIY box, ducting fan)</option>
              <option value="flexible">Flexible / Any feasible improvement</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              We never push expensive electronic purifiers. All recommendations prioritize low-cost and no-cost interventions.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-base font-semibold text-white bg-clean-600 hover:bg-clean-700 focus-ring shadow-sm transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Saving Profile...' : 'Save & Continue to Dashboard'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

        </form>
      </div>
    </div>
  );
};
