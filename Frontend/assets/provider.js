import { api, authStore } from './api.js'

const profileForm = document.getElementById('updateProfileForm')
const generateForm = document.getElementById('generateAppointmentsForm')
const loadProfileBtn = document.getElementById('loadProfileBtn')
const messageBox = document.getElementById('providerMessage')
const profileDump = document.getElementById('providerProfileDump')
const logoutLink = document.getElementById('logoutLink')
const generatedCount = document.getElementById('generatedCount')
const generatedPrice = document.getElementById('generatedPrice')
const generatedRange = document.getElementById('generatedRange')

function setMessage(message, isError = false) {
  if (!messageBox) return

  const text = String(message || '')
  const isProviderRequiredText = /szolg[aá]ltat[óo]i\s+fi[oó]k\s+sz[uü]ks[eé]ges/i.test(text)

  messageBox.textContent = isProviderRequiredText ? '' : text
  messageBox.style.color = isError ? '#dc3545' : '#155724'
}

function toSqlDateTime(localDateTime) {
  if (!localDateTime) return ''
  return `${localDateTime.replace('T', ' ')}:00`
}

function asPositiveNumber(value) {
  const normalized = String(value ?? '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function normalizedText(value) {
  return String(value || '').trim()
}

function formatDateTime(localDateTime) {
  if (!localDateTime) return '-'
  return String(localDateTime).replace('T', ' ')
}

function setGenerationSummary(result, startTime = '', endTime = '') {
  if (generatedCount) {
    generatedCount.textContent = result?.count != null ? String(result.count) : '-'
  }
  if (generatedPrice) {
    generatedPrice.textContent = result?.price != null ? `${result.price} Ft` : '-'
  }
  if (generatedRange) {
    generatedRange.textContent = startTime && endTime
      ? `${formatDateTime(startTime)} - ${formatDateTime(endTime)}`
      : '-'
  }
}

function fillProfileForm(profile) {
  const addressInput = document.getElementById('provider-address')
  const descriptionInput = document.getElementById('provider-description')
  const priceInput = document.getElementById('provider-price')
  const durationInput = document.getElementById('provider-duration')

  if (addressInput) addressInput.value = profile?.address || ''
  if (descriptionInput) descriptionInput.value = profile?.description || ''
  if (priceInput) priceInput.value = profile?.price ?? ''
  if (durationInput) durationInput.value = profile?.duration_minutes ?? ''

  if (profileDump) {
    profileDump.textContent = JSON.stringify(profile, null, 2)
  }
}

async function loadProfile(token) {
  const profile = await api.getMyProviderProfile(token)
  fillProfileForm(profile)
  return profile
}

async function handleProfileSubmit(event, token) {
  event.preventDefault()
  if (!profileForm) return

  const formData = new FormData(profileForm)
  const address = normalizedText(formData.get('address'))
  const description = normalizedText(formData.get('description'))
  const price = asPositiveNumber(formData.get('price'))
  const durationMinutes = asPositiveNumber(formData.get('duration_minutes'))

  if (!address || !price || !durationMinutes) {
    setMessage('A cim, ar es idotartam kitoltese kotelezo.', true)
    return
  }

  try {
    const result = await api.updateMyProviderProfile(
      {
        address,
        description,
        price,
        duration_minutes: durationMinutes
      },
      token
    )

    const refreshed = await loadProfile(token)

    const sameAddress = normalizedText(refreshed?.address) === address
    const sameDescription = normalizedText(refreshed?.description) === description
    const samePrice = Number(refreshed?.price) === Number(price)
    const sameDuration = Number(refreshed?.duration_minutes) === Number(durationMinutes)

    if (sameAddress && sameDescription && samePrice && sameDuration) {
      setMessage(result?.message || 'Profil frissitve.')
    } else {
      setMessage('A mentes lefutott, de a profiladatok nem frissultek a backendben. Lepj ki es be ujra, majd probald ismet.', true)
    }
  } catch (error) {
    setMessage(error.message, true)
  }
}

async function handleGenerateSubmit(event, token) {
  event.preventDefault()
  if (!generateForm) return

  const formData = new FormData(generateForm)
  const startTime = toSqlDateTime(String(formData.get('start_time') || ''))
  const endTime = toSqlDateTime(String(formData.get('end_time') || ''))

  if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
    setMessage('A kezdes idopontja legyen korabbi, mint a befejezes.', true)
    return
  }

  try {
    const result = await api.generateAppointments(
      {
        start_time: startTime,
        end_time: endTime
      },
      token
    )

    setGenerationSummary(result, startTime, endTime)
    setMessage(result?.message || 'Idopontok generalva.')
  } catch (error) {
    setGenerationSummary(null)
    setMessage(error.message, true)
  }
}

async function handleLogout(event) {
  event.preventDefault()

  try {
    await api.logout()
  } catch {
    // Client oldali kijelentkezes ettol fuggetlenul lefut.
  }

  authStore.clearUserToken()
  window.location.href = 'bejelentkezes.html'
}

function init() {
  const token = authStore.getUserToken()

  if (!token) {
    window.location.href = 'bejelentkezes.html'
    return
  }

  loadProfile(token)
    .then(() => {
      setMessage('Profil betoltve.')
    })
    .catch((error) => {
      if (String(error?.message || '').toLowerCase().includes('szolgaltatoi fiok szukseges')) {
        setMessage('A backend szerint ez a token nem szolgaltatoi. Jelentkezz ki, majd be ujra a szolgaltatoi fiokkal.', true)
        return
      }
      setMessage(error.message || 'Profil betoltese nem sikerult.', true)
    })

  loadProfileBtn?.addEventListener('click', async () => {
    try {
      await loadProfile(token)
      setMessage('Profil betoltve.')
    } catch (error) {
      setMessage(error.message, true)
    }
  })

  profileForm?.addEventListener('submit', (event) => {
    handleProfileSubmit(event, token)
  })

  generateForm?.addEventListener('submit', (event) => {
    handleGenerateSubmit(event, token)
  })

  logoutLink?.addEventListener('click', handleLogout)
}

init()
