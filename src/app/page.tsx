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
    --page-bg: #F4D272;
    --page-bg-subtle: #faf6e8;
    --text-primary: #524936;
    --text-secondary: #8a7b65;
    --text-tertiary: #7a6b55;
    --terracotta: #BF7048;
    --terracotta-hover: #d4885c;
    --terracotta-alpha-12: rgba(191,112,72,0.12);
    --olive: #B0A761;
    --olive-hover: #9e9655;
    --olive-alpha-12: rgba(176,167,97,0.12);
    --card-bg: #FFFFFF;
    --card-border: rgba(82,73,54,0.12);
    --input-border: rgba(82,73,54,0.15);
    --tab-bg: rgba(82,73,54,0.08);
    --btn-danger-text: #c0392b;
    --btn-danger-bg: rgba(192,57,43,0.08);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--page-bg);
    color: var(--text-primary);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
  }
  .wrap {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px 80px;
  }
  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 20px 24px;
    text-align: center;
    gap: 2px;
  }
  .header-logo {
    width: 240px;
    height: auto;
    display: block;
    margin-bottom: 2px;
  }
  .header-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }
  .header-sub {
    font-size: 11px;
    color: var(--text-secondary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
    background: var(--tab-bg);
    border-radius: 14px;
    padding: 5px;
  }
  .tab {
    flex: 1;
    padding: 10px 14px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    text-align: center;
  }
  .tab:hover { background: rgba(82,73,54,0.06); }
  .tab.active {
    background: var(--olive);
    color: #fff;
    box-shadow: 0 2px 8px rgba(176,167,97,0.35);
    font-weight: 600;
  }
  .card {
    background: var(--card-bg);
    border: 0.5px solid var(--card-border);
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(82,73,54,0.06);
  }
  .card-transparent {
    background: var(--page-bg);
    border: none;
    box-shadow: none;
  }
  .card-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 5px;
    letter-spacing: 0.03em;
  }
  input[type="text"], input[type="email"], input[type="url"] {
    width: 100%;
    background: var(--page-bg-subtle);
    border: 0.5px solid var(--input-border);
    border-radius: 8px;
    padding: 11px 14px;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    margin-bottom: 12px;
  }
  input::placeholder { color: var(--text-secondary); }
  input:focus {
    border-color: var(--terracotta);
    box-shadow: 0 0 0 3px rgba(191,112,72,0.15);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 11px 20px;
    border: none;
    border-radius: 9px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
  }
  .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(82,73,54,0.15); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-primary { background: var(--olive); color: #fff; }
  .btn-primary:hover:not(:disabled) { background: var(--olive-hover); }
  .btn-outline { background: transparent; border: 0.5px solid rgba(82,73,54,0.2); color: var(--text-primary); }
  .btn-outline:hover:not(:disabled) { background: rgba(82,73,54,0.05); }
  .btn-danger { background: var(--btn-danger-bg); color: var(--btn-danger-text); border: 0.5px solid rgba(192,57,43,0.15); }
  .btn-danger:hover:not(:disabled) { background: rgba(192,57,43,0.14); }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  .qr-frame {
    border: 2px solid var(--terracotta);
    border-radius: 12px;
    padding: 16px;
    background: var(--page-bg);
    display: inline-flex;
  }
  .qr-url {
    font-family: 'Geist Mono', 'Courier New', monospace;
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
    word-break: break-all;
    max-width: 360px;
    background: var(--page-bg-subtle);
    padding: 7px 12px;
    border-radius: 7px;
    border: 0.5px solid var(--input-border);
    margin-top: 4px;
  }
  .stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .stat {
    background: var(--page-bg-subtle);
    border: 0.5px solid var(--card-border);
    border-radius: 10px;
    padding: 14px 22px;
    text-align: center;
  }
  .stat-num {
    font-family: 'Geist Mono', 'Courier New', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--terracotta);
  }
  .stat-label { font-size: 11px; color: var(--text-secondary); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .participants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
    margin-top: 16px;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--page-bg-subtle);
    border: 0.5px solid rgba(82,73,54,0.08);
    border-radius: 10px;
    padding: 11px 13px;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .chip:hover { border-color: rgba(191,112,72,0.3); box-shadow: 0 2px 8px rgba(82,73,54,0.08); }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #BF7048, #B0A761);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    color: #fff;
    flex-shrink: 0;
  }
  .chip-info { flex: 1; min-width: 0; }
  .chip-name { font-weight: 600; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chip-code { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Geist Mono', 'Courier New', monospace; }
  .chip-del {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 13px;
    line-height: 1;
    padding: 4px;
    border-radius: 5px;
    transition: color 0.18s;
    flex-shrink: 0;
  }
  .chip-del:hover { color: var(--btn-danger-text); }
  .empty {
    text-align: center;
    color: var(--text-secondary);
    padding: 48px 24px;
    font-size: 14px;
  }
  .empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
  .raffle-btn {
    width: 100%;
    padding: 22px;
    font-size: 18px;
    font-weight: 800;
    border-radius: 14px;
    margin-bottom: 16px;
    letter-spacing: 0.04em;
    background: linear-gradient(135deg, #BF7048, #d4885c);
    color: #fff;
    border: none;
    box-shadow: 0 8px 32px rgba(191,112,72,0.28);
    cursor: pointer;
    transition: all 0.18s;
  }
  .raffle-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(191,112,72,0.36); }
  .raffle-btn:active:not(:disabled) { transform: translateY(0); }
  .raffle-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
  .shuffle-display {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Geist Mono', 'Courier New', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--terracotta);
    background: var(--page-bg-subtle);
    border: 0.5px solid var(--input-border);
    border-radius: 10px;
    margin-bottom: 16px;
    letter-spacing: 1px;
    overflow: hidden;
    padding: 0 16px;
    text-align: center;
  }
  .winner-card {
    background: linear-gradient(135deg, rgba(191,112,72,0.08), rgba(176,167,97,0.08));
    border: 2px solid var(--terracotta);
    border-radius: 18px;
    padding: 28px;
    text-align: center;
    margin-bottom: 16px;
    animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes scaleIn {
    from { transform: scale(0.85); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .winner-deco { font-size: 2rem; margin-bottom: 6px; }
  .winner-label {
    font-size: 11px;
    color: var(--olive);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .winner-name { font-size: 26px; font-weight: 900; color: var(--terracotta); margin-bottom: 4px; }
  .winner-code {
    font-family: 'Geist Mono', 'Courier New', monospace;
    font-size: 1.4rem;
    color: var(--olive);
    letter-spacing: 4px;
    margin: 4px 0;
    font-weight: 700;
  }
  .winner-email { font-size: 13px; color: var(--text-secondary); }
  .prev-winner-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    background: var(--page-bg-subtle);
    border: 0.5px solid rgba(82,73,54,0.08);
    border-radius: 9px;
    margin-bottom: 7px;
  }
  .prev-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #BF7048, #B0A761);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    flex-shrink: 0;
  }
  .prev-num {
    font-family: 'Geist Mono', 'Courier New', monospace;
    font-size: 13px;
    color: var(--terracotta);
    min-width: 26px;
    font-weight: 700;
  }
  .prev-name { font-weight: 600; font-size: 13px; color: var(--text-primary); flex: 1; }
  .prev-code { font-size: 12px; color: var(--text-secondary); font-family: 'Geist Mono', 'Courier New', monospace; }
  .error-msg { color: var(--btn-danger-text); font-size: 13px; margin-top: 8px; }
  .winners-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
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

      <header className="header">
        <img src="/logo/logo.png" alt="BÁZIS" className="header-logo" />
        <div className="header-title">Esemény Sorsoló</div>
        <div className="header-sub">III. Szakmai és Nyílt Nap · 2026</div>
      </header>

      <div className="wrap">
        <div className="tabs">
          <button className={`tab${tab === "qr" ? " active" : ""}`} onClick={() => setTab("qr")}>
            📱 QR Kód
          </button>
          <button className={`tab${tab === "participants" ? " active" : ""}`} onClick={() => setTab("participants")}>
            👥 Résztvevők {participants.length > 0 && `(${participants.length})`}
          </button>
          <button className={`tab${tab === "raffle" ? " active" : ""}`} onClick={() => setTab("raffle")}>
            🎲 Sorsolás
          </button>
        </div>

        {tab === "qr" && (
          <div className="card card-transparent" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="card-title" style={{ alignSelf: "flex-start" }}>📱 Regisztrációs QR kód</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", width: "100%", marginBottom: 4 }}>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Esemény neve..."
                style={{ margin: 0, flex: 1 }}
              />
              <button className="btn btn-primary" style={{ whiteSpace: "nowrap", flexShrink: 0 }} onClick={generateQr}>
                🔲 QR Generálás
              </button>
            </div>
            {mounted && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 20, visibility: qrGenerated ? "visible" : "hidden" }}>
                <div className="qr-frame">
                  <canvas ref={qrCanvasRef} />
                </div>
                <div className="qr-url">{baseUrl}/register</div>
              </div>
            )}
          </div>
        )}

        {tab === "participants" && (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat-num">{participants.length}</div>
                <div className="stat-label">Résztvevő</div>
              </div>
            </div>

            <div className="row" style={{ marginBottom: 16 }}>
              <button className="btn btn-outline" onClick={exportCsv} disabled={participants.length === 0}>
                📥 CSV export
              </button>
              <button className="btn btn-danger" onClick={deleteAll} disabled={participants.length === 0}>
                🗑 Összes törlése
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">👥</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Még nincs résztvevő.</div>
                <div style={{ fontSize: 13 }}>Generálj QR kódot és oszd meg az eseményen!</div>
              </div>
            ) : (
              <div className="participants-grid">
                {participants.map((p) => (
                  <div className="chip" key={p.id}>
                    <div className="avatar">{p.name.charAt(0).toUpperCase()}</div>
                    <div className="chip-info">
                      <div className="chip-name">{p.name} {p.isWinner ? "🏆" : ""}</div>
                      <div className="chip-code">#{p.code}</div>
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
              <div className="card-title">🎲 Sorsolás</div>

              {shuffleName && (
                <div className="shuffle-display">{shuffleName}</div>
              )}

              {latestWinner && !isRaffling && (
                <div className="winner-card">
                  <div className="winner-deco">🎉🎊🎉</div>
                  <div className="winner-label">★ A nyertes ★</div>
                  <div className="winner-name">{latestWinner.name}</div>
                  <div className="winner-code">#{latestWinner.code}</div>
                  {latestWinner.email && <div className="winner-email">{latestWinner.email}</div>}
                </div>
              )}

              <button
                className="raffle-btn"
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
                <div className="winners-header">
                  <div className="card-title" style={{ margin: 0 }}>🏆 Korábbi nyertesek</div>
                  <button className="btn btn-outline" style={{ padding: "7px 14px", fontSize: "13px" }} onClick={exportWinnersCsv}>
                    📥 Export
                  </button>
                </div>
                {winners.map((w) => (
                  <div className="prev-winner-item" key={w.id}>
                    <div className="prev-num">#{w.drawOrder}</div>
                    <div className="prev-avatar">{w.name.charAt(0).toUpperCase()}</div>
                    <div className="prev-name">{w.name}</div>
                    <div className="prev-code">#{w.code}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
