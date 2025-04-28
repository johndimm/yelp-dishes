import { useState, useRef } from "react";

export default function DishSearch({ onSelect, onSearch = () => {} }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const timeout = useRef();

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShow(true);
    if (timeout.current) clearTimeout(timeout.current);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    timeout.current = setTimeout(async () => {
      const res = await fetch(`/api/autocomplete_words?q=${encodeURIComponent(value.split(/\s+/).pop())}`);
      const data = await res.json();
      setResults(data);
    }, 150);
  };

  const handleSelect = (word) => {
    // Replace the last word in the input with the selected word
    const parts = query.split(/\s+/);
    parts[parts.length - 1] = word;
    const newQuery = parts.join(' ');
    setQuery(newQuery);
    setShow(false);
    if (onSearch) onSearch(newQuery);
  };

  return (
    <div style={{ position: "relative", width: 300, marginBottom: 24 }}>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          placeholder="Search dishes..."
          value={query}
          onChange={handleChange}
          style={{ width: "100%", padding: 8, fontSize: 16, borderRadius: 4, border: "1px solid #ccc", boxSizing: 'border-box', paddingRight: query ? 32 : 8 }}
          onFocus={() => setShow(true)}
          autoComplete="off"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onSearch(query);
            }
          }}
        />
        {query && (
          <button
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 18,
              color: '#888',
              padding: 0,
              lineHeight: 1
            }}
            onClick={() => {
              setQuery("");
              setResults([]);
              setShow(false);
              onSearch("");
            }}
          >
            ×
          </button>
        )}
      </div>

      {show && query && (
        <ul style={{
          position: "absolute", left: 0, right: 0, top: 38, background: "#fff", border: "1px solid #ccc", borderRadius: 4, zIndex: 10, listStyle: "none", margin: 0, padding: 0, maxHeight: 200, overflowY: "auto"
        }}>
          {results.length === 0 ? (
            <li style={{ padding: 8, color: '#888' }}>No results</li>
          ) : results.map((word) => (
            <li
              key={word}
              onMouseDown={() => handleSelect(word)}
              style={{ padding: 8, cursor: "pointer", borderBottom: "1px solid #eee" }}
            >
              {word}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
