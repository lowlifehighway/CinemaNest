import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Nav() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (search) {
      // sessionStorage.setItem('search', search);
      navigate(`/search/${search}`);
      sessionStorage.removeItem('searchTabValue');
      setSearch('');
    }
  }

  return (
    <header>
      <div className="topnav">
        <Link to="/" className="logo-container">
          <img src="/logo.jpg" alt="" />
          <h1 className="logo">CinemaNest</h1>
        </Link>
        <div className="link-to-movies-tv">
          <Link to={'/movies'}>Movies</Link>
          <Link to={'/tv'}>Tv Shows</Link>
        </div>
        <div className="search-bar">
          <form action="" role="search" id="form" onSubmit={handleSubmit}>
            <input
              type="search"
              id="query"
              name="q"
              placeholder="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
      </div>
    </header>
  );
}
