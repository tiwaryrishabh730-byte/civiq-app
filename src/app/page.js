'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const MUMBAI_MAP_SRC =
  'https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?auto=format&fit=crop&q=80&w=2000';

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

function getMinutesAgo(dateLike) {
  if (!dateLike) return null;
  const date =
    typeof dateLike.toDate === 'function' ? dateLike.toDate() : new Date(dateLike);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins <= 0) return 'just now';
  if (diffMins === 1) return '1 min ago';
  return `${diffMins} mins ago`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DashboardPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  async function updateWaitTime(locationId, waitValue) {
    try {
      const ref = doc(db, 'locations', locationId);
      await updateDoc(ref, {
        current_wait: waitValue,
        last_updated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating wait time:', error);
    }
  }

  // Get user GPS (best-effort; safe if denied)
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationError('Geolocation not available');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationError('Permission denied or unavailable');
        setUserLocation(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Simulated initial "Detecting location..." phase
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocationLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
            <div className="dashboard-logo-row">
              <Image
                src="/logo.png"
                alt="CIVIQ"
                width={120}
                height={40}
                className="dashboard-logo-img"
                priority
              />
              <span className="dashboard-logo-text">CIVIQ</span>
            </div>
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

        {/* Spatial hero / map section */}
        <section className="hero-section">
          <div className="hero-header-row">
            <div>
              <p className="hero-title">Mumbai Live Network</p>
              <p className="hero-subtitle">
                Spatial view of live crowd signals across key hubs.
              </p>
            </div>
            {locationLoading ? (
              <div className="hero-detecting-pill">
                <span className="hero-detecting-dot" />
                <span>Detecting location...</span>
              </div>
            ) : (
              <div
                className="hero-location-badge"
                style={{
                  opacity: locationLoading ? 0 : 1,
                  transform: locationLoading ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'opacity 320ms ease, transform 320ms ease',
                }}
              >
                <span className="hero-location-dot" />
                <span>
                  {userLocation
                    ? <>
                        You&apos;re near{' '}
                        <strong>
                          {userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)}
                        </strong>
                      </>
                    : <span>📍 Mumbai Hub</span>}
                </span>
              </div>
            )}
          </div>

          <div className="hero-map-shell">
            <Image
              src={MUMBAI_MAP_SRC}
              alt="Mumbai city aerial night view"
              fill
              sizes="(max-width: 768px) 100vw, 72rem"
              className="hero-map-img"
              unoptimized={false}
            />
            <div className="hero-map-overlay">
              {/* Approximate pins for CST, Lilavati, NMIMS */}
              <div className="hero-pin" style={{ top: '32%', left: '38%' }}>
                <span className="hero-pin-label">CST</span>
              </div>
              <div className="hero-pin" style={{ top: '42%', left: '62%' }}>
                <span className="hero-pin-label">Lilavati</span>
              </div>
              <div className="hero-pin" style={{ top: '58%', left: '48%' }}>
                <span className="hero-pin-label">NMIMS</span>
              </div>
            </div>
          </div>
        </section>

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

              const hasCoords =
                typeof loc.lat !== 'undefined' &&
                typeof loc.lng !== 'undefined' &&
                loc.lat !== null &&
                loc.lng !== null &&
                !Number.isNaN(Number(loc.lat)) &&
                !Number.isNaN(Number(loc.lng));

              let distanceText = null;
              let isNear = false;
              if (userLocation && hasCoords) {
                const dKm = haversineKm(
                  Number(userLocation.lat),
                  Number(userLocation.lng),
                  Number(loc.lat),
                  Number(loc.lng)
                );
                distanceText = `${dKm.toFixed(1)} km away`;
                if (dKm < 15) {
                  isNear = true;
                }
              }

              const lastUpdatedRaw = loc.lastUpdated ?? loc.last_updated ?? null;
              const lastUpdatedText = getMinutesAgo(lastUpdatedRaw);

              return (
                <article key={loc.id} className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">{loc.name || 'Unnamed location'}</h2>
                      {loc.address && (
                        <p className="card-address">{loc.address}</p>
                      )}
                      {distanceText && (
                        <p className={`card-distance${isNear ? ' near' : ''}`}>
                          {distanceText}
                        </p>
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
                      <div style={{ marginTop: '0.5rem' }}>
                        <p
                          style={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: '#6b7280',
                            marginBottom: '0.2rem',
                          }}
                        >
                          Report live
                        </p>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => updateWaitTime(loc.id, 10)}
                            className="inline-flex items-center rounded-full bg-slate-800/50 px-2 py-0.5 text-[0.65rem] font-medium text-slate-200 hover:bg-slate-700 transition"
                          >
                            Quiet
                          </button>
                          <button
                            type="button"
                            onClick={() => updateWaitTime(loc.id, 30)}
                            className="inline-flex items-center rounded-full bg-slate-800/50 px-2 py-0.5 text-[0.65rem] font-medium text-slate-200 hover:bg-slate-700 transition"
                          >
                            Busy
                          </button>
                          <button
                            type="button"
                            onClick={() => updateWaitTime(loc.id, 60)}
                            className="inline-flex items-center rounded-full bg-slate-800/50 px-2 py-0.5 text-[0.65rem] font-medium text-slate-200 hover:bg-slate-700 transition"
                          >
                            Full
                          </button>
                        </div>
                      </div>
                    </div>
                    {lastUpdatedText && (
                      <p className="updated-text">Updated {lastUpdatedText}</p>
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
