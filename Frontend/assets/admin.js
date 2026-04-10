import { api, authStore } from './api.js'
import { esc, readForm } from './ui.js'

const serviceCatalogStorageKey = 'ifk_service_catalog'

const adminLoginForm = document.getElementById('adminLoginForm')
const loadPendingBtn = document.getElementById('loadPendingBtn')
const loadPendingBtnTop = document.getElementById('loadPendingBtnTop')
const pendingList = document.getElementById('pendingList')
const createAdminForm = document.getElementById('createAdminForm')
const createServiceForm = document.getElementById('createServiceForm')
const adminLogoutBtn = document.getElementById('adminLogoutBtn')
const adminLoginSection = document.getElementById('adminLoginSection')
const adminManagementSection = document.getElementById('adminManagementSection')

function setAdminView(isLoggedIn) {
  adminLoginSection?.classList.toggle('hidden', isLoggedIn)
  adminManagementSection?.classList.toggle('hidden', !isLoggedIn)
  if (adminLoginSection) {
    adminLoginSection.style.display = isLoggedIn ? 'none' : ''
  }
  if (adminManagementSection) {
    adminManagementSection.style.display = isLoggedIn ? '' : 'none'
  }
}

function setAdminNotice(message, isError = false) {
  const notice = document.querySelector('[data-notice]')
  if (!notice) return

  const text = String(message || '')
  const normalizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const isSuppressed =
    normalizedText.includes('nem sikerult lekerni a listat') ||
    normalizedText.includes('nem sikerult a lista betoltese')

  notice.textContent = isSuppressed ? '' : text
  notice.className = isError ? 'admin-notice error' : 'admin-notice ok'
}

function isAuthTokenError(error) {
  const text = String(error?.message || '').toLowerCase()
  return text.includes('ervenytelen') || text.includes('lejart token') || text.includes('hozzaferes megtagadva')
}

function handleAdminError(error, fallbackMessage) {
  if (isAuthTokenError(error)) {
    authStore.clearAdminToken()
    setAdminView(false)
    setAdminNotice('Az admin munkamenet lejart. Jelentkezz be ujra.', true)
    return
  }

  setAdminNotice(error?.message || fallbackMessage, true)
}

function pendingTable(rows) {
  if (!rows.length) {
    return '<p>Nincs jóváhagyásra váró regisztráció.</p>'
  }

  return `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Név</th>
          <th>Email</th>
          <th>Regisztráció</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
            <tr>
              <td>${esc(row.id)}</td>
              <td>${esc(row.name)}</td>
              <td>${esc(row.email)}</td>
              <td>${esc(row.reg_date)}</td>
              <td><button data-approve-id="${esc(row.id)}">Jóváhagy</button></td>
            </tr>
          `
          )
          .join('')}
      </tbody>
    </table>
  `
}

async function loadPending() {
  const token = authStore.getAdminToken()
  if (!token) {
    setAdminNotice('Előbb admin belépés szükséges.', true)
    return
  }

  try {
    const rows = await api.getPendingUsers(token)
    pendingList.innerHTML = pendingTable(rows)
    setAdminNotice('A lista sikeresen frissítve.')
  } catch (error) {
    handleAdminError(error, 'Nem sikerult a lista betoltese.')
  }
}

adminLoginForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  try {
    const result = await api.adminLogin(readForm(adminLoginForm))
    authStore.setAdminToken(result.token)
    setAdminView(true)
    setAdminNotice('Sikeres admin belépés.')
    await loadPending()
  } catch (error) {
    setAdminNotice(error.message, true)
  }
})

loadPendingBtn.addEventListener('click', loadPending)
loadPendingBtnTop?.addEventListener('click', loadPending)

pendingList.addEventListener('click', async (event) => {
  const target = event.target
  const userId = target?.getAttribute('data-approve-id')
  if (!userId) return

  const token = authStore.getAdminToken()
  if (!token) {
    setAdminNotice('Előbb admin belépés szükséges.', true)
    return
  }

  try {
    const result = await api.approveUser(userId, token)
    setAdminNotice(result.message || 'Felhasználó jóváhagyva.')
    await loadPending()
  } catch (error) {
    handleAdminError(error, 'A jovahagyas sikertelen.')
  }
})

createAdminForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const token = authStore.getAdminToken()
  if (!token) {
    setAdminNotice('Előbb admin belépés szükséges.', true)
    return
  }

  try {
    const result = await api.createAdmin(readForm(createAdminForm), token)
    setAdminNotice(result.message || 'Admin létrehozva.')
    createAdminForm.reset()
  } catch (error) {
    handleAdminError(error, 'Az admin letrehozasa sikertelen.')
  }
})

createServiceForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const token = authStore.getAdminToken()
  if (!token) {
    setAdminNotice('Előbb admin belépés szükséges.', true)
    return
  }

  const values = readForm(createServiceForm)
  const body = {
    name: values.name || values.service_name || '',
    description: values.description || ''
  }

  try {
    const result = await api.createService(body, token)
    try {
      const current = JSON.parse(localStorage.getItem(serviceCatalogStorageKey) || '[]')
      const next = Array.isArray(current) ? current : []
      next.push({
        id: result?.serviceId || Date.now(),
        name: body.name
      })
      localStorage.setItem(serviceCatalogStorageKey, JSON.stringify(next))
    } catch {
      // A lokalis cache hiba nem blokkolja a backend sikeres letrehozast.
    }
    setAdminNotice(result.message || 'Szolgáltatás létrehozva.')
    createServiceForm.reset()
  } catch (error) {
    handleAdminError(error, 'A szolgaltatas letrehozasa sikertelen.')
  }
})

adminLogoutBtn?.addEventListener('click', () => {
  authStore.clearAdminToken()
  setAdminView(false)
  setAdminNotice('Kijelentkeztél az admin felületről.')
})

const hasAdminToken = Boolean(authStore.getAdminToken())
setAdminView(hasAdminToken)
if (hasAdminToken) {
  loadPending()
}
