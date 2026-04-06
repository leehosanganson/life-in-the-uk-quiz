interface HomeButtonProps {
  onClick: () => void
  isNoOp?: boolean
  isHidden?: boolean
}

export function HomeButton({ onClick, isNoOp, isHidden }: HomeButtonProps) {
  if (isHidden) {
    return null
  }

  return (
    <button
      className={`home-btn${isNoOp ? ' home-btn--noop' : ''}`}
      onClick={onClick}
      aria-label="Go to home screen"
      aria-disabled={isNoOp ? 'true' : undefined}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
        <polyline points="9 21 9 12 15 12 15 21" />
      </svg>
    </button>
  )
}
