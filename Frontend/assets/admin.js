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
    ...values,
    price: Number(values.price),
    duration_minutes: Number(values.duration_minutes)
  }

  try {
    const result = await api.createService(body, token)
    setAdminNotice(result.message || 'Szolgáltatás létrehozva.')
    createServiceForm.reset()
  } catch (error) {
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
