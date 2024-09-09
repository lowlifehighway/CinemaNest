import { useEffect, useState } from 'react';
import './e404.css';

export default function NotFound() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const counter = setInterval(() => {
      setCount((prev) => {
        if (prev >= 404) {
          clearInterval(counter);
          return prev;
        }
        return prev + 1;
      });
    });

    return () => clearInterval(counter);
  }, []); // Add an empty dependency array to ensure this effect only runs once

  return (
    <div className="e404-container">
      <div>
        <h1 className="e404-number">{count}</h1>
        <p>Page Not Found</p>
        {/* <p>Sorry, the page you are looking for does not exist.</p> */}
        <p>This may mean nothing</p>
        <p>I'm probably working on something that blew up </p>
      </div>
    </div>
  );
}
