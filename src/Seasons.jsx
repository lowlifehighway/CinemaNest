import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Loading from './Loading';
import { CloseCircle } from 'iconsax-react';
import { PORT, imgPath, imgPlaceholder } from './Port';

export default function Seasons() {
  const navigate = useNavigate();
  const location = useLocation();
  const { numberOfSeasons } = location.state;
  const [selectedSeason, setSelectedSeason] = useState(0);

  return (
    <div className="seasons-container">
      <div className="seasons">
        <div className="season-nav">
          <div className="season-buttons">
            {Array.from({ length: numberOfSeasons }, (_, i) => i).map(
              (index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSeason(index)}
                  className={selectedSeason === index ? 'active' : ''}
                >
                  {'Season ' + (index + 1)}
                </button>
              )
            )}
          </div>
          <CloseCircle
            className="go-back"
            onClick={() => {
              navigate(-1);
            }}
            variant="Bulk"
          />
        </div>

        {Array.from({ length: numberOfSeasons }, (_, i) => i).map((index) => {
          return (
            <div
              key={index}
              className={selectedSeason === index ? '' : 'hidden'}
            >
              <Season seasonNum={index + 1} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Season({ seasonNum }) {
  const { id } = useParams();
  const [season, setSeason] = useState(null);

  useEffect(() => {
    async function fetchSeasonData() {
      if (seasonNum) {
        // Ensure number_of_seasons is defined
        try {
          const cachedSeason = sessionStorage.getItem(
            `tv-${id}-season-${seasonNum}`
          );
          if (cachedSeason) {
            setSeason(JSON.parse(cachedSeason));
          } else {
            const seasonResponse = await fetch(
              `${PORT}/tv/${seasonNum}/${id}` // Use number_of_seasons directly from tv
            );
            const seasonData = await seasonResponse.json();
            sessionStorage.setItem(
              `tv-${id}-season-${seasonNum}`,
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
    if (seasonNum) {
      fetchSeasonData();
    }
  }, [id, seasonNum]);

  function getBackgroundColor(voteAverage) {
    if (voteAverage >= 9.0) return 'darkgreen'; // 9 - 10
    if (voteAverage >= 7.0) return 'green'; // 7 - 9
    if (voteAverage >= 5.0) return 'yellow'; // 5 - 7
    if (voteAverage >= 3.0) return 'lightcoral'; // 3 - 5
    return 'darkred'; // 0 - 3
  }

  return (
    <>
      {season != null ? (
        <>
          <div className="season-container">
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
                      {season.vote_average.toFixed(1)}
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
                <ul className="episodes show" style={{ maxHeight: 'unset' }}>
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
            </div>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
