import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Flame, Wind, Cigarette, Sparkles, Bug, ThermometerSnowflake,
  Droplets, SprayCan, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../api';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';

export const DetectivePage: React.FC = () => {
  const { household } = useAuth();
  const navigate = useNavigate();

  const [cookingFuel, setCookingFuel] = useState('lpg');
  const [cookingFrequency, setCookingFrequency] = useState('daily_heavy_frying');
  const [kitchenVentilation, setKitchenVentilation] = useState('interior_window_only');
  const [exhaustFanType, setExhaustFanType] = useState('indoor_exhaust_only');
  const [indoorSmoking, setIndoorSmoking] = useState(false);
  const [incenseBurn, setIncenseBurn] = useState('daily_multiple_times');
  const [mosquitoCoils, setMosquitoCoils] = useState('frequent');
  const [heatingAppliance, setHeatingAppliance] = useState('none');
  const [visibleMold, setVisibleMold] = useState(false);
  const [cleaningHabit, setCleaningHabit] = useState('heavy_scented_bleach_aerosols');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;
    setError(null);
    setLoading(true);

    try {
      await api.submitAssessment(household.id, {
        cooking_fuel: cookingFuel,
        cooking_frequency: cookingFrequency,
        kitchen_ventilation: kitchenVentilation,
        exhaust_fan_type: exhaustFanType,
        indoor_smoking: indoorSmoking,
        incense_agarbatti_or_camphor: incenseBurn,
        mosquito_coils_usage: mosquitoCoils,
        heating_appliance: heatingAppliance,
        visible_dampness_mold: visibleMold,
        cleaning_products_habit: cleaningHabit
      });

      navigate('/detective/results');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Failed to submit assessment. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-clean-100 text-clean-700 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Pollution Detective Assessment
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Identify household air pollution sources using evidence-informed public health rules.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ScientificDisclaimer compact />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Structured Questionnaire Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Question 1: Cooking Fuel */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600" />
            <span>1. Primary Cooking Fuel</span>
          </legend>
          <p className="text-xs text-slate-500">
            Fuel type determines combustion byproducts (NO2, Carbon Monoxide, soot, VOCs).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'lpg', label: 'LPG (Liquid Petroleum Gas Cylinders)', desc: 'Releases Nitrogen Dioxide (NO2) during burning' },
              { id: 'piped_natural_gas', label: 'PNG (Piped Natural Gas)', desc: 'Clean burning, but releases NO2 if unvented' },
              { id: 'electric_induction', label: 'Electric Induction / Cooktop', desc: 'Zero combustion emissions at point of use' },
              { id: 'biomass_wood_dung', label: 'Solid Biomass / Wood / Cow Dung', desc: 'URGENT HAZARD: emits dangerous CO & PM2.5' },
              { id: 'kerosene', label: 'Kerosene Stove', desc: 'Heavy VOC, particulate, and sulfur emissions' },
              { id: 'mixed', label: 'Mixed / Dual Fuel', desc: 'Combination of gas and electric' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  cookingFuel === opt.id
                    ? 'border-clean-600 bg-clean-50/50 ring-1 ring-clean-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cooking_fuel"
                    value={opt.id}
                    checked={cookingFuel === opt.id}
                    onChange={(e) => setCookingFuel(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 pl-6">{opt.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Question 2: Cooking Style & Frying Frequency */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600" />
            <span>2. Cooking Style & High-Heat Frying</span>
          </legend>
          <p className="text-xs text-slate-500">
            Tempering spices (tadka), deep frying, and searing generate dense clouds of ultrafine oil aerosols.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'daily_heavy_frying', label: 'Daily Heavy Frying / Tadka', desc: 'Frequent boiling oil, tadka, high frying' },
              { id: 'daily_light_moderate', label: 'Daily Light / Moderate', desc: 'Boiling, steaming, light sautéing' },
              { id: 'occasional', label: 'Occasional / Minimal', desc: 'Rare home cooking, mostly reheating' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  cookingFrequency === opt.id ? 'border-clean-600 bg-clean-50/50 ring-1 ring-clean-600' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cooking_frequency"
                    value={opt.id}
                    checked={cookingFrequency === opt.id}
                    onChange={(e) => setCookingFrequency(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-6">{opt.desc}</p>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Question 3 & 4: Kitchen Ventilation & Exhaust Fan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-600" />
              <span>3. Kitchen Window Structure</span>
            </legend>
            <div className="space-y-2">
              {[
                { id: 'dedicated_window_outdoors', label: 'Window opening directly outside' },
                { id: 'interior_window_only', label: 'Window opens to interior shaft / balcony' },
                { id: 'closed_no_window', label: 'Enclosed kitchen, no exterior window' },
                { id: 'open_plan_living', label: 'Open kitchen directly facing living area' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="kitchen_ventilation"
                    value={opt.id}
                    checked={kitchenVentilation === opt.id}
                    onChange={(e) => setKitchenVentilation(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className="text-sm text-slate-800">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-600" />
              <span>4. Exhaust Fan / Chimney Type</span>
            </legend>
            <div className="space-y-2">
              {[
                { id: 'ducted_outdoors', label: 'Ducted Chimney / Exhaust venting OUTDOORS' },
                { id: 'recirculating_filter', label: 'Recirculating chimney (carbon filter, no pipe outside)' },
                { id: 'indoor_exhaust_only', label: 'Small fan blowing into another room / shaft' },
                { id: 'none', label: 'No exhaust fan or chimney present' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="exhaust_fan_type"
                    value={opt.id}
                    checked={exhaustFanType === opt.id}
                    onChange={(e) => setExhaustFanType(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className="text-sm text-slate-800">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Question 5: Indoor Smoking */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cigarette className="w-5 h-5 text-red-600" />
            <span>5. Indoor Tobacco Smoking</span>
          </legend>
          <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
            <input
              type="checkbox"
              checked={indoorSmoking}
              onChange={(e) => setIndoorSmoking(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-clean-600 focus-ring"
            />
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Any member or visitor smokes cigarettes or bidis indoors (even occasionally or by an open window).
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Secondhand tobacco smoke releases over 7,000 chemicals and lingers on furnishings as thirdhand smoke.
              </p>
            </div>
          </label>
        </fieldset>

        {/* Question 6: Incense / Agarbatti & Camphor */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>6. Incense Sticks (Agarbatti), Dhoop, or Camphor</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'daily_multiple_times', label: 'Multiple times daily (Morning & Evening Puja)' },
              { id: 'daily_once', label: 'Once daily' },
              { id: 'weekly_or_festival', label: 'Occasional / Festivals only' },
              { id: 'never', label: 'Never burn incense indoors' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  incenseBurn === opt.id ? 'border-clean-600 bg-clean-50/50 ring-1 ring-clean-600' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="incense_burn"
                    value={opt.id}
                    checked={incenseBurn === opt.id}
                    onChange={(e) => setIncenseBurn(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Question 7: Mosquito Coils */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bug className="w-5 h-5 text-emerald-700" />
            <span>7. Mosquito Coil Burning</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'every_night', label: 'Every night in sleeping rooms' },
              { id: 'frequent', label: 'Frequent (3-4 nights per week)' },
              { id: 'occasional', label: 'Occasional' },
              { id: 'never', label: 'Never / Use bed nets or electric vaporizers' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  mosquitoCoils === opt.id ? 'border-clean-600 bg-clean-50/50 ring-1 ring-clean-600' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mosquito_coils"
                    value={opt.id}
                    checked={mosquitoCoils === opt.id}
                    onChange={(e) => setMosquitoCoils(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Question 8: Winter Heating */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ThermometerSnowflake className="w-5 h-5 text-blue-600" />
            <span>8. Winter Heating & Space Warmers</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'none', label: 'None / Blankets & Quilts only' },
              { id: 'electric_oil_radiator', label: 'Sealed Oil-Filled Electric Radiator (Safe, no flame)' },
              { id: 'electric_convector_blower', label: 'Electric Fan Blower / Quartz Heater' },
              { id: 'unvented_lpg_chullah', label: 'LPG Gas Heater / Chullah in room' },
              { id: 'open_coal_angithi', label: 'Open Coal Angithi / Burning Embers (CRITICAL CO HAZARD)' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  heatingAppliance === opt.id
                    ? (opt.id === 'open_coal_angithi' ? 'border-red-600 bg-red-50 ring-1 ring-red-600' : 'border-clean-600 bg-clean-50/50 ring-1 ring-clean-600')
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="heating_appliance"
                    value={opt.id}
                    checked={heatingAppliance === opt.id}
                    onChange={(e) => setHeatingAppliance(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className={`text-sm font-semibold ${opt.id === 'open_coal_angithi' ? 'text-red-900' : 'text-slate-900'}`}>
                    {opt.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Question 9: Visible Mold & Dampness */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-600" />
            <span>9. Dampness & Mold Patches</span>
          </legend>
          <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
            <input
              type="checkbox"
              checked={visibleMold}
              onChange={(e) => setVisibleMold(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-clean-600 focus-ring"
            />
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Visible water seepage, peeling paint from moisture, or black/greenish mold patches in bathrooms or bedrooms.
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Damp surfaces release fungal spores and mycotoxins that trigger severe nocturnal coughing and asthma.
              </p>
            </div>
          </label>
        </fieldset>

        {/* Question 10: Cleaning Habits */}
        <fieldset className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <legend className="text-base font-bold text-slate-900 flex items-center gap-2">
            <SprayCan className="w-5 h-5 text-purple-600" />
            <span>10. Cleaning Products & Dusting Habit</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'heavy_scented_bleach_aerosols', label: 'Heavy Scented Sprays & Bleach', desc: 'Aerosol fresheners, bleach sprays, dry broom' },
              { id: 'mild_unscented_soap_water', label: 'Mild Soap, Water & Wet Mop', desc: 'Plain water wet mopping, mild dish soap' },
              { id: 'mixed', label: 'Mixed Habits', desc: 'Periodic use of disinfectant cleaners' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  cleaningHabit === opt.id ? 'border-clean-600 bg-clean-50/50 ring-1 ring-clean-600' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cleaning_habit"
                    value={opt.id}
                    checked={cleaningHabit === opt.id}
                    onChange={(e) => setCleaningHabit(e.target.value)}
                    className="text-clean-600 focus-ring h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-6">{opt.desc}</p>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl text-lg font-bold text-white bg-clean-600 hover:bg-clean-700 shadow-md transition focus-ring flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Evaluating Household Evidence...' : 'Analyze Pollution Vectors & Get Recommendations'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </form>
    </div>
  );
};
