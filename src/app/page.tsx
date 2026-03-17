"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";

interface Participant {
  id: string;
  name: string;
  email?: string | null;
  code: string;
  createdAt: string;
  isWinner: boolean;
  wonAt?: string | null;
  drawOrder?: number | null;
}

type Tab = "qr" | "participants" | "raffle";

const css = `
  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface-hover: #1a1a26;
    --border: #2a2a3a;
    --text: #e8e8f0;
    --text-muted: #8888a0;
    --accent: #6c5ce7;
    --accent-glow: #7c6cf7;
    --accent-light: rgba(108,92,231,0.15);
    --success: #00cec9;
    --warning: #fdcb6e;
    --danger: #ff6b6b;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }
  body::before {
    content: '';
    position: fixed;
    top: -40%;
    left: -20%;
    width: 80vw;
    height: 80vw;
    background: radial-gradient(circle, rgba(108,92,231,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  body::after {
    content: '';
    position: fixed;
    bottom: -30%;
    right: -10%;
    width: 60vw;
    height: 60vw;
    background: radial-gradient(circle, rgba(0,206,201,0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .wrap {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 20px 80px;
  }
  h1 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  h1 span { color: var(--accent); }
  .subtitle { color: var(--text-muted); margin-bottom: 32px; font-size: 0.95rem; }
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 28px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 50px;
    padding: 6px;
  }
  .tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 50px;
    background: transparent;
    color: var(--text-muted);
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }
  .tab:hover { color: var(--text); background: var(--surface-hover); }
  .tab.active {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 0 20px rgba(108,92,231,0.4);
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.75rem;
    margin-bottom: 16px;
  }
  label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; }
  input[type="text"], input[type="email"], input[type="url"] {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: 12px;
  }
  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }
  .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-accent { background: var(--accent); color: #fff; }
  .btn-accent:hover:not(:disabled) { background: var(--accent-glow); }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-muted); }
  .btn-ghost:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }
  .btn-danger { background: rgba(255,107,107,0.15); border: 1px solid rgba(255,107,107,0.3); color: var(--danger); }
  .btn-danger:hover:not(:disabled) { background: rgba(255,107,107,0.25); }
  .btn-success { background: rgba(0,206,201,0.15); border: 1px solid rgba(0,206,201,0.3); color: var(--success); }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  .qr-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: #fff;
    border-radius: 16px;
    margin: 20px auto;
    width: fit-content;
  }
  .qr-url {
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-align: center;
    word-break: break-all;
    max-width: 300px;
    background: var(--bg);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .stats {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .stat {
    background: var(--accent-light);
    border: 1px solid rgba(108,92,231,0.3);
    border-radius: 12px;
    padding: 16px 24px;
    text-align: center;
  }
  .stat-num {
    font-family: 'Space Mono', monospace;
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-glow);
  }
  .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
  .participants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    transition: border-color 0.2s;
  }
  .chip:hover { border-color: var(--accent); }
  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--success));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: #fff;
    flex-shrink: 0;
  }
  .chip-info { flex: 1; min-width: 0; }
  .chip-name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chip-email { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chip-del {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.2s;
    flex-shrink: 0;
  }
  .chip-del:hover { color: var(--danger); }
  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 48px 24px;
    font-size: 0.95rem;
  }
  .empty-icon { font-size: 3rem; margin-bottom: 12px; }
  .raffle-btn {
    width: 100%;
    padding: 24px;
    font-size: 1.2rem;
    border-radius: 14px;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }
  .shuffle-display {
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--warning);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 20px;
    letter-spacing: 1px;
    transition: color 0.1s;
    overflow: hidden;
    padding: 0 16px;
    text-align: center;
  }
  .winner-card {
    background: var(--surface);
    border: 2px solid transparent;
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    position: relative;
    overflow: hidden;
    animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    background-image: linear-gradient(var(--surface), var(--surface)),
      linear-gradient(135deg, var(--accent), var(--success));
    background-origin: border-box;
    background-clip: padding-box, border-box;
  }
  @keyframes scaleIn {
    from { transform: scale(0.85); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .winner-deco { font-size: 2.5rem; margin-bottom: 8px; }
  .winner-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
  .winner-name { font-size: 2rem; font-weight: 700; color: var(--warning); margin-bottom: 4px; }
  .winner-email { font-size: 0.9rem; color: var(--text-muted); }
  .prev-winners { margin-top: 24px; }
  .prev-winner-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 8px;
  }
  .prev-num {
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
    color: var(--accent);
    min-width: 28px;
    font-weight: 700;
  }
  .prev-name { font-weight: 600; font-size: 0.9rem; flex: 1; }
  .prev-email { font-size: 0.8rem; color: var(--text-muted); }
  .error-msg { color: var(--danger); font-size: 0.85rem; margin-top: 8px; }
  .success-msg { color: var(--success); font-size: 0.85rem; margin-top: 8px; }
  hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
`;

