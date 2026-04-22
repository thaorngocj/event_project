'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/apiClient';

export type EventStatus = 'open' | 'soon' | 'ended';

export interface FrontEvent {
  id:          number;
  title:       string;
  description: string;
  date:        string;   // dd/MM/yyyy
  time:        string;   // HH:mm
  loc:         string;
  status:      EventStatus;
  em:          string;
  pts:         number;
  bg:          string;
  imageUrl?:   string;
  startDate:   string;
  endDate:     string;
  maxParticipants?: number;
}

function mapStatus(s: string): EventStatus {
  if (s === 'OPEN')    return 'open';
  if (s === 'CLOSED')  return 'ended';
  return 'soon';
}

const EMOJIS = ['💼','🏎️','⚽','🏆','🌍','🎗️','🎓','🔬','🎨','🎭','🎵','🏃'];
const BGS    = ['#1a3a6b','#1a0a0e','#0d2818','#1a1a2e','#0a1628','#2a2a2a','#1a2a1a','#0a1a2a'];

function toFrontEvent(ev: any, i: number): FrontEvent {
  const d = new Date(ev.startDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    id:          ev.id,
    title:       ev.title,
    description: ev.description || '',
    date:        `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`,
    time:        `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    loc:         ev.location,
    status:      mapStatus(ev.status),
    em:          EMOJIS[i % EMOJIS.length],
    pts:         3,
    bg:          BGS[i % BGS.length],
    imageUrl:    ev.imageUrl,
    startDate:   ev.startDate,
    endDate:     ev.endDate,
    maxParticipants: ev.maxParticipants,
  };
}

export function useEvents() {
  const [events,  setEvents]  = useState<FrontEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<EventStatus | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/events', false);
      setEvents(data.map(toFrontEvent));
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

  return { events: filtered, allEvents: events, loading, filter, setFilter, reload: load };
}
