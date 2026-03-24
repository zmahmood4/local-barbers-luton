// Stores EmailJS credentials in localStorage so they persist
// Nawazish enters these once via the dashboard — no code editing needed

const STORAGE_KEY = 'lb_email_config'

export const loadEmailConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const saveEmailConfig = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export const getEffectiveConfig = () => {
  // localStorage config takes priority over hardcoded values
  const stored = loadEmailConfig()
  if (stored && stored.publicKey && !stored.publicKey.startsWith('YOUR_')) {
    return stored
  }
  return null
}
