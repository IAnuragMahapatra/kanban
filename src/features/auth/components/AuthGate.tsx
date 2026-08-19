import { useState } from 'react';
import { type User } from '../../../types';

interface AuthGateProps {
  onSelect: (user: User) => void;
}

export function AuthGate({ onSelect }: AuthGateProps) {
  const users: User[] = ['Anurag', 'Srinibas', 'Ayush'];
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // SHA-256 hash of 'amygdylla'
    if (hashHex === '992ca46c2fd3316de39a91858fe5a86de306d9e5956b2ad2f8bd709b00404c23') {
      if (selectedUser) onSelect(selectedUser);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-column border border-border-subtle p-8 rounded shadow-lg text-center">
        <div className="mb-10 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 534 513" className="w-16 h-auto mb-6 text-text-primary drop-shadow-lg">
            <polygon points="138,102 254,42 254,484 138,484" fill="currentColor" />
            <polygon points="321,316 321,484 420,484" fill="currentColor" />
          </svg>
          <h1 className="font-display tracking-widest text-3xl text-text-primary mb-2">Amygdylla</h1>
          <p className="text-text-muted text-sm font-medium tracking-wide">
            {!selectedUser ? "Select your identity to continue" : `Welcome, ${selectedUser}`}
          </p>
        </div>

        {!selectedUser ? (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUser(u)}
                className="px-4 py-3 bg-bg-card hover:bg-bg-card-hover border border-border-subtle rounded text-text-primary transition-colors text-left font-medium flex items-center justify-between group"
              >
                <span>{u}</span>
                <span className="text-bronze opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className={`w-full bg-bg-app border ${error ? 'border-status-blocked' : 'border-border-subtle'} rounded px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-bronze transition-colors`}
              autoFocus
            />
            {error && <span className="text-status-blocked text-xs text-left">Incorrect password</span>}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setPassword(''); setError(false); }}
                className="flex-1 px-4 py-2 bg-bg-app hover:bg-bg-card border border-border-subtle rounded text-text-primary transition-colors text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-bronze hover:brightness-110 text-bg-app rounded font-medium transition-all text-sm"
              >
                Enter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
