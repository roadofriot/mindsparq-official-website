import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Layers,
  BookOpen,
  FileText,
  Users,
  Image as ImageIcon,
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
  Command,
  Loader2
} from 'lucide-react';
import {
  searchAdminContent,
  SearchResultItem,
  SearchCategory
} from '../../services/searchService';

interface AdminUniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_TABS: { key: SearchCategory; label: string }[] = [
  { key: 'all', label: 'All Content' },
  { key: 'section', label: 'Homepage Sections' },
  { key: 'course', label: 'Courses' },
  { key: 'blog', label: 'Articles' },
  { key: 'team', label: 'Faculty' },
  { key: 'media', label: 'Media' },
  { key: 'event', label: 'Events' },
  { key: 'navigation', label: 'Pages' }
];

export const AdminUniversalSearch: React.FC<AdminUniversalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchCategory>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Execute search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const hits = await searchAdminContent(query, activeTab);
        setResults(hits);
        setSelectedIndex(0);
      } catch (err) {
        console.error('[AdminUniversalSearch] Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : prev));
        scrollSelectedIntoView(selectedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        scrollSelectedIntoView(selectedIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const scrollSelectedIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.search-result-row');
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    onClose();
    navigate(item.targetRoute);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'section':
        return <Layers size={16} />;
      case 'course':
        return <BookOpen size={16} />;
      case 'blog':
        return <FileText size={16} />;
      case 'team':
        return <Users size={16} />;
      case 'media':
        return <ImageIcon size={16} />;
      case 'event':
        return <Calendar size={16} />;
      default:
        return <Compass size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 10, 20, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 20px',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'var(--color-surface, #0b1329)',
          borderRadius: '16px',
          border: '1px solid var(--color-border, rgba(56, 189, 248, 0.25))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 120px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          {loading ? (
            <Loader2 size={20} className="spin" style={{ color: 'var(--color-primary-500, #38bdf8)' }} />
          ) : (
            <Search size={20} style={{ color: 'var(--color-primary-500, #38bdf8)' }} />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any word, course, sentence, section or author to jump directly..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'var(--color-text, #ffffff)',
              fontWeight: 500
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary, #94a3b8)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary, #94a3b8)'
            }}
          >
            ESC
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            overflowX: 'auto',
            borderBottom: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            backgroundColor: 'rgba(0, 0, 0, 0.15)'
          }}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#38bdf8' : 'var(--color-text-secondary, #94a3b8)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            minHeight: '260px'
          }}
        >
          {query.trim() === '' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--color-text-secondary, #94a3b8)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#38bdf8'
                }}
              >
                <Command size={24} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--color-text, #ffffff)' }}>
                Universal MindSparQ Deep Search
              </h4>
              <p style={{ margin: 0, fontSize: '13px', maxWidth: '420px', lineHeight: 1.5 }}>
                Search across all educational curriculum, blog markdown text, homepage sections, faculty profiles, and media assets in one place.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  Try: "Abacus"
                </span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  Try: "Robotics"
                </span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  Try: "Kalikanagar"
                </span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  Try: "VAK"
                </span>
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--color-text-secondary, #94a3b8)'
              }}
            >
              <p style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--color-text, #ffffff)' }}>
                No matching content found for "{query}"
              </p>
              <p style={{ fontSize: '12px', margin: 0 }}>
                Try searching with fewer words or change the category filter above.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {results.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={item.id}
                    className="search-result-row"
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    {/* Icon Badge */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: `${item.badgeColor}22`,
                        color: item.badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    {/* Content details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text, #ffffff)' }}>
                          {item.title}
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: `${item.badgeColor}25`,
                            color: item.badgeColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Location Breadcrumb */}
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#38bdf8',
                          fontWeight: 500,
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Location:</span>
                        <span style={{ color: 'var(--color-text-secondary, #cbd5e1)' }}>{item.locationPath}</span>
                      </div>

                      {/* Snippet */}
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-secondary, #94a3b8)',
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {item.snippet}
                      </div>
                    </div>

                    {/* Arrow / Jump indicator */}
                    <div
                      style={{
                        alignSelf: 'center',
                        color: isSelected ? '#38bdf8' : 'rgba(255,255,255,0.2)',
                        paddingLeft: '4px'
                      }}
                    >
                      <ArrowRight size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderTop: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--color-text-secondary, #64748b)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><strong style={{ color: '#94a3b8' }}>↑↓</strong> Navigate</span>
            <span><strong style={{ color: '#94a3b8' }}>Enter</strong> Open & Edit</span>
            <span><strong style={{ color: '#94a3b8' }}>Esc</strong> Close</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} style={{ color: '#38bdf8' }} />
            <span>MindSparQ Deep Content Index</span>
          </div>
        </div>
      </div>
    </div>
  );
};
