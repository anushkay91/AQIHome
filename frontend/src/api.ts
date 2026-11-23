import type {
  User, Household, OutdoorAqiContext, AssessmentResult,
  Recommendation, TrackedAction, TrackerSummary, ExplainResponse
} from './types';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('gharkagod_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorDetail = 'An error occurred while communicating with the server.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // Non-JSON response
    }
    throw new ApiError(response.status, errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; full_name?: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () => request<User>('/auth/me'),

  deleteAllData: () => request<{ message: string }>('/auth/me/data', { method: 'DELETE' }),

  // Guest Demo
  startGuestDemo: () =>
    request<{
      access_token: string;
      token_type: string;
      user: User;
      household: Household;
      is_guest_demo: boolean;
    }>('/guest/demo-session', { method: 'POST' }),

  // Households
  listHouseholds: () => request<Household[]>('/households'),

  createHousehold: (payload: Partial<Household>) =>
    request<Household>('/households', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getHousehold: (id: string) => request<Household>(`/households/${id}`),

  updateHousehold: (id: string, payload: Partial<Household>) =>
    request<Household>(`/households/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Environmental Outdoor AQI
  getOutdoorAqi: (city: string) =>
    request<OutdoorAqiContext>(`/environmental/outdoor-aqi?city=${encodeURIComponent(city)}`),

  // Pollution Detective Assessment
  submitAssessment: (householdId: string, payload: any) =>
    request<AssessmentResult>(`/households/${householdId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getLatestAssessment: (householdId: string) =>
    request<AssessmentResult>(`/households/${householdId}/assessments/latest`),

  // Recommendations & AI Explanations
  getRecommendations: (householdId: string, params?: { category?: string; cost_category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<Recommendation[]>(`/households/${householdId}/recommendations${query ? `?${query}` : ''}`);
  },

  explainRecommendation: (
    householdId: string,
    recId: string,
    payload: { question?: string; language_preference?: 'en' | 'hi' | 'hinglish' }
  ) =>
    request<ExplainResponse>(`/households/${householdId}/recommendations/${recId}/explain`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Impact Tracker
  getTrackerSummary: (householdId: string) =>
    request<TrackerSummary>(`/households/${householdId}/tracker/summary`),

  getTrackedActions: (householdId: string) =>
    request<TrackedAction[]>(`/households/${householdId}/tracker/actions`),

  createTrackedAction: (householdId: string, payload: Partial<TrackedAction>) =>
    request<TrackedAction>(`/households/${householdId}/tracker/actions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTrackedAction: (householdId: string, actionId: string, payload: Partial<TrackedAction>) =>
    request<TrackedAction>(`/households/${householdId}/tracker/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
