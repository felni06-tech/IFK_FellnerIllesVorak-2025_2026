export function readForm(form) {
  return Object.fromEntries(new FormData(form).entries())
}

export function setNotice(message, isError = false) {
  const notice = document.querySelector('[data-notice]')
  if (!notice) return

  notice.textContent = message || ''
  notice.className = isError ? 'notice error' : 'notice ok'
}

export function toDateTime(localDateTime) {
  if (!localDateTime) return ''
  return `${localDateTime.replace('T', ' ')}:00`
}

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
