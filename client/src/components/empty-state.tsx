export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-primary mx-auto mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Start Your SEO Analysis</h2>
        <p className="text-neutral-600 mb-6">
          Enter a website URL above to analyze its SEO performance, meta tags, and optimization opportunities.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-100 p-3 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <div className="text-sm mt-1 text-center">Performance Metrics</div>
          </div>
          <div className="bg-neutral-100 p-3 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7V4h16v3M9 20h6M12 4v16"></path>
            </svg>
            <div className="text-sm mt-1 text-center">Meta Tag Analysis</div>
          </div>
          <div className="bg-neutral-100 p-3 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <div className="text-sm mt-1 text-center">Link Evaluation</div>
          </div>
          <div className="bg-neutral-100 p-3 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12" y2="18"></line>
            </svg>
            <div className="text-sm mt-1 text-center">Mobile Friendliness</div>
          </div>
        </div>
        <p className="text-sm text-neutral-500">Try with popular sites like wikipedia.org or example.com</p>
      </div>
    </div>
  );
}
