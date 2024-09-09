import { useRoutes } from 'react-router-dom';
import Homepage from './Homepage';
import Nav from './Nav';
import Movies from './Movies';
import TvShows from './TvShows';
import MovieDetailPage from './MovieDetailsPage';
import TvDetailPage from './TvDetailsPage';
import FullCredit from './FullCredit';
import CollectionDetailsPage from './CollectionDetailsPage';
import PersonDetailPage from './Person';
import Search from './Search';
import NotFound from './NotFound';
import Loading from './Loading';
import Seasons from './Seasons';

function AppRoutes() {
  const routes = [
    ...['/', '/home'].map((home) => {
      return { path: home, element: <Homepage /> };
    }),
    { path: '/movies', element: <Movies /> },
    { path: '/tv', element: <TvShows /> },
    { path: '/movie/:name/:id', element: <MovieDetailPage /> },
    { path: '/tv/:name/:id', element: <TvDetailPage /> },
    { path: '/tv/:name/:id/seasons', element: <Seasons /> },
    { path: '/:media_type/:name/:id/cast', element: <FullCredit /> },
    { path: '/collection/:name/:id', element: <CollectionDetailsPage /> },
    { path: '/person/:name/:id', element: <PersonDetailPage /> },
    { path: '/search/:search', element: <Search /> },
    { path: '*', element: <NotFound /> },
    { path: '/loading', element: <Loading /> },
  ];

  return useRoutes(routes);
}

export default function App() {
  return (
    <>
      <Nav />
      <div className="main">
        <AppRoutes />
      </div>
    </>
  );
}
