import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from './Loading';
import { CloseCircle } from 'iconsax-react';

import { PORT, imgPath, personPlaceholder } from './Port';

export default function FullCredit() {
  const [credit, setcredit] = useState(null);
  const { media_type, id } = useParams();
  const navigate = useNavigate();
  const [isVisibleCrew, setIsVisibleCrew] = useState(false);
  const [isVisibleCast, setIsVisibleCast] = useState(false);

  useEffect(() => {
    async function fetchcredit() {
      try {
        const cashedcredit = sessionStorage.getItem(`${media_type}-cast-${id}`);
        if (cashedcredit) {
          setcredit(JSON.parse(cashedcredit));
        } else {
          const res = await fetch(`${PORT}/${media_type}/credits/${id}`);
          if (!res.ok) throw new Error('Network response was not ok');
          const data = await res.json();
          setcredit(data.credit);
          sessionStorage.setItem(
            `${media_type}-cast-${id}`,
            JSON.stringify(data.credit)
          );
        }
      } catch (error) {
        console.error('Error fetching data', error);
        if (error.name === 'QuotaExceededError') {
          console.warn('SessionStorage is full. Clearing sessionStorage...');
          sessionStorage.clear(); // Clear sessionStorage
          return fetchcredit(); // Retry fetching data
        }
      }
    }

    fetchcredit();
    // Cleanup function if needed
    return () => {
      // Any necessary cleanup
    };
  }, [media_type, id]);

  const toggleVisibilityCast = () => {
    setIsVisibleCast(!isVisibleCast);
  };
  const toggleVisibilityCrew = () => {
    setIsVisibleCrew(!isVisibleCrew);
  };

  if (!credit) return <Loading />;

  return (
    <div className="credit-container">
      {/* Render credit information here */}
      <div>
        {credit.cast.length > 0 && (
          <div className="credit">
            <h2 onClick={toggleVisibilityCast}>
              Cast ({credit.cast.length}){' '}
              <span
                className={`dropdown-icon ${isVisibleCast ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </h2>
            {isVisibleCast && (
              <ul>
                {credit.cast.map((actor) => (
                  <li key={actor.credit_id}>
                    <img
                      src={
                        actor.profile_path
                          ? imgPath + actor.profile_path
                          : personPlaceholder
                      }
                      alt=""
                    />
                    <div>
                      <h3>{actor.name}</h3>
                      <p>
                        {actor.character ||
                          actor.roles
                            .flatMap((role) => role.character)
                            .join(', ')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {credit.crew.length > 0 && (
          <div className="credit">
            <h2 onClick={toggleVisibilityCrew}>
              Crew ({credit.crew.length}){' '}
              <span
                className={`dropdown-icon ${isVisibleCrew ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </h2>
            {isVisibleCrew && (
              <div>
                {Object.entries(
                  credit.crew.reduce((acc, crewMember) => {
                    // Grouping crew members by department
                    if (!acc[crewMember.department]) {
                      acc[crewMember.department] = [];
                    }
                    acc[crewMember.department].push(crewMember);
                    return acc;
                  }, {})
                ).map(([department, crewMembers]) => (
                  <div key={department} className="credit">
                    <h2>{department}</h2>
                    {/* Section header for each department */}
                    <ul>
                      {crewMembers.map((crewMember) => (
                        <li
                          key={
                            crewMember?.credit_id ||
                            crewMember.jobs[0]?.credit_id
                          }
                        >
                          <img
                            src={
                              crewMember.profile_path
                                ? imgPath + crewMember.profile_path
                                : personPlaceholder
                            }
                            alt=""
                          />
                          <div>
                            <h3>{crewMember.name}</h3>
                            <p>
                              {crewMember.job
                                ? crewMember.job
                                : crewMember.jobs
                                    .flatMap((job) => job.job)
                                    .join(', ')}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
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
  );
}
