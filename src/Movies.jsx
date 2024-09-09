import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from './Pagination';
import Items from './Items';
import Loading from './Loading';

import { PORT } from './Port';

export default function Movies() {
  const total_pages = 500;
  const [movies, setMovies] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => {
    return +searchParams.get('page') || 1;
  });

  useEffect(() => {
    async function fetchData() {
      const url = `${PORT}/popular-movies?page=${page}`;

      try {
        const cachedPopularMovies = sessionStorage.getItem(
          `popular-movies-${page}`
        );
        if (cachedPopularMovies) {
          setMovies(JSON.parse(cachedPopularMovies));
          return;
        } else {
          const res = await fetch(url);
          const data = await res.json();

          sessionStorage.setItem(
            `popular-movies-${page}`,
            JSON.stringify(data.results)
          );
          setMovies(data.results);
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
  if (!movies) return <Loading />;

  return (
    <div className="movies">
      <h2>Movies</h2>
      <div className="section-container">
        <Items items={movies} media_type="movie" />
      </div>
      {movies && (
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
