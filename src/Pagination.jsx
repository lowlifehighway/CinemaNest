import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';

export default function Pagination({
  total_pages,
  page,
  setPage,
  setSearchParams,
}) {
  function prevPage() {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      setSearchParams({ page: prevPage });
    }
  }
  function nextPage() {
    if (page < total_pages) {
      const nextPage = page + 1;
      setPage(nextPage);
      setSearchParams({ page: nextPage });
    }
  }
  function pageButton(pageNumber) {
    setPage(pageNumber);
    setSearchParams({ page: pageNumber });
  }
  if (total_pages < 2) return null;
  return (
    <div className="pagination">
      <button onClick={prevPage} disabled={page === 1}>
        <ArrowLeft2 />
      </button>

      <button
        onClick={() => pageButton(1)}
        className={page === 1 ? 'active' : ''}
      >
        1
      </button>

      {page > 3 && <button>...</button>}

      {page > 2 && (
        <button
          onClick={() => pageButton(page - 1)}
          className={page === page - 1 ? 'active' : ''}
        >
          {page - 1}
        </button>
      )}

      {page !== 1 && page !== total_pages && (
        <button onClick={() => pageButton(page)} className="active">
          {page}
        </button>
      )}

      {page < total_pages - 1 && (
        <button
          onClick={() => pageButton(page + 1)}
          className={page === page + 1 ? 'active' : ''}
        >
          {page + 1}
        </button>
      )}

      {page < total_pages - 2 && <button>...</button>}

      <button
        onClick={() => pageButton(total_pages)}
        className={page === total_pages ? 'active' : ''}
      >
        {total_pages}
      </button>

      <button onClick={nextPage} disabled={page === total_pages}>
        <ArrowRight2 />
      </button>
    </div>
  );
}
