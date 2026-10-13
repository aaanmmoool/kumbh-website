/** Gold outline of the jharokha arch, drawn over the masked art. */
export function ArchOutline({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M.6 120V44C.6 30.4 8.4 22.6 18.2 18.6c8-3 14-6 20.2-12.2C43.4 1.4 47 .6 50 .6s6.6.8 11.6 5.8c6.2 6.2 12.2 9.2 20.2 12.2 9.8 4 17.6 11.8 17.6 25.4v76"
        fill="none"
        stroke="#b8954f"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
