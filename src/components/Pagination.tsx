export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pageUrl = (p: number) => (p === 1 ? basePath : `${basePath}/page/${p}`);

  return (
    <nav className="pagination">
      {currentPage > 1 ? (
        <a href={pageUrl(currentPage - 1)} className="pagination-link">
          ← Previous
        </a>
      ) : (
        <span className="pagination-link pagination-link--disabled">← Previous</span>
      )}
      <span className="pagination-info">
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages ? (
        <a href={pageUrl(currentPage + 1)} className="pagination-link">
          Next →
        </a>
      ) : (
        <span className="pagination-link pagination-link--disabled">Next →</span>
      )}
    </nav>
  );
}
