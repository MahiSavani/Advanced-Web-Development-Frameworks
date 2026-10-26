import './PageLoader.css'

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader-spinner" aria-hidden="true" />
      <span>Loading page...</span>
    </div>
  )
}

export default PageLoader