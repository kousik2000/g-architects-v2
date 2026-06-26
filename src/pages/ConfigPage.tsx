import { useState, useEffect } from "react";
import { getApiUrl } from "../config";

export default function ConfigPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiUrl(getApiUrl());
  }, []);

  const handleSave = () => {
    localStorage.setItem("API_URL", apiUrl);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload(); // Reload to apply the global fetch interceptor immediately
    }, 1500);
  };

  const handleReset = () => {
    localStorage.removeItem("API_URL");
    setApiUrl(import.meta.env.VITE_API_URL || "");
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 font-body bg-background">
      <div className="w-full max-w-md bg-surface border border-borderLine rounded-architectural p-8 shadow-2xl">
        <h2 className="text-xl font-headings font-bold mb-6 text-primary">API Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-2">Backend API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://g-architects-v2.vercel.app"
              className="w-full bg-background border border-borderLine text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-accent"
            />
          </div>

          {saved && (
            <div className="p-3 bg-green-500/10 text-green-600 text-xs rounded-lg border border-green-500/20">
              Settings saved! Reloading...
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-accent text-white uppercase text-xs font-bold tracking-widest rounded-architectural hover:bg-primary transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-transparent border border-borderLine text-primary uppercase text-xs font-bold tracking-widest rounded-architectural hover:bg-surface transition-colors"
            >
              Reset to Env
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
