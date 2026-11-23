export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  created_at: string;
}

export interface Household {
  id: string;
  user_id: string;
  name: string;
  city: string;
  state_region?: string | null;
  dwelling_type: string;
  approx_rooms: number;
  has_elderly_or_infants: boolean;
  has_respiratory_conditions: boolean;
  budget_tier: string;
  created_at: string;
  updated_at: string;
}

export interface OutdoorAqiContext {
  city: string;
  aqi: number;
  aqi_category: string;
  pm25: number;
  pm10: number;
  no2?: number | null;
  source: string;
  timestamp: string;
  is_live: boolean;
  uncertainty_note: string;
  ventilation_advisory: string;
}

export interface IdentifiedSource {
  source_name: string;
  severity: 'urgent_safety' | 'priority_review' | 'potential_concern';
  household_input: string;
  possible_pollutants: string[];
  why_it_matters: string;
  evidence_reference: string;
  recommended_action_key: string;
  confidence_note: string;
}

export interface Recommendation {
  id: string;
  action_key: string;
  title: string;
  category: string;
  priority_tier: 'urgent_safety' | 'high_impact' | 'routine_improvement';
  cost_category: 'free_no_cost' | 'under_500_inr' | 'under_3000_inr';
  estimated_cost_inr: number;
  household_trigger: string;
  qualitative_impact: string;
  limitations: string;
  evidence_reference: string;
  ai_explanation?: string | null;
  created_at?: string;
}

export interface AssessmentResult {
  assessment_id: string;
  household_id: string;
  created_at: string;
  outdoor_conditions: OutdoorAqiContext;
  identified_sources: IdentifiedSource[];
  recommendations: Recommendation[];
  scientific_disclaimer: string;
}

export interface TrackedAction {
  id: string;
  household_id: string;
  recommendation_id?: string | null;
  action_key: string;
  title: string;
  category: string;
  status: 'planned' | 'started' | 'completed' | 'skipped';
  completed_at?: string | null;
  notes?: string | null;
  habit_frequency?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackerSummary {
  total_actions: number;
  completed_count: number;
  started_count: number;
  planned_count: number;
  skipped_count: number;
  completion_rate_percent: number;
  sources_addressed_count: number;
  total_sources_identified: number;
  category_breakdown: Record<string, { total: number; completed: number; in_progress: number }>;
  directional_impact_summary: string;
  scientific_disclaimer: string;
}

export interface ExplainResponse {
  action_key: string;
  title: string;
  answer: string;
  scientific_rationale: string;
  practical_tip: string;
  safety_boundary: string;
  source_reference: string;
  is_ai_generated: boolean;
}
