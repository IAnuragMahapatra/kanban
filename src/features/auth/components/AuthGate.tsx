import { useState } from 'react';
import { type User } from '../../../types';
import { CheckSquare } from 'lucide-react';

interface AuthGateProps {
  onSelect: (user: User) => void;
}

export function AuthGate({ onSelect }: AuthGateProps) {
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
      onSelect('Anurag');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-column border border-border-subtle p-8 rounded shadow-lg text-center">
        <div className="mb-10 flex flex-col items-center">
          <CheckSquare size={48} className="mb-6 text-bronze drop-shadow-lg" />
          <h1 className="font-display tracking-widest text-3xl text-text-primary mb-2">Anurag's Kanban</h1>
          <p className="text-text-muted text-sm font-medium tracking-wide">
            Enter your password to access the board
          </p>
        </div>

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
              type="submit"
              className="flex-1 px-4 py-2 bg-bronze hover:brightness-110 text-bg-app rounded font-medium transition-all text-sm"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
