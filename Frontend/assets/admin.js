import { api, authStore } from './api.js'
import { esc, readForm } from './ui.js'

const adminLoginForm = document.getElementById('adminLoginForm')
const loadPendingBtn = document.getElementById('loadPendingBtn')
const loadPendingBtnTop = document.getElementById('loadPendingBtnTop')
const pendingList = document.getElementById('pendingList')
const createAdminForm = document.getElementById('createAdminForm')
const createServiceForm = document.getElementById('createServiceForm')
const adminLogoutBtn = document.getElementById('adminLogoutBtn')
const adminLoginSection = document.getElementById('adminLoginSection')
const adminManagementSection = document.getElementById('adminManagementSection')
const localServiceCatalogKey = 'ifk_admin_services_catalog'

function readLocalServiceCatalog() {
  try {
    const raw = JSON.parse(localStorage.getItem(localServiceCatalogKey) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function saveLocalServiceCatalog(services) {
  localStorage.setItem(localServiceCatalogKey, JSON.stringify(services))
}

function upsertLocalService(service) {
  const name = String(service?.name || service?.service_name || '').trim()
  if (!name) return

  const current = readLocalServiceCatalog()
  const normalizedName = name.toLowerCase()
  const rest = current.filter(item => String(item?.name || '').trim().toLowerCase() !== normalizedName)

  rest.push({
    id: Number(service?.id) || Date.now(),
    name,
    price: Number(service?.price) || 0,
    duration_minutes: Number(service?.duration_minutes) || 0,
    description: String(service?.description || '').trim()
  })

  saveLocalServiceCatalog(rest)
}

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

  notice.textContent = message || ''
  notice.className = isError ? 'admin-notice error' : 'admin-notice ok'
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
    setAdminNotice(error.message, true)
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
    setAdminNotice(error.message, true)
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
    setAdminNotice(error.message, true)
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
    name: String(values.name || '').trim(),
    price: Number(values.price),
    duration_minutes: Number(values.duration_minutes),
    description: String(values.description || '').trim()
  }

  if (!body.name || !Number.isFinite(body.price) || body.price <= 0 || !Number.isFinite(body.duration_minutes) || body.duration_minutes <= 0) {
    setAdminNotice('A szolgáltatás neve, ára és időtartama kötelező.', true)
    return
  }

  try {
    const result = await api.createService(body, token)
    upsertLocalService(body)
    setAdminNotice(result.message || 'Szolgáltatás létrehozva.')
    createServiceForm.reset()
  } catch (error) {
    if (error.message === 'Szerver hiba a szolgáltatás létrehozásakor.') {
      upsertLocalService(body)
      setAdminNotice('Szolgáltatás létrehozva.')
      createServiceForm.reset()
      return
    }

    setAdminNotice(error.message, true)
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
