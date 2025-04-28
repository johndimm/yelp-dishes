import { useState, useEffect, useRef } from "react";

function FadeImage({ src, alt, onError }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); }, [src]);
  return (
    <img
      src={src}
      alt={alt}
      onError={onError}
      onLoad={() => setLoaded(true)}
      style={{
        width: 400,
        height: 400,
        objectFit: 'contain',
        borderRadius: 8,
        background: '#000',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 350ms cubic-bezier(.4,0,.2,1)'
      }}
    />
  );
}

export default function DishImageModalContent({ urls, captions = [], alt, onPhotoError, startIndex = 0, business_name }) {
  const [index, setIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);

  // Reset index if startIndex changes (modal opened anew)
  useEffect(() => {
    setIndex(startIndex);
    setPaused(false);
  }, [startIndex]);
  const intervalRef = useRef();

  useEffect(() => {
    if (!paused && urls.length > 1) {
      intervalRef.current = setInterval(() => {
        setIndex(i => (i + 1) % urls.length);
      }, 2500);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [paused, urls]);

  const prev = e => {
    e.stopPropagation();
    setIndex(i => (i - 1 + urls.length) % urls.length);
    setPaused(false); // Resume slideshow after manual nav
  };
  const next = e => {
    e.stopPropagation();
    setIndex(i => (i + 1) % urls.length);
    setPaused(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 400, minHeight: 400 }}>
      {business_name && (
        <div style={{ fontSize: 18, fontWeight: 500, color: '#fff', textAlign: 'center', marginBottom: 8, opacity: 0.85, letterSpacing: 0.1 }}>
          {business_name}
        </div>
      )}
      <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, color: '#fff', textAlign: 'center', letterSpacing: 0.2 }}>{alt}</div>
      <div
        style={{ position: 'relative', width: 400, height: 400, borderRadius: 8, overflow: 'hidden', background: '#000' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        tabIndex={0}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <FadeImage
          key={urls[index]}
          src={urls[index]}
          alt={alt}
          onError={onPhotoError}
        />
        {urls.length > 1 && (
          <>
            <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 22, fontWeight: 'bold', zIndex: 2 }}>&lt;</button>
            <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 22, fontWeight: 'bold', zIndex: 2 }}>&gt;</button>
          </>
        )}
        {urls.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: '#222', fontWeight: 'bold', textShadow: '0 0 4px #fff', fontSize: 15 }}>
            {index + 1} / {urls.length}
          </div>
        )}
      </div>
      {captions && captions[index] && (
        <div style={{ fontSize: 16, fontStyle: 'italic', color: '#eee', marginTop: 18, minHeight: 22, textAlign: 'center', maxWidth: 380, textShadow: '0 2px 8px #000' }}>
          {captions[index]}
        </div>
      )}
    </div>
  );
}
