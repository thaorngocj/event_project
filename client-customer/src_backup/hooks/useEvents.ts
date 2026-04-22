'use client';
// ============================================================
// src/hooks/useEvents.ts – Fetch events từ API, fallback về static
// ============================================================
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchEvents } from '../services/eventService';
import { EVENTS as STATIC_EVENTS } from '../lib/constants';
import { Event, EventStatus } from '../types';

export function useEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>(STATIC_EVENTS);
  const [filter,    setFilter]    = useState<EventStatus | 'all'>('all');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      if (data.length > 0) setAllEvents(data);
      // nếu backend trả về rỗng → giữ static fallback
    } catch (err) {
      setError('Không thể tải sự kiện từ server, đang dùng dữ liệu demo.');
      console.warn('useEvents fallback to static:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const filtered = useMemo(() =>
    filter === 'all' ? allEvents : allEvents.filter(e => e.status === filter),
    [filter, allEvents],
  );

  return { events: filtered, filter, setFilter, allEvents, loading, error, reload: loadEvents };
}
