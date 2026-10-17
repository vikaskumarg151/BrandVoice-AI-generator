import { HistoryItem, GenerateResponse, GenerateRequest } from '../types';

const STORAGE_KEY = 'brandvoice_history_v1';
const MAX_HISTORY_ITEMS = 15;

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Validate each item shape
    return parsed.filter(item => 
      item &&
      typeof item.id === 'string' &&
      Array.isArray(item.tweets) &&
      Array.isArray(item.brand_voice_summary)
    );
  } catch (err) {
    console.warn('Failed to parse history from localStorage:', err);
    return [];
  }
}

export function saveHistoryItem(
  response: GenerateResponse,
  requestPayload: GenerateRequest
): HistoryItem[] {
  try {
    const current = loadHistory();
    const newItem: HistoryItem = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      formatted_date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      brand_name: response.brand_name || 'Brand',
      campaign_objective: requestPayload.campaign_objective,
      brand_voice_summary: response.brand_voice_summary,
      tweets: response.tweets,
      request_payload: requestPayload,
      is_demo_mode: response.is_demo_mode,
    };

    const updated = [newItem, ...current.filter(item => item.id !== newItem.id)].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save generation to localStorage:', err);
    return loadHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const current = loadHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete history item:', err);
    return loadHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}
