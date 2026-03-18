"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const css = `
  :root {
    --page-bg-subtle: #faf6e8;
    --text-primary: #524936;
    --text-secondary: #8a7b65;
    --terracotta: #BF7048;
    --terracotta-hover: #d4885c;
    --olive: #B0A761;
    --olive-hover: #9e9655;
    --card-bg: #FFFFFF;
    --card-border: rgba(82,73,54,0.12);
    --input-border: rgba(82,73,54,0.15);
    --btn-danger-text: #c0392b;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--page-bg-subtle);
    color: var(--text-primary);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
  }
  .card {
    width: 100%;
    max-width: 420px;
    background: var(--card-bg);
    border: 0.5px solid var(--card-border);
    border-radius: 18px;
    padding: 36px 28px;
    box-shadow: 0 4px 24px rgba(82,73,54,0.10);
  }
  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-bottom: 32px;
    margin-top: 8px;
    text-align: center;
  }
  .brand-logo {
    width: 150px;
    height: auto;
    display: block;
    margin-bottom: 14px;
  }
  .brand-name {
    font-size: 18px;
    font-weight: 800;
    color: var(--terracotta);
    letter-spacing: 0.04em;
  }
  .brand-sub {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 5px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  input {
    width: 100%;
    background: var(--page-bg-subtle);
    border: 0.5px solid var(--input-border);
    border-radius: 9px;
    padding: 14px 16px;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 15px;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    margin-bottom: 16px;
  }
  input::placeholder { color: var(--text-secondary); }
  input:focus {
    border-color: var(--terracotta);
    box-shadow: 0 0 0 3px rgba(191,112,72,0.15);
  }
  .btn {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 10px;
    background: var(--olive);
    color: #fff;
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
    letter-spacing: 0.02em;
    margin-top: 4px;
  }
  .btn:hover:not(:disabled) {
    background: var(--olive-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(176,167,97,0.35);
  }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error {
    background: rgba(192,57,43,0.07);
    border: 0.5px solid rgba(192,57,43,0.2);
    color: var(--btn-danger-text);
    border-radius: 9px;
    padding: 12px 14px;
    font-size: 13px;
    margin-top: 14px;
  }
  .success-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  .check-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--olive);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #fff;
  }
  .success-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
  }
  .success-sub {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.55;
  }
  .code-box {
    background: var(--page-bg-subtle);
    border: 1.5px solid var(--terracotta);
    border-radius: 12px;
    padding: 18px 36px;
    text-align: center;
    width: 100%;
  }
  .code-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 5px;
  }
  .code-num {
    font-family: 'Geist Mono', 'Courier New', monospace;
    font-size: 3.2rem;
    font-weight: 700;
    color: var(--terracotta);
    letter-spacing: 10px;
    line-height: 1;
  }
  .already-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }
  .already-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(191,112,72,0.12);
    border: 1.5px solid var(--terracotta);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }
  .already-title { font-size: 18px; font-weight: 800; color: var(--text-primary); }
  .already-sub { color: var(--text-secondary); font-size: 14px; line-height: 1.5; }
`;

function RegisterForm() {
  const searchParams = useSearchParams();
  const roundId = searchParams.get("r") ?? "";
  const storageKey = `sorsolo_round_${roundId}`;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);

  useEffect(() => {
    if (roundId) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setAlreadyRegistered(true);
        setSavedCode(stored);
      }
    }
  }, [roundId, storageKey]);

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
        if (roundId) localStorage.setItem(storageKey, data.code);
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
        {alreadyRegistered && !code ? (
          <div className="already-wrap">
            <div className="already-icon">🔒</div>
            <div className="already-title">Már regisztráltál!</div>
            <div className="already-sub">
              Ezen az eszközön már leadtál egy regisztrációt ehhez a sorsoláshoz.
            </div>
            {savedCode && (
              <div className="code-box">
                <div className="code-label">A te kódod</div>
                <div className="code-num">{savedCode}</div>
              </div>
            )}
          </div>
        ) : code ? (
          <div className="success-wrap">
            <div className="check-circle">✓</div>
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
            <div className="brand">
              <img src="/logo.png" alt="BÁZIS" className="brand-logo" />
              <div className="brand-name">BÁZIS</div>
              <div className="brand-sub">Regisztráció</div>
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Neved</label>
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

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
