import { Link, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Play, CloseSquare } from 'iconsax-react';
import Loading from './Loading';
import LeftRightArrows from './LeftRightArrows';
import Items from './Items';
import { PORT, imgPath, imgPlaceholder, personPlaceholder } from './Port';

export default function TvDetailPage() {
  const { id } = useParams();
  const [tv, setTv] = useState(null);
  const number_of_seasons = tv?.number_of_seasons;
  const [season, setSeason] = useState(null);
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [trailer, setTrailer] = useState('');
  const [playClosed, setPlayClosed] = useState(false);
  const [cast, setCast] = useState(null);
  const [media, setMedia] = useState(true);
  const castScrollRef = useRef(null);
  const mediaScrollRef = useRef(null);
  const [recommendations, setRecommendations] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const seasonEpisodesRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if the data is already in sessionStorage
        const cachedTv = sessionStorage.getItem(`tv-tv-${id}`);
        const cachedVideos = sessionStorage.getItem(`tv-videos-${id}`);
        const cachedImages = sessionStorage.getItem(`tv-images-${id}`);
        const cachedCast = sessionStorage.getItem(`tv-cast-${id}`);
        const cachedRecommendations = sessionStorage.getItem(
          `tv-recommendations-${id}`
        );

        if (
          cachedTv &&
          cachedVideos &&
          cachedImages &&
          cachedCast &&
          cachedRecommendations
        ) {
          // If all data is cached, parse and set it
          setTv(JSON.parse(cachedTv));
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
            tvResponse,
            videoResponse,
            imagesResponse,
            castResponse,
            recommendationsResponse,
          ] = await Promise.all([
            fetch(`${PORT}/tv/${id}`),
            fetch(`${PORT}/tv/video/${id}`),
            fetch(`${PORT}/tv/images/${id}`),
            fetch(`${PORT}/tv/credit/${id}`),
            fetch(`${PORT}/tv/recommendations/${id}`),
          ]);
          //Store Responses
          const tvData = await tvResponse.json();
          const videoData = await videoResponse.json();
          const imagesData = await imagesResponse.json();
          const castData = await castResponse.json();
          const recommendationsData = await recommendationsResponse.json();

          // Cache the results in sessionStorage
          sessionStorage.setItem(`tv-tv-${id}`, JSON.stringify(tvData));
          sessionStorage.setItem(
            `tv-videos-${id}`,
            JSON.stringify(videoData.results)
          );
          sessionStorage.setItem(
            `tv-images-${id}`,
            JSON.stringify(imagesData.backdrops)
          );
          sessionStorage.setItem(`tv-cast-${id}`, JSON.stringify(castData));
          sessionStorage.setItem(
            `tv-recommendations-${id}`,
            JSON.stringify(recommendationsData.results)
          );

          setTv(tvData);
          setVideos(videoData.results);
          setTrailer(
            videoData.results
              ?.filter((result) => result.type === 'Trailer')
              .filter(
                (result) =>
                  result.name.includes('Official Trailer') ||
                  result.name.includes('Trailer')
              )
              .map((result) => result)[0]
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
  useEffect(() => {
    async function fetchSeasonData() {
      if (tv && number_of_seasons) {
        // Ensure number_of_seasons is defined
        try {
          const cachedSeason = sessionStorage.getItem(
            `tv-${id}-season-${number_of_seasons}`
          );
          if (cachedSeason) {
            setSeason(JSON.parse(cachedSeason));
          } else {
            const seasonResponse = await fetch(
              `${PORT}/tv/${number_of_seasons}/${id}` // Use number_of_seasons directly from tv
            );
            const seasonData = await seasonResponse.json();
            sessionStorage.setItem(
              `tv-${id}-season-${number_of_seasons}`,
              JSON.stringify(seasonData)
            );
            setSeason(seasonData);
          }
        } catch (error) {
          console.error('Error fetching season data', error);
          if (error.name === 'QuotaExceededError') {
            console.warn('SessionStorage is full. Clearing sessionStorage...');
            sessionStorage.clear(); // Clear sessionStorage
            return fetchSeasonData(); // Retry fetching data
          }
        }
      }
    }
    if (number_of_seasons) {
      fetchSeasonData();
    }
  }, [tv, id, number_of_seasons]);

  function toPlay(e, param) {
    e.preventDefault();
    if (param) document.documentElement.style.overflow = 'hidden';
    else document.documentElement.style.overflow = '';
    setPlayClosed(param);
  }
  function showVideoOrPictures(param) {
    setMedia(param);
  }
  function getBackgroundColor(voteAverage) {
    if (voteAverage >= 9.0) return 'darkgreen'; // 9 - 10
    if (voteAverage >= 7.0) return 'green'; // 7 - 9
    if (voteAverage >= 5.0) return 'yellow'; // 5 - 7
    if (voteAverage >= 3.0) return 'lightcoral'; // 3 - 5
    return 'darkred'; // 0 - 3
  }
  function toggleEpisodes() {
    setShowEpisodes(!showEpisodes);
    if (seasonEpisodesRef.current) {
      const offset = 100; // Define the offset value
      const elementPosition =
        seasonEpisodesRef.current.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      // Scroll with smooth behavior
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }

  if (!tv) return <Loading />;

  const calcDate = (date) => {
    if (date)
      return new Intl.DateTimeFormat(navigator.language, {
        year: 'numeric',
      }).format(new Date(date));
  };
  const releaseDate = calcDate(tv.first_air_date);
  const endDate = calcDate(tv.last_air_date);

  return (
    <div className="show-details">
      <HelmetProvider>
        <Helmet>
          <title>{`${tv?.name} | CinemaNest`}</title>
          <meta name="description" content={tv.overview} />
        </Helmet>
      </HelmetProvider>
      <div className="details-container">
        <div className="details-poster">
          <img
            src={tv.poster_path ? imgPath + tv.poster_path : imgPlaceholder}
            alt={`${tv.name} poster`}
          />
        </div>
        <div className="details">
          <h1>{tv.name}</h1>
          <ul className="details-info">
            <li>
              {releaseDate}-{tv.status === 'Ended' ? endDate : ''}
            </li>
            <li>{tv.genres.map((genre) => genre.name).join(', ')}</li>
            {tv.last_episode_to_air ? (
              <li>
                {tv.last_episode_to_air.season_number > 1
                  ? tv.last_episode_to_air.season_number + ' seasons'
                  : tv.last_episode_to_air.season_number + ' season'}
              </li>
            ) : (
              ''
            )}
          </ul>
          <div className="rating">
            TMDB Rating
            <p>
              {Math.round(tv.vote_average * 10) / 10} <span>/ 10</span>
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
          <p className="tagline">{tv.tagline}</p>
          {tv.created_by.length > 0 && (
            <div>
              <h2>Created By</h2>
              <div className="creators">
                {tv.created_by.map((p, index) => {
                  return <p key={index}>{p.name}</p>;
                })}
              </div>
            </div>
          )}
          <div className="overview">
            <h2>Overview</h2>
            <p>{tv.overview}</p>
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

      {/* SEASON */}

      {season != null ? (
        <div ref={seasonEpisodesRef}>
          <div className="season-container">
            <div className="season-header">
              <h2>
                {tv.status === 'Ended' ? 'Final Season' : 'Current Season'}
              </h2>
              <Link
                to={`seasons`}
                state={{ numberOfSeasons: number_of_seasons }}
              >
                View All Seasons
              </Link>
            </div>
            <div className="season-episodes">
              <div className="season">
                <div className="season-poster">
                  <img
                    src={
                      season.poster_path
                        ? imgPath + season.poster_path
                        : imgPlaceholder
                    }
                    alt=""
                  />
                </div>
                <div className="season-info">
                  <h3>
                    {season.name}{' '}
                    <span
                      className="season-rating"
                      style={{
                        backgroundColor: getBackgroundColor(
                          season.vote_average
                        ),
                      }}
                    >
                      {season.vote_average?.toFixed(1)}
                    </span>
                  </h3>
                  <p className="season-air-date">{season.air_date}</p>
                  <p>
                    {season.episodes.length}
                    {season.episodes.length > 1 ? ' Episodes' : 'Episode'}
                  </p>
                  <p>{season.overview}</p>
                </div>
              </div>
              <div>
                <ul className={`episodes ${showEpisodes ? 'show' : ''}`}>
                  {season.episodes.map((episode) => (
                    <li key={episode.id} className="episode">
                      <div className="episode-img">
                        <img
                          src={
                            episode.still_path
                              ? imgPath + episode.still_path
                              : imgPlaceholder
                          }
                          alt=""
                        />
                      </div>
                      <div className="episode-info">
                        <div>
                          <strong>
                            S{season.season_number} Ep{episode.episode_number}.{' '}
                            {episode.name}
                            <p
                              className="episode-rating"
                              style={{
                                backgroundColor: getBackgroundColor(
                                  episode.vote_average.toFixed(1)
                                ),
                              }}
                            >
                              {episode.vote_average.toFixed(1)}
                            </p>
                          </strong>
                          <p style={{ opacity: '.5' }}>
                            {new Intl.DateTimeFormat(navigator.language, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short',
                            }).format(new Date(episode.air_date))}
                          </p>
                        </div>
                        <p className="episode-runtime">
                          {episode.runtime} minutes
                        </p>

                        <p>
                          {episode.episode_type === 'finale' ? 'finale' : null}
                        </p>
                        <p>{episode.overview}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="toggle-episodes" onClick={toggleEpisodes}>
                {showEpisodes ? 'Hide Episodes' : 'Show Episodes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Loading />
      )}

      {/* CAST */}
      {cast.cast.length > 0 && (
        <div className="cast-outer">
          <h2>Cast</h2>
          <div className="cast-container" ref={castScrollRef}>
            {cast.cast.slice(0, 10).map((cast, index) => {
              return (
                <div key={index}>
                  <div className="cast">
                    <img
                      src={
                        cast.profile_path
                          ? imgPath + cast.profile_path
                          : personPlaceholder
                      }
                      alt={cast.name}
                    />
                    <div className="cast-info">
                      <p className="cast-name">{cast.name}</p>
                      <p className="cast-character">
                        {cast.roles[0].character}
                      </p>
                      <p className="cast-episodes">
                        {cast.total_episode_count + ' episodes'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <LeftRightArrows arrowRef={castScrollRef} />
          </div>
          <Link to={'cast'} crew={cast}>
            See full list
          </Link>
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
          <div className="media-container-outer">
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
            <LeftRightArrows arrowRef={mediaScrollRef} />
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
