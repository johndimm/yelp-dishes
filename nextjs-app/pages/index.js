import { useEffect, useState, useRef, useCallback } from "react";
import DishImage from "../components/DishImage";
import DishSearch from "../components/DishSearch";
import { useRouter } from "next/router";

import Link from "next/link";

function DishCard({ dish, onPhotoError }) {
  const [photoUrls, setPhotoUrls] = useState([dish.photo_url]);
  const [captions, setCaptions] = useState([dish.caption || ""]);
  useEffect(() => {
    fetch(`/api/get_dish?dish_id=${dish.dish_id}&page_size=50&page_offset=0`)
      .then((res) => res.json())
      .then((data) => {
        const urls = data.map((d) => d.photo_url).filter(Boolean);
        const caps = data.map((d) => d.caption || "");
        if (urls.length) {
          setPhotoUrls(urls);
          setCaptions(caps);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line
  }, [dish.dish_id]);

  return (
    <Link href={{ pathname: "/dish", query: { dish_id: dish.dish_id, dish_name: dish.noun_phrase } }} passHref legacyBehavior>
      <a style={{ textDecoration: "none", color: "inherit" }}>
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 16,
            width: 250,
            boxShadow: "0 2px 8px #eee",
            background: "#fff"
          }}
        >
          <DishImage urls={photoUrls} captions={captions} alt={dish.noun_phrase} onPhotoError={() => onPhotoError(dish.dish_id, dish.photo_url)} business_name={dish.business_name} showRestaurantInlineName={true} />
          <h2 style={{ fontSize: 20, margin: "16px 0 4px" }}>{dish.noun_phrase}</h2>
          {dish.business_name && (
            <div style={{ color: '#888', fontSize: 15, fontWeight: 500, marginBottom: 8, textAlign: 'center' }}>
              {dish.business_name}
            </div>
          )}

        </div>
      </a>
    </Link>
  );
}


export default function Home() {
  const router = useRouter();
  const [dishes, setDishes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageOffset, setPageOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const PAGE_SIZE = 12;

  const fetchDishes = useCallback(async (offset) => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/get_popular_dishes?page_size=${PAGE_SIZE}&page_offset=${offset}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setDishes((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
        setPageOffset((prev) => prev + PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [hasMore]);

  useEffect(() => {
    fetchDishes(0);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 300 &&
        !loading && hasMore
      ) {
        fetchDishes(pageOffset);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchDishes, loading, hasMore, pageOffset]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 32, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Popular Dishes</h1>
      <DishSearch
        onSelect={() => {}}
        onSearch={async (query) => {
          if (!query) {
            setDishes([]);
            setPageOffset(0);
            setHasMore(true);
            fetchDishes(0);
            return;
          }
          if (query.length < 2) {
            setDishes([]);
            setPageOffset(0);
            setHasMore(true);
            fetchDishes(0);
            return;
          }
          setDishes([]); // Clear before showing new results
          setLoading(true);
          setHasMore(false); // Disable infinite scroll during search
          try {
            const res = await fetch(`/api/search_dish_cards?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setDishes(data);
          } finally {
            setLoading(false);
          }
        }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {dishes.map((dish) => (
          <DishCard
            key={dish.dish_id + '-' + dish.photo_url}
            dish={dish}
            onPhotoError={() => setDishes((prev) => prev.filter((d) => d.dish_id !== dish.dish_id))}
          />
        ))}

      </div>
      {loading && <p>Loading...</p>}
      {!hasMore && !loading && <p style={{ color: '#888', marginTop: 32 }}>No more dishes to load.</p>}
    </div>
  );
}

