import { Link, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Play, CloseSquare } from 'iconsax-react';
import Loading from './Loading';
import LeftRightArrows from './LeftRightArrows';
import Items from './Items';
import { PORT, imgPath } from './Port';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [trailer, setTrailer] = useState('');
  const [playClosed, setPlayClosed] = useState(false);
  const [cast, setCast] = useState(null);
  const [media, setMedia] = useState(true);
  const castScrollRef = useRef(null);
  const mediaScrollRef = useRef(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if the data is already in sessionStorage
        const cachedMovie = sessionStorage.getItem(`movie-movie-${id}`);
        const cachedVideos = sessionStorage.getItem(`movie-videos-${id}`);
        const cachedImages = sessionStorage.getItem(`movie-images-${id}`);
        const cachedCast = sessionStorage.getItem(`movie-cast-${id}`);
        const cachedRecommendations = sessionStorage.getItem(
          `movie-recommendations-${id}`
        );

        if (
          cachedMovie &&
          cachedVideos &&
          cachedImages &&
          cachedCast &&
          cachedRecommendations
        ) {
          // If all data is cached, parse and set it
          setMovie(JSON.parse(cachedMovie));
          setVideos(JSON.parse(cachedVideos));
          setTrailer(
            JSON.parse(cachedVideos)
              ?.filter((result) => result.type === 'Trailer')
              .filter(
                (result) =>
                  result.name.includes('Official Trailer') ||
                  result.name.includes('Trailer')
              )[0]
          );
          setImages(JSON.parse(cachedImages));
          setCast(JSON.parse(cachedCast));
          setRecommendations(JSON.parse(cachedRecommendations));
        } else {
          // If any data is missing, fetch it
          const [
            movieResponse,
            videoResponse,
            imagesResponse,
            castResponse,
            recommendationsResponse,
          ] = await Promise.all([
            fetch(`${PORT}/movie/${id}`),
            fetch(`${PORT}/movie/video/${id}`),
            fetch(`${PORT}/movie/images/${id}`),
            fetch(`${PORT}/movie/credit/${id}`),
            fetch(`${PORT}/movie/recommendations/${id}`),
          ]);
          //Store Responses
          const movieData = await movieResponse.json();
          const videoData = await videoResponse.json();
          const imagesData = await imagesResponse.json();
          const castData = await castResponse.json();
          const recommendationsData = await recommendationsResponse.json();

          // Cache the results in sessionStorage
          sessionStorage.setItem(
            `movie-movie-${id}`,
            JSON.stringify(movieData)
          );
          sessionStorage.setItem(
            `movie-videos-${id}`,
            JSON.stringify(videoData.results)
          );
          sessionStorage.setItem(
            `movie-images-${id}`,
            JSON.stringify(imagesData.backdrops)
          );
          sessionStorage.setItem(`movie-cast-${id}`, JSON.stringify(castData));
          sessionStorage.setItem(
            `movie-recommendations-${id}`,
            JSON.stringify(recommendationsData.results)
          );

          // Set state with the fetched data
          setMovie(movieData);
          setVideos(videoData.results);
          setTrailer(
            videoData.results
              ?.filter((result) => result.type === 'Trailer')
              .filter(
                (result) =>
                  result.name.includes('Official Trailer') ||
                  result.name.includes('Trailer')
              )[0]
          );
          setImages(imagesData.backdrops);
          setCast(castData);
          setRecommendations(recommendationsData.results);
        }
      } catch (error) {
        console.error('Error fetching data', error);
        if (error.name === 'QuotaExceededError') {
          console.warn('SessionStorage is full. Clearing sessionStorage...');
          sessionStorage.clear(); // Clear sessionStorage
          return fetchData(); // Retry fetching data
        }
      }
    }
    fetchData();
  }, [id]);

  function toPlay(e, param) {
    e.preventDefault();
    if (param) document.documentElement.style.overflow = 'hidden';
    else document.documentElement.style.overflow = '';
    setPlayClosed(param);
  }
  function showVideoOrPictures(param) {
    setMedia(param);
  }

  if (!movie) return <Loading />;

  const releaseDate = movie.release_date
    ? new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'medium',
      }).format(new Date(movie.release_date))
    : 'Unknown';

  const collectionName = movie?.belongs_to_collection?.name;
  const collectionNameUrl = collectionName
    ?.replaceAll(' ', '-')
    .replaceAll('/', '-');
  const collectionId = movie?.belongs_to_collection?.id;

  return (
    <div className="show-details">
      <HelmetProvider>
        <Helmet>
          <title>{`${movie?.title} | CinemaNest`}</title>
          <meta name="description" content={movie.overview} />
        </Helmet>
      </HelmetProvider>
      <div className="details-container">
        <div className="details-poster">
          <img
            src={imgPath + movie.poster_path}
            alt={`${movie.title} poster`}
          />
        </div>
        <div className="details">
          <h1>{movie.title}</h1>
          <ul className="details-info">
            <li>{releaseDate}</li>
            <li>{movie.genres.map((genre) => genre.name).join(', ')}</li>
            <li>
              {`${
                Math.floor(+movie.runtime / 60) > 0
                  ? Math.floor(+movie.runtime / 60) + 'hr'
                  : ''
              } ${movie.runtime % 60}min`}
            </li>
          </ul>
          <div className="rating">
            TMDB Rating
            <p>
              {Math.round(movie.vote_average * 10) / 10} <span>/ 10</span>
            </p>
          </div>
          {trailer ? (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
              href={``}
              className="trailer-link"
              onClick={(e) => toPlay(e, true)}
            >
              <Play size="32" variant="Bold" />
              <h3>Play Trailer</h3>
            </a>
          ) : (
            ''
          )}

          <p className="tagline">{movie.tagline}</p>
          <div className="overview">
            <h2>Overview</h2>
            <p>{movie.overview}</p>
          </div>
        </div>
      </div>

      {/* TRAILER */}
      {playClosed && trailer && (
        <div className="trailer-container-outside">
          <div className="trailer-container">
            <div className="trailer-topbar">
              <h3>Play {trailer.type}</h3>
              <CloseSquare
                size="38"
                variant="Bold"
                className="close-square"
                onClick={(e) => toPlay(e, false)}
              />
            </div>
            <div className="trailer">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* CAST */}
      {cast && (
        <div className="cast-outer">
          <h2>Cast</h2>
          <div className="cast-container" ref={castScrollRef}>
            {cast.cast.slice(0, 10).map((cast) => {
              return (
                <div key={cast.id}>
                  <div className="cast">
                    <img src={imgPath + cast.profile_path} alt={cast.name} />
                    <div className="cast-info">
                      <p className="cast-name">{cast.name}</p>
                      <p className="cast-character">{cast.character}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <LeftRightArrows arrowRef={castScrollRef} />
          </div>
          <Link to="cast">See full list</Link>
        </div>
      )}

      {/* MEDIA */}
      {(videos.length > 0 || images.length > 0) && (
        <div>
          <h2>MEDIA</h2>
          <ul className="media-buttons">
            <li
              className={`media-picture ${media && 'media-active'}`}
              onClick={() => showVideoOrPictures(true)}
            >
              Pictures
            </li>
            <li
              className={`media-video ${!media && 'media-active'}`}
              onClick={() => showVideoOrPictures(false)}
            >
              Videos
            </li>
          </ul>
          <div className="media-container-outer" ref={mediaScrollRef}>
            <div className={`${!media && 'hidden'}`}>
              {images.slice(0, 20).map((result) => {
                return (
                  <div key={result.file_path}>
                    <img src={imgPath + result.file_path} alt="" />
                  </div>
                );
              })}
            </div>
            <div className={`${media && 'hidden'}`}>
              {videos.map((result) => {
                return (
                  <div key={result.key}>
                    <div className="media">
                      <iframe
                        src={`https://www.youtube.com/embed/${result.key}`}
                        title={result.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* COLLECTION */}
      {movie.belongs_to_collection && (
        <div>
          <div className="section-title">
            <h2>COLLECTION</h2>
          </div>
          {/* <Items items={[movie.belongs_to_collection]} /> */}
          <div className="collection-container">
            <img
              src={imgPath + movie.belongs_to_collection.backdrop_path}
              alt={collectionName}
            />
            <div></div>
            <h3 style={{ zIndex: '5' }}>Part of the {collectionName}</h3>
            <Link to={`/collection/${collectionNameUrl}/${collectionId}`}>
              View Collection
            </Link>
          </div>
        </div>
      )}
      {/* RECOMMENDED */}
      {recommendations.length > 0 && (
        <div>
          <div className="section-title">
            <h2>RECOMMENDATIONS</h2>
          </div>
          <div className="section-container">
            <Items items={recommendations} />
          </div>
        </div>
      )}
    </div>
  );
}
