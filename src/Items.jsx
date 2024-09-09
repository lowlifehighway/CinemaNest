import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Loading from './Loading';
import LeftRightArrows from './LeftRightArrows';
import { imgPath, imgPlaceholder } from './Port';

export default function Items({ items, media_type }) {
  const sectionRef = useRef(null);

  if (!Array.isArray(items) || items.length < 1) return <Loading />;

  return (
    <>
      <section className="section" ref={sectionRef}>
        {items.map((item) => (
          <Item item={item} key={item.id} media_type={media_type} />
        ))}
        <LeftRightArrows arrowRef={sectionRef} />
      </section>
    </>
  );
}

function Item({ item, media_type }) {
  const name = item.title || item.name;
  const nameUrl = name.replaceAll(' ', '-').replaceAll('/', '-');

  return (
    <div className="column">
      <Link
        to={`/${item.media_type || media_type}/${nameUrl}/${item.id}`}
        className="card"
      >
        <figure>
          <img
            src={
              item.poster_path || item.profile_path
                ? imgPath + (item.poster_path || item.profile_path)
                : imgPlaceholder
            }
            alt={`${name} poster`}
            className="thumbnail"
            draggable={false}
          />
          <figcaption>
            <h4 title={item.original_title || name} className="item-title">
              {name}
            </h4>
            {item.vote_average > 0 && (
              <span>
                {(Math.round(item.vote_average * 10) / 10).toFixed(1)}
              </span>
            )}
          </figcaption>
        </figure>
      </Link>
    </div>
  );
}
