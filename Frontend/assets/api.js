const userTokenKey = 'ifk_user_token'
const adminTokenKey = 'ifk_admin_token'

export const authStore = {
  getUserToken() {
    return localStorage.getItem(userTokenKey) || ''
  },
  setUserToken(token) {
    localStorage.setItem(userTokenKey, token)
  },
  clearUserToken() {
    localStorage.removeItem(userTokenKey)
  },
  getAdminToken() {
    return localStorage.getItem(adminTokenKey) || ''
  },
  setAdminToken(token) {
    localStorage.setItem(adminTokenKey, token)
  },
  clearAdminToken() {
    localStorage.removeItem(adminTokenKey)
  }
}

function apiBase() {
  return 'http://localhost:3000'
}

async function request(path, options = {}, token = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(payload?.message || 'Ismeretlen hiba tortent.')
  }

  return payload
}

export const api = {
  register(body) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },
  login(body) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },
  logout() {
    return request('/api/auth/logout', {
      method: 'POST'
    })
  },
  getMyProviderProfile(token) {
    return request('/api/provider/me', {}, token)
  },
  updateMyProviderProfile(body, token) {
    return request('/api/provider/update', {
      method: 'POST',
      body: JSON.stringify(body)
    }, token)
  },
  generateAppointments(body, token) {
    return request('/api/appointments/generate', {
      method: 'POST',
      body: JSON.stringify(body)
    }, token)
  },
  adminLogin(body) {
    return request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },
  getPendingUsers(token) {
    return request('/api/admin/pending', {}, token)
  },
  approveUser(id, token) {
    return request(`/api/admin/approve/${id}`, {
      method: 'PATCH'
    }, token)
  },
  createAdmin(body, token) {
    return request('/api/admin/create-admin', {
      method: 'POST',
      body: JSON.stringify(body)
    }, token)
  },
  createService(body, token) {
    return request('/api/admin/create-service', {
      method: 'POST',
      body: JSON.stringify(body)
    }, token)
  }
}
