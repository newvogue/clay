type StatusBadgeProps = {
  label: string
}

export function StatusBadge({ label }: StatusBadgeProps) {
  return <span data-status={label}>{label}</span>
}
