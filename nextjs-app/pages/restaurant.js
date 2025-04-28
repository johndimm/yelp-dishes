import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DishImage from "../components/DishImage";
import Link from "next/link";

export default function RestaurantPage() {
  const router = useRouter();
  const { business_id, restaurant_name } = router.query;
  const [dishes, setDishes] = useState([]); // [{dish_id, noun_phrase, photo_urls, captions}]
  const [businessName, setBusinessName] = useState(restaurant_name || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business_id) return;
    fetch(`/api/get_business?business_id=${business_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setBusinessName(data[0].business_name);
      });
    fetch(`/api/get_business_dishes?business_id=${business_id}`)
      .then(res => res.json())
      .then(data => {
        // Group unique photos/captions per dish
        const byDish = {};
        data.forEach(d => {
          if (d.dish_id && d.photo_url) {
            if (!byDish[d.dish_id]) {
              byDish[d.dish_id] = { dish_id: d.dish_id, noun_phrase: d.noun_phrase, photo_urls: [], captions: [] };
            }
            if (!byDish[d.dish_id].photo_urls.includes(d.photo_url)) {
              byDish[d.dish_id].photo_urls.push(d.photo_url);
              byDish[d.dish_id].captions.push(d.caption || "");
            }
          }
        });
        setDishes(Object.values(byDish));
        setLoading(false);
      });
  }, [business_id]);

  return (
    <div style={{ padding: 32 }}>
      <Link href="/" passHref legacyBehavior>
        <a style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#333', marginBottom: 24, fontWeight: 500, fontSize: 18 }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10L10 4L17 10" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10V17H15V10" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Home
        </a>
      </Link>
      <h1>{businessName || 'Restaurant'}</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {dishes.map(({ dish_id, noun_phrase, photo_urls, captions }) => (
          <Link href={{ pathname: '/dish', query: { dish_id, dish_name: noun_phrase } }} passHref legacyBehavior>
            <a style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, width: 250, background: '#fff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <DishImage urls={photo_urls} captions={captions} alt={noun_phrase} {...(photo_urls.length > 1 ? { autoPlay: true } : {})} style={{ width: 218, height: 218, borderRadius: 4 }} showRestaurantName={false} />
                </div>
                <h2 style={{ fontSize: 18, margin: '12px 0 0' }}>{noun_phrase}</h2>
              </div>
            </a>
          </Link>
        ))}
      </div>
      {!loading && dishes.length === 0 && <p>No dishes found for this restaurant.</p>}
    </div>
  );
}
