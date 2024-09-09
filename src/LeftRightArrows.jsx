import { useEffect, useState } from 'react';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';

export default function LeftRightArrows({ arrowRef, columnwidth }) {
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    if (arrowRef.current) {
      setIsScrollable(
        arrowRef.current.scrollWidth > arrowRef.current.clientWidth
      );
    }
  }, [arrowRef, columnwidth]);

  const scrollLeft = () => {
    if (arrowRef.current) {
      arrowRef.current.scrollBy({
        left: -300,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (arrowRef.current) {
      arrowRef.current.scrollBy({
        left: 300,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {isScrollable && (
        <>
          <div className="section-button-container" onClick={scrollLeft}>
            <ArrowLeft2 size="32" />
          </div>
          <div className="section-button-container after" onClick={scrollRight}>
            <ArrowRight2 size="32" />
          </div>
        </>
      )}
    </>
  );
}
