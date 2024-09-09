import { useState, useEffect } from 'react';
import Items from './Items';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Loading from './Loading';
import { PORT } from './Port';

export default function Homepage() {
  const [trending, setTrending] = useState(null);
  useEffect(() => {
    async function fetchContent() {
      // Check cache
      const cachedData = sessionStorage.getItem('trending-today');
      try {
        if (cachedData) {
          setTrending(JSON.parse(cachedData));
          return;
        } else {
          const res = await fetch(`${PORT}/trending-today`);
          const data = await res.json();
          setTrending(data.results);
          sessionStorage.setItem(
            'trending-today',
            JSON.stringify(data.results)
          );
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        if (error.name === 'QuotaExceededError') {
          console.warn('SessionStorage is full. Clearing sessionStorage...');
          sessionStorage.clear(); // Clear sessionStorage
          return fetchContent(); // Retry fetching data
        }
      }
    }
    fetchContent();
  }, []);
  if (!trending) return <Loading />;
  return (
    <>
      <div className="trending">
        <HelmetProvider>
          <Helmet>
            <title>{`CinemaNest`}</title>
            <meta name="description" content="filler" />
          </Helmet>
        </HelmetProvider>
        <h2 className="section-title">Trending Today</h2>
        <div className="section-container">
          <Items items={trending} />
        </div>
      </div>
    </>
  );
}
