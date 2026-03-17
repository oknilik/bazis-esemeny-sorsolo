"use client";

import { useState } from "react";

const css = `
  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --border: #2a2a3a;
    --text: #e8e8f0;
    --text-muted: #8888a0;
    --accent: #6c5ce7;
    --accent-glow: #7c6cf7;
    --accent-light: rgba(108,92,231,0.15);
    --success: #00cec9;
    --danger: #ff6b6b;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
  }
  body::before {
    content: '';
    position: fixed;
    top: -30%;
    left: -20%;
    width: 80vw;
    height: 80vw;
    background: radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  body::after {
    content: '';
    position: fixed;
    bottom: -20%;
    right: -10%;
    width: 60vw;
    height: 60vw;
    background: radial-gradient(circle, rgba(0,206,201,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 32px;
  }
  .logo { font-size: 2.5rem; text-align: center; margin-bottom: 8px; }
  h1 {
    text-align: center;
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 4px;
  }
  h1 span { color: var(--accent); }
  .sub {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 32px;
  }
  label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 6px;
    font-weight: 500;
  }
  input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: 16px;
  }
  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  input::placeholder { color: var(--text-muted); }
  .btn {
    width: 100%;
    padding: 16px;
    border: none;
    border-radius: 12px;
    background: var(--accent);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
    margin-top: 4px;
  }
  .btn:hover:not(:disabled) {
    background: var(--accent-glow);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(108,92,231,0.4);
  }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error {
    background: rgba(255,107,107,0.1);
    border: 1px solid rgba(255,107,107,0.3);
    color: var(--danger);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 0.9rem;
    margin-top: 16px;
  }
  .success-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  .check-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(0,206,201,0.15);
    border: 2px solid var(--success);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
  }
  .success-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--success);
  }
  .success-sub { color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; }
  .code-box {
    background: var(--accent-light);
    border: 2px solid var(--accent);
    border-radius: 14px;
    padding: 16px 32px;
    text-align: center;
  }
  .code-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
  .code-num { font-family: 'Space Mono', monospace; font-size: 3rem; font-weight: 700; color: var(--accent-glow); letter-spacing: 8px; }
`;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("A neved megadása kötelező!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCode(data.code);
      } else {
        const d = await res.json();
        setError(d.error || "Hiba történt, kérjük próbáld újra!");
      }
    } catch {
      setError("Hálózati hiba. Kérjük ellenőrizd a kapcsolatod!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="card">
        {code ? (
          <div className="success-wrap">
            <div className="check-circle">✅</div>
            <div className="success-title">Sikeres regisztráció!</div>
            <div className="code-box">
              <div className="code-label">A te kódod</div>
              <div className="code-num">{code}</div>
            </div>
            <div className="success-sub">
              Jegyezd meg a kódodat!<br />
              Sok sikert a sorsoláshoz! 🤞
            </div>
          </div>
        ) : (
          <>
            <div className="logo">🎲</div>
            <h1>Esemény <span>Sorsoló</span></h1>
            <p className="sub">Regisztrálj a nyereményjátékhoz!</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Neved *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kovács János"
                autoComplete="name"
                autoFocus
                required
              />
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "⏳ Regisztráció..." : "Regisztrálok"}
              </button>
            </form>
            {error && <div className="error">{error}</div>}
          </>
        )}
      </div>
    </>
  );
}
