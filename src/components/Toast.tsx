import { useToastStore } from '../store/toastStore'

export function Toast() {
  const { message, type, visible, hide } = useToastStore()
  if (!visible) return null
  return (
    <div
      className={`toast toast-${type}`}
      role="status"
      aria-live="polite"
      onClick={hide}
    >
      {message}
    </div>
  )
}
