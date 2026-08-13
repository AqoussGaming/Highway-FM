import { useState } from 'react';
import { X } from 'lucide-react';
import { LIBRARY, type Category, type Track } from '../data/playlist';

const CATEGORIES: Category[] = [
  'ALL',
  '90S',
  'EARLY 2000S',
  'KUMAR SANU',
  'ROAD TRIP',
  'ROMANTIC',
  'CLASSIC',
  'NIGHT DRIVE',
];

interface Props {
  open: boolean;
  onClose: () => void;
  currentTrackId: string;
  onSelect: (id: string) => void;
}

export function Playlist({ open, onClose, currentTrackId, onSelect }: Props) {
  const [category, setCategory] = useState<Category>('ALL');
  if (!open) return null;

  const tracks: Track[] = LIBRARY.filter((t) => t.categories.includes(category));

  return (
    <div className="playlist-overlay" onClick={onClose}>
      <div
        className="playlist-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Playlist"
      >
        <div className="playlist-header">
          <div>
            <span className="eyebrow">Highway FM</span>
            <h3>{tracks.length} tracks</h3>
          </div>
          <button className="icon-btn small" onClick={onClose} aria-label="Close playlist">
            <X size={18} />
          </button>
        </div>

        <div className="category-row" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <ol className="track-list">
          {tracks.map((t, i) => (
            <li key={t.id}>
              <button
                className={`track-row ${t.id === currentTrackId ? 'active' : ''}`}
                onClick={() => onSelect(t.id)}
                aria-current={t.id === currentTrackId}
              >
                <span className="track-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="track-info">
                  <span className="track-row-title">{t.title}</span>
                  <span className="track-row-artist">{t.artist}</span>
                </span>
                <span className="track-year">{t.year}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