export default function AdminPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const [tab, setTab] = useState<Tab>("qr");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [eventName, setEventName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isRaffling, setIsRaffling] = useState(false);
  const [shuffleName, setShuffleName] = useState<string | null>(null);
  const [latestWinner, setLatestWinner] = useState<Participant | null>(null);
  const [raffleError, setRaffleError] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const fetchAll = useCallback(async () => {
    const [p, w] = await Promise.all([
      fetch("/api/participants").then((r) => r.json()),
      fetch("/api/winners").then((r) => r.json()),
    ]);
    if (Array.isArray(p)) setParticipants(p);
    if (Array.isArray(w)) setWinners(w);
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchAll();
    const id = setInterval(fetchAll, 4000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const generateQr = async () => {
    if (!qrCanvasRef.current) return;
    // Reset: töröljük az összes résztvevőt és nyertest
    await Promise.all([
      fetch("/api/participants", { method: "DELETE" }),
      fetch("/api/winners", { method: "DELETE" }),
    ]);
    setLatestWinner(null);
    fetchAll();
    await QRCode.toCanvas(qrCanvasRef.current, `${baseUrl}/register`, {
      width: 340,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    setQrGenerated(true);
  };

  const deleteParticipant = async (id: string) => {
    await fetch(`/api/participants/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const deleteAll = async () => {
    if (!confirm("Biztosan törlöd az összes résztvevőt?")) return;
    await fetch("/api/participants", { method: "DELETE" });
    fetchAll();
  };

  const exportCsv = () => {
    const bom = "\ufeff";
    const header = "Kód,Név,Regisztrálva\n";
    const rows = participants
      .map((p) => `"${p.code}","${p.name}","${new Date(p.createdAt).toLocaleString("hu-HU")}"`)
      .join("\n");
    const blob = new Blob([bom + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = eventName.trim().replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]/g, "").trim() || "resztvevok";
    a.download = `${safeName}_resztvevok.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportWinnersCsv = () => {
    const bom = "\ufeff";
    const header = "Helyezés,Kód,Név\n";
    const rows = winners
      .map((w) => `"${w.drawOrder}","${w.code}","${w.name}"`)
      .join("\n");
    const blob = new Blob([bom + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = eventName.trim().replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]/g, "").trim() || "nyertesek";
    a.download = `${safeName}_nyertesek.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startRaffle = async () => {
    const eligible = participants.filter((p) => !p.isWinner);
    if (eligible.length === 0) {
      setRaffleError("Nincs résztvevő a sorsoláshoz!");
      return;
    }
    setRaffleError(null);
    setLatestWinner(null);
    setIsRaffling(true);

    let step = 0;
    const steps = 30;
    const interval = setInterval(() => {
      const r = eligible[Math.floor(Math.random() * eligible.length)];
      setShuffleName(r.name);
      step++;
      if (step >= steps) {
        clearInterval(interval);
        doRaffle();
      }
    }, 80);

    async function doRaffle() {
      const res = await fetch("/api/raffle", { method: "POST" });
      const data = await res.json();
      setShuffleName(null);
      setIsRaffling(false);
      if (res.ok) {
        setLatestWinner(data);
        fetchAll();
      } else {
        setRaffleError(data.error || "Hiba a sorsolásnál");
      }
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="wrap">
        <h1>Esemény <span>Sorsoló</span></h1>
        <p className="subtitle">QR-kódos regisztráció és nyereményjáték admin felület</p>

        <div className="tabs">
          <button className={`tab${tab === "qr" ? " active" : ""}`} onClick={() => setTab("qr")}>📱 QR Kód</button>
          <button className={`tab${tab === "participants" ? " active" : ""}`} onClick={() => setTab("participants")}>
            👥 Résztvevők {participants.length > 0 && `(${participants.length})`}
          </button>
          <button className={`tab${tab === "raffle" ? " active" : ""}`} onClick={() => setTab("raffle")}>🎲 Sorsolás</button>
        </div>

        {tab === "qr" && (
          <>
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="card-title" style={{ alignSelf: "flex-start" }}>Regisztrációs QR kód</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", marginBottom: 4 }}>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Esemény neve..."
                  style={{ margin: 0, flex: 1 }}
                />
                <button className="btn btn-accent" style={{ whiteSpace: "nowrap", flexShrink: 0 }} onClick={generateQr}>
                  🔲 QR Generálás
                </button>
              </div>
              {mounted && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20, visibility: qrGenerated ? "visible" : "hidden" }}>
                  <div className="qr-box">
                    <canvas ref={qrCanvasRef} />
                  </div>
                  <div className="qr-url">{baseUrl}/register</div>
                </div>
              )}
            </div>

          </>
        )}

        {tab === "participants" && (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat-num">{participants.length}</div>
                <div className="stat-label">Résztvevő</div>
              </div>
            </div>

            <div className="row" style={{ marginBottom: 20 }}>
              <button className="btn btn-ghost" onClick={exportCsv} disabled={participants.length === 0}>
                📥 CSV export
              </button>
              <button className="btn btn-danger" onClick={deleteAll} disabled={participants.length === 0}>
                🗑️ Összes törlése
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">👥</div>
                <div>Még nincs egyetlen résztvevő sem.</div>
                <div style={{ marginTop: 6, fontSize: "0.85rem" }}>Generálj QR kódot és küld el az eseményen!</div>
              </div>
            ) : (
              <div className="participants-grid">
                {participants.map((p) => (
                  <div className="chip" key={p.id}>
                    <div className="avatar">{p.name.charAt(0).toUpperCase()}</div>
                    <div className="chip-info">
                      <div className="chip-name">{p.name} {p.isWinner ? "🏆" : ""}</div>
                      <div className="chip-email" style={{ fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>#{p.code}{p.email ? ` · ${p.email}` : ""}</div>
                    </div>
                    <button className="chip-del" onClick={() => deleteParticipant(p.id)} title="Törlés">✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "raffle" && (
          <>
            <div className="card">
              <div className="card-title">Sorsolás</div>

              {shuffleName && (
                <div className="shuffle-display">{shuffleName}</div>
              )}

              {latestWinner && !isRaffling && (
                <div className="winner-card" style={{ marginBottom: 20 }}>
                  <div className="winner-deco">🎉🎊🎉</div>
                  <div className="winner-label">#{latestWinner.drawOrder} nyertes</div>
                  <div className="winner-name">{latestWinner.name}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "1.5rem", color: "var(--accent-glow)", letterSpacing: 4, margin: "4px 0" }}>#{latestWinner.code}</div>
                  {latestWinner.email && <div className="winner-email">{latestWinner.email}</div>}
                </div>
              )}

              <button
                className="btn btn-accent raffle-btn"
                onClick={startRaffle}
                disabled={isRaffling || participants.length === 0}
              >
                {isRaffling ? "⏳ Sorsolás..." : "🎲 SORSOLÁS INDÍTÁSA"}
                {!isRaffling && participants.length > 0 && ` (${participants.length} fő)`}
              </button>

              {raffleError && <p className="error-msg">{raffleError}</p>}
            </div>

            {winners.length > 0 && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="card-title" style={{ margin: 0 }}>Korábbi nyertesek</div>
                  <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: "0.8rem" }} onClick={exportWinnersCsv}>
                    📥 Export
                  </button>
                </div>
                <div className="prev-winners">
                  {winners.map((w) => (
                    <div className="prev-winner-item" key={w.id}>
                      <div className="prev-num">#{w.drawOrder}</div>
                      <div className="prev-name">{w.name}</div>
                      <div className="prev-email" style={{ fontFamily: "'Space Mono', monospace" }}>#{w.code}</div>
                      {w.email && <div className="prev-email">{w.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
