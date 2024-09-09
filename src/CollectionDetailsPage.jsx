import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Loading from './Loading';
import Items from './Items';
import { PORT, imgPath } from './Port';

export default function CollectionDetailsPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const collectionResponse = await fetch(`${PORT}/collection/${id}`);
        const collectionData = await collectionResponse.json();

        setCollection(collectionData);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    }
    fetchData();
  }, [id]); // Dependency array to avoid infinite loop
  if (!collection) return <Loading />;
  return (
    <div style={{ width: '100%' }}>
      {/* Render your collection details here */}
      <HelmetProvider>
        <Helmet>
          <title>{`${collection?.name} | CinemaNest`}</title>
          <meta name="description" content={collection.overview} />
        </Helmet>
      </HelmetProvider>
      <div className="details-container">
        <div className="details-poster">
          <img
            src={imgPath + collection.poster_path}
            alt={`${collection.title} poster`}
          />
        </div>
        <div className="details">
          <h1>{collection.name}</h1>
          <div className="rating">
            TMDB Rating
            <p>
              {(
                collection.parts
                  .map((part) => {
                    return Math.round(part.vote_average * 10) / 10;
                  })
                  .reduce((acc, cur) => acc + cur) / collection.parts.length
              ).toFixed(1)}
              <span>/ 10</span>
            </p>
          </div>

          {/* <p className="tagline">{collection.tagline}</p> */}
          <div className="overview">
            <h2>Overview</h2>
            <p>{collection.overview}</p>
          </div>
        </div>
      </div>
      <div className="section-container">
        <Items items={collection.parts} />
      </div>
    </div>
  );
}
