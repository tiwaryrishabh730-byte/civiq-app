'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

function getStatus(wait) {
  if (wait < 20) {
    return { label: 'Low', dotClass: 'status-dot low' };
  }
  if (wait <= 40) {
    return { label: 'Moderate', dotClass: 'status-dot med' };
  }
  return { label: 'High', dotClass: 'status-dot high' };
}

function getWaitClasses(wait) {
  if (Number.isNaN(wait)) return 'wait-value';
  if (wait < 15) return 'wait-value wait-low';
  if (wait <= 30) return 'wait-value wait-medium';
  return 'wait-value wait-high';
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
    <main className="dashboard-main">
      <div className="dashboard-inner">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Civiq</h1>
            <p className="dashboard-subtitle">
              Real-time crowd insight from your <code>locations</code> collection.
            </p>
          </div>

          <div className="dashboard-system-live">
            <div className="system-live-row">
              <span className="system-live-dot" />
              <span style={{ color: '#6ee7b7', fontWeight: 600 }}>System Live</span>
            </div>
            <div className="dashboard-legend">
              <div className="legend-item">
                <span className="legend-dot low" />
                <span>&lt; 15 min</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot med" />
                <span>15–30 min</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot high" />
                <span>&gt; 30 min</span>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#9ca3af' }}>
            Loading locations...
          </div>
        ) : locations.length === 0 ? (
          <div
            style={{
              borderRadius: '1rem',
              border: '1px dashed #1f2937',
              background: 'rgba(15,23,42,0.7)',
              padding: '4rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              No locations found
            </p>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
              Add documents to the <code>locations</code> collection in Firestore to see them
              here.
            </p>
          </div>
        ) : (
          <section className="dashboard-grid">
            {locations.map((loc) => {
              const wait = Number(loc.current_wait ?? 0);
              const status = getStatus(wait);

              return (
                <article key={loc.id} className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">{loc.name || 'Unnamed location'}</h2>
                      {loc.address && (
                        <p className="card-address">{loc.address}</p>
                      )}
                    </div>
                    <div className="status-pill">
                      <span className={status.dotClass} />
                      <span>{status.label}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div>
                      <p className="wait-label">Current wait</p>
                      <p className={getWaitClasses(wait)}>
                        {Number.isNaN(wait) ? '—' : wait}
                        <span className="wait-unit">min</span>
                      </p>
                    </div>
                    {loc.last_updated && (
                      <p className="updated-text">
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
