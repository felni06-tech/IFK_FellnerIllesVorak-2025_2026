import { api, authStore } from './api.js'
import { readForm, setNotice, toDateTime } from './ui.js'

const registerForm = document.getElementById('registerForm')
const loginForm = document.getElementById('loginForm')
const logoutBtn = document.getElementById('logoutBtn')
const loadProfileBtn = document.getElementById('loadProfileBtn')
const profileBox = document.getElementById('profileBox')
const updateProfileForm = document.getElementById('updateProfileForm')
const generateAppointmentsForm = document.getElementById('generateAppointmentsForm')
const isProvider = document.getElementById('isProvider')
const serviceId = document.getElementById('serviceId')

isProvider.addEventListener('change', () => {
  serviceId.required = isProvider.checked
})

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const body = readForm(registerForm)
  body.isProvider = !!body.isProvider
  if (!body.profile_picture) delete body.profile_picture
  if (!body.service_id) delete body.service_id

  try {
    const result = await api.register(body)
    setNotice(result.message || 'Sikeres regisztracio.')
    registerForm.reset()
    serviceId.required = false
  } catch (error) {
    setNotice(error.message, true)
  }
})

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  try {
    const result = await api.login(readForm(loginForm))
    authStore.setUserToken(result.token)
    setNotice(`Sikeres belepes: ${result.user?.name || ''}`)
  } catch (error) {
    setNotice(error.message, true)
  }
})

logoutBtn.addEventListener('click', async () => {
  try {
    await api.logout()
    authStore.clearUserToken()
    setNotice('Kijelentkeztel.')
  } catch (error) {
    setNotice(error.message, true)
  }
})

loadProfileBtn.addEventListener('click', async () => {
  const token = authStore.getUserToken()
  if (!token) {
    setNotice('Elobb felhasznalokent jelentkezz be.', true)
    return
  }

  try {
    const profile = await api.getMyProviderProfile(token)
    profileBox.textContent = JSON.stringify(profile, null, 2)
    setNotice('Profil betoltve.')
  } catch (error) {
    setNotice(error.message, true)
  }
})

updateProfileForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const token = authStore.getUserToken()
  if (!token) {
    setNotice('Elobb felhasznalokent jelentkezz be.', true)
    return
  }

  try {
    const result = await api.updateMyProviderProfile(readForm(updateProfileForm), token)
    setNotice(result.message || 'Profil frissitve.')
  } catch (error) {
    setNotice(error.message, true)
  }
})

generateAppointmentsForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const token = authStore.getUserToken()
  if (!token) {
    setNotice('Elobb felhasznalokent jelentkezz be.', true)
    return
  }

  const values = readForm(generateAppointmentsForm)

  try {
    const result = await api.generateAppointments(
      {
        service_id: Number(values.service_id),
        start_time: toDateTime(values.start_time),
        end_time: toDateTime(values.end_time)
      },
      token
    )
    setNotice(result.message || 'Idopontok generalva.')
  } catch (error) {
    setNotice(error.message, true)
  }
})
