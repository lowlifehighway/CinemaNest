import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { imgPath } from './Port';

export default function PersonDetailPage() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  useEffect(() => {
    // Fetch movie details using the id
    async function fetchPerson() {
      const personUrl = `http://localhost:2468/person/${id}`;
      const response = await fetch(personUrl);
      const data = await response.json();
      setPerson(data);
    }

    fetchPerson();
  }, [id]);

  if (!person) return <p>Loading...</p>;
  const birthday = new Date(person.birthday).getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  const calcAge = currentYear - birthday;
  const Age = new Intl.NumberFormat(navigator.language).format(calcAge);

  return (
    <div>
      <HelmetProvider>
        <Helmet>
          <title>{`${person?.name} | CinemaNest`}</title>
          <meta name="description" content="filler" />
        </Helmet>
      </HelmetProvider>
      <h1>{person.name}</h1>
      <img src={imgPath + person.profile_path} alt={`${person.name} poster`} />
      <p>Age : {Age}</p>
      <p>{person.biography}</p>
      {/* Add more details as needed */}
    </div>
  );
}
