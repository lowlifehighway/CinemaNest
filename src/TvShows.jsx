import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from './Pagination';
import Items from './Items';
import Loading from './Loading';

import { PORT } from './Port';

export default function TvShows() {
  const total_pages = 275;
  const [tv, setTv] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => {
    return +searchParams.get('page') || 1;
  });

  useEffect(() => {
    async function fetchData() {
      const url = `${PORT}/popular-tv?page=${page}`;

      try {
        const cachedPopularMovies = sessionStorage.getItem(
          `popular-tv-${page}`
        );
        if (cachedPopularMovies) {
          setTv(JSON.parse(cachedPopularMovies));
          return;
        } else {
          const res = await fetch(url);
          const data = await res.json();

          sessionStorage.setItem(
            `popular-tv-${page}`,
            JSON.stringify(data.results)
          );
          setTv(data.results);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        if (error.name === 'QuotaExceededError') {
          console.warn('SessionStorage is full. Clearing sessionStorage...');
          sessionStorage.clear(); // Clear sessionStorage
          return fetchData(); // Retry fetching data
        }
      }
    }
    fetchData();
  }, [page]);
  if (!tv) return <Loading />;

  return (
    <div className="tv">
      <h2>Tv Shows</h2>
      <div className="section-container">
        <Items items={tv} media_type="tv" />
      </div>
      {tv && (
        <Pagination
          total_pages={total_pages}
          page={page}
          setPage={setPage}
          setSearchParams={setSearchParams}
        />
      )}
    </div>
  );
}
