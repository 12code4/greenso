// WorldState (docs/10 §5): what the house remembers between floors, missions and
// sessions. Persisted to localStorage. NOT here (rule 10): Tan bodies, patrol
// positions, pocket rolls — those re-roll on every load.

const KEY = 'pp.world';

interface Saved {
  found?: string[];
  missions?: string[];
  flags?: string[];
  secrets?: string[];
  sideQuests?: string[];
  marbles?: Record<string, string[]>;
}

export class WorldState {
  /** Floor links found (free travel once found). */
  found = new Set<string>();
  /** Completed mission ids. */
  missions = new Set<string>();
  /** Persistent flags: permanent changes to the house (the ruler bridge, the lit attic). */
  flags = new Set<string>();
  /** Secrets discovered (docs/11 ids as `s<N>`). */
  secrets = new Set<string>();
  sideQuests = new Set<string>();
  /** Marble ids collected, per map. */
  marbles: Record<string, string[]> = {};

  constructor() {
    this.load();
  }

  load(): void {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const s = JSON.parse(raw) as Saved;
      this.found = new Set(s.found ?? []);
      this.missions = new Set(s.missions ?? []);
      this.flags = new Set(s.flags ?? []);
      this.secrets = new Set(s.secrets ?? []);
      this.sideQuests = new Set(s.sideQuests ?? []);
      this.marbles = s.marbles ?? {};
    } catch { /* no storage: a fresh house every time */ }
  }

  save(): void {
    try {
      const s: Saved = {
        found: [...this.found], missions: [...this.missions], flags: [...this.flags],
        secrets: [...this.secrets], sideQuests: [...this.sideQuests], marbles: this.marbles,
      };
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch { /* ignore */ }
  }

  markFound(linkId: string): boolean {
    const isNew = !this.found.has(linkId);
    this.found.add(linkId);
    if (isNew) this.save();
    return isNew;
  }

  completeMission(id: string): void { this.missions.add(id); this.save(); }
  setFlag(f: string): void { this.flags.add(f); this.save(); }
  foundSecret(id: string): boolean { const isNew = !this.secrets.has(id); this.secrets.add(id); if (isNew) this.save(); return isNew; }
  collectMarble(map: string, id: string): void {
    const list = this.marbles[map] ?? (this.marbles[map] = []);
    if (!list.includes(id)) { list.push(id); this.save(); }
  }
  hasMarble(map: string, id: string): boolean { return !!this.marbles[map]?.includes(id); }

  reset(): void {
    this.found.clear(); this.missions.clear(); this.flags.clear(); this.secrets.clear(); this.sideQuests.clear(); this.marbles = {};
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }
}
