import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DishImage from "../components/DishImage";
import Link from "next/link";

export default function DishPage() {
  const router = useRouter();
  const { dish_id, dish_name } = router.query;
  const [bizPhotos, setBizPhotos] = useState([]); // [{business_id, business_name, photo_urls: []}]
  const [dishName, setDishName] = useState(dish_name || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dish_id) return;
    fetch(`/api/get_dish?dish_id=${dish_id}&page_size=50&page_offset=0`)
      .then((res) => res.json())
      .then((data) => {
        // Deduplicate by restaurant name (case/trim-insensitive) or by first photo_url
        const seenNames = new Set();
        const seenPhotos = new Set();
        const cards = [];
        data.forEach(d => {
          if (d.business_id && d.business_name && d.photo_url) {
            const normName = d.business_name.trim().toLowerCase();
            if (seenNames.has(normName) || seenPhotos.has(d.photo_url)) return;
            seenNames.add(normName);
            seenPhotos.add(d.photo_url);
            // Collect all photos/captions for this business
            const photo_urls = data.filter(x => x.business_id === d.business_id).map(x => x.photo_url);
            const captions = data.filter(x => x.business_id === d.business_id).map(x => x.caption || "");
            cards.push({ business_id: d.business_id, business_name: d.business_name, photo_urls, captions });
          }
        });
        setBizPhotos(cards);
        if (data.length > 0 && data[0].noun_phrase) {
          setDishName(data[0].noun_phrase);
        } else {
          // fallback: fetch dish name from /api/search_dishes
          fetch(`/api/search_dishes?q=${dish_id}`)
            .then(res => res.json())
            .then(dishes => {
              if (dishes.length > 0) setDishName(dishes[0].noun_phrase);
            });
        }
        setLoading(false);
      });
  }, [dish_id]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <Link href="/" passHref legacyBehavior>
        <a style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#333', marginBottom: 24, fontWeight: 500, fontSize: 18 }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10L10 4L17 10" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10V17H15V10" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Home
        </a>
      </Link>
      <h1>{dishName || "Dish"}</h1>
      {loading && <p>Loading...</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {bizPhotos.map(({ business_id, business_name, photo_urls, captions }) => (
          <Link href={{ pathname: "/restaurant", query: { business_id, restaurant_name: business_name } }} passHref legacyBehavior>
            <a style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, width: 250, background: '#fff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <DishImage urls={photo_urls} captions={captions} alt={dishName} style={{ width: 218, height: 218, borderRadius: 4 }} {...(photo_urls.length > 1 ? { autoPlay: true } : {})} business_id={business_id} business_name={business_name} />
                </div>
                <h2 style={{ fontSize: 18, margin: '12px 0 0' }}>{business_name}</h2>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {!loading && bizPhotos.length === 0 && <p>No photos found for this dish.</p>}
    </div>
  );
}
