'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

function getStatus(wait) {
  if (wait < 20) {
    return { label: 'Low', color: 'bg-emerald-500' };
  }
  if (wait <= 40) {
    return { label: 'Moderate', color: 'bg-amber-400' };
  }
  return { label: 'High', color: 'bg-rose-500' };
}

function getWaitTextClasses(wait) {
  if (Number.isNaN(wait)) return 'text-slate-300';
  if (wait < 15) {
    return 'text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.85)]';
  }
  if (wait <= 30) {
    return 'text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.8)]';
  }
  return 'text-rose-400 drop-shadow-[0_0_18px_rgba(248,113,113,0.8)]';
}

export default function DashboardPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'locations'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to locations:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">Civiq</h1>
            <p className="text-sm text-slate-400">
              Real-time crowd insight from your{' '}
              <span className="font-mono text-xs">locations</span> collection.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 shadow shadow-emerald-500/80" />
              </span>
              <span className="font-medium text-emerald-300">System Live</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>&lt; 15 min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                <span>15–30 min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>&gt; 30 min</span>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            Loading locations...
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 py-16">
            <p className="text-sm font-medium text-slate-200">No locations found</p>
            <p className="mt-1 text-xs text-slate-500">
              Add documents to the <span className="font-mono text-[11px]">locations</span>{' '}
              collection in Firestore to see them here.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {locations.map((loc) => {
              const wait = Number(loc.current_wait ?? 0);
              const status = getStatus(wait);

              return (
                <article
                  key={loc.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm shadow-slate-950/40 backdrop-blur-md transition hover:border-slate-700 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-50">
                        {loc.name || 'Unnamed location'}
                      </h2>
                      {loc.address && (
                        <p className="mt-1 text-xs text-slate-400">{loc.address}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${status.color} shadow shadow-slate-900`}
                      />
                      <span>{status.label}</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Current wait
                      </p>
                      <p
                        className={`text-4xl font-bold leading-tight ${getWaitTextClasses(
                          wait
                        )} transition-colors`}
                      >
                        {Number.isNaN(wait) ? '—' : wait}
                        <span className="ml-1 text-sm font-normal text-slate-400">min</span>
                      </p>
                    </div>
                    {loc.last_updated && (
                      <p className="text-[11px] text-slate-500">
                        Updated{' '}
                        {typeof loc.last_updated.toDate === 'function'
                          ? loc.last_updated.toDate().toLocaleTimeString()
                          : new Date(loc.last_updated).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
