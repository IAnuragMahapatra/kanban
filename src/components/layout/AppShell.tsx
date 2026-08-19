import { useState } from 'react';
import { Filter, ArrowUpDown, Check, Search, CheckSquare } from 'lucide-react';
import { type Status } from '../../types';

export type SortOption = 'Manual' | 'Deadline' | 'Creation Date' | 'Alphabetical';

interface AppShellProps {
  onSearch: (query: string) => void;
  onAddTrigger: () => void;
  children: React.ReactNode;
  
  hiddenStatuses: Status[];
  setHiddenStatuses: (v: Status[]) => void;
  
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
}

export function AppShell({ 
  onSearch, 
  onAddTrigger,
  hiddenStatuses, setHiddenStatuses,
  sortBy, setSortBy,
  children 
}: AppShellProps) {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-app">
      {/* Top Bar */}
      <header className="h-16 border-b border-border-subtle bg-bg-app flex items-center px-4 md:px-6 justify-between shrink-0 relative">
        
        {/* Left: Logo */}
        <div className="hidden sm:flex items-center gap-3 w-1/3">
          <CheckSquare size={20} className="text-bronze" />
          <span className="font-display tracking-widest text-lg hidden md:block">Anurag's Kanban</span>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center px-4">
          <div className="flex items-center bg-bg-app rounded border border-border-subtle px-3 py-1.5 focus-within:border-bronze transition-colors w-full max-w-md">
            <Search size={14} className="text-text-muted mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={handleSearch}
              className="bg-transparent border-none text-sm text-text-primary focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 sm:w-1/3 shrink-0">
          
          {/* Sort */}
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isSortOpen || sortBy !== 'Manual' ? 'bg-bg-card border border-border-subtle text-bronze' : 'text-text-primary hover:bg-bg-card-hover'}`}
              title="Sort By"
            >
              <ArrowUpDown size={16} />
            </button>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-bg-column border border-border-subtle rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-text-muted tracking-widest uppercase">Sort By</div>
                  {(['Manual', 'Deadline', 'Creation Date', 'Alphabetical'] as SortOption[]).map(opt => (
                    <button 
                      key={opt}
                      onClick={() => setSortBy(opt)}
                      className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-bg-card-hover text-sm text-text-primary text-left"
                    >
                      <span>{opt}</span>
                      {sortBy === opt && <Check size={14} className="text-bronze" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isFilterOpen || hiddenStatuses.length > 0 ? 'bg-bg-card border border-border-subtle text-bronze' : 'text-text-primary hover:bg-bg-card-hover'}`}
              title="Filters"
            >
              <Filter size={16} />
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-bg-column border border-border-subtle rounded-lg shadow-xl py-2 z-50 flex flex-col gap-2 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">


                  {/* Status Checklists */}
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-text-muted tracking-widest uppercase">Show Status</div>
                    {['TRIAGE', 'TODO', 'SCHEDULED', 'READY', 'RUNNING', 'BLOCKED', 'DONE', 'ARCHIVED'].map((status) => {
                      const isHidden = hiddenStatuses.includes(status as Status);
                      return (
                        <button 
                          key={status}
                          onClick={() => {
                            if (isHidden) {
                              setHiddenStatuses(hiddenStatuses.filter(s => s !== status));
                            } else {
                              setHiddenStatuses([...hiddenStatuses, status as Status]);
                            }
                          }}
                          className="w-full flex items-center justify-between px-3 py-1 hover:bg-bg-card-hover text-sm text-text-primary text-left"
                        >
                          <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                          {!isHidden && <Check size={14} className="text-bronze" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-border-subtle mx-1 hidden sm:block"></div>

          {/* Quick Add */}
          <button 
            onClick={onAddTrigger}
            className="w-8 h-8 rounded bg-bg-column hover:bg-bg-card-hover border border-border-subtle text-text-primary flex items-center justify-center transition-colors shrink-0"
            title="Quick Add (C)"
          >
            +
          </button>


      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
