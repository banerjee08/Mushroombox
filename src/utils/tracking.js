// src/utils/tracking.js
import { supabase } from '../supabaseClient'; // Ensure supabaseClient setup earlier

export const trackEvent = async (eventType, entityType = null, entityId = null, metadata = {}) => {
  // Try getting current authenticated user session
  const { data: { session } } = await supabase.auth.getSession();
  const customerId = session?.user?.id || null;
  const sessionId = getOrSetAnonymousSessionId();

  const payload = {
    customer_id: customerId,
    session_id: sessionId,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  };

  // Directly invoking our trusted Edge Function
  const { data, error } = await supabase.functions.invoke('events-track', {
    body: payload
  });

  if (error) {
    console.error('Failed to track event:', error);
  }
};

function getOrSetAnonymousSessionId() {
  let sessionId = sessionStorage.getItem('mushroombox_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('mushroombox_session_id', sessionId);
  }
  return sessionId;
}
