const providers = [
	{
		id: 1,
		name: 'Fodrász Anna',
		services: ['Női hajvágás', 'Férfi hajvágás', 'Festés'],
		slots: ['09:00', '10:00', '11:00', '14:00', '15:00']
	},
	{
		id: 2,
		name: 'Kozmetika Lili',
		services: ['Arctisztítás', 'Smink', 'Szemöldök formázás'],
		slots: ['10:30', '11:30', '13:30', '16:00']
	},
	{
		id: 3,
		name: 'Masszázs Péter',
		services: ['Svédmasszázs', 'Sportmasszázs', 'Talpmasszázs'],
		slots: ['08:30', '09:30', '12:00', '17:00']
	}
]

const API_BASE = 'http://localhost:3000'
const USER_TOKEN_KEY = 'ifk_user_token'
const USER_INFO_KEY = 'ifk_user_info'
const LOGIN_ROLE_MAP_KEY = 'ifk_login_role_map'

let selectedDate = null
let selectedTime = null

const bookingStorageKey = 'ifk_bookings'
const reviewStorageKey = 'ifk_reviews'

async function apiRequest(path, options = {}, token = '') {
	const headers = {
		'Content-Type': 'application/json',
		...(options.headers || {})
	}

	if (token) {
		headers.Authorization = `Bearer ${token}`
	}

	const response = await fetch(`${API_BASE}${path}`, {
		...options,
		headers
	})

	const text = await response.text()
	const payload = text ? JSON.parse(text) : null

	if (!response.ok) {
		throw new Error(payload?.message || 'Szerverhiba történt.')
	}

	return payload
}

function saveUserToken(token) {
	localStorage.setItem(USER_TOKEN_KEY, token)
}

function getUserToken() {
	return localStorage.getItem(USER_TOKEN_KEY) || ''
}

function saveUserInfo(user) {
	localStorage.setItem(USER_INFO_KEY, JSON.stringify(user || {}))
}

function getUserInfo() {
	const raw = localStorage.getItem(USER_INFO_KEY)
	if (!raw) return {}
	try {
		return JSON.parse(raw)
	} catch {
		return {}
	}
}

function logoutUser() {
	localStorage.removeItem(USER_TOKEN_KEY)
	localStorage.removeItem(USER_INFO_KEY)
}

function getStoredLoginRole(email) {
	const normalizedEmail = String(email || '').trim().toLowerCase()
	if (!normalizedEmail) return ''
	try {
		const raw = JSON.parse(localStorage.getItem(LOGIN_ROLE_MAP_KEY) || '{}')
		return raw[normalizedEmail] || ''
	} catch {
		return ''
	}
}

function saveStoredLoginRole(email, role) {
	const normalizedEmail = String(email || '').trim().toLowerCase()
	if (!normalizedEmail) return
	try {
		const raw = JSON.parse(localStorage.getItem(LOGIN_ROLE_MAP_KEY) || '{}')
		raw[normalizedEmail] = role
		localStorage.setItem(LOGIN_ROLE_MAP_KEY, JSON.stringify(raw))
	} catch {
		localStorage.setItem(LOGIN_ROLE_MAP_KEY, JSON.stringify({ [normalizedEmail]: role }))
	}
}

function getBookingElements() {
	return {
		providerSelect: document.getElementById('providerSelect'),
		serviceSelect: document.getElementById('serviceSelect'),
		calendar: document.getElementById('calendar'),
		timeSlots: document.getElementById('timeSlots'),
		bookBtn: document.getElementById('bookBtn'),
		bookingMessage: document.getElementById('bookingMessage'),
		bookingsList: document.getElementById('bookingsList'),
		reviewProviderSelect: document.getElementById('reviewProviderSelect'),
		reviewServiceSelect: document.getElementById('reviewServiceSelect'),
		reviewRating: document.getElementById('reviewRating'),
		reviewComment: document.getElementById('reviewComment'),
		reviewBtn: document.getElementById('reviewBtn'),
		reviewMessage: document.getElementById('reviewMessage'),
		reviewsList: document.getElementById('reviewsList')
	}
}

function loadBookings() {
	const raw = localStorage.getItem(bookingStorageKey)
	return raw ? JSON.parse(raw) : []
}

function saveBookings(bookings) {
	localStorage.setItem(bookingStorageKey, JSON.stringify(bookings))
}

function loadReviews() {
	const raw = localStorage.getItem(reviewStorageKey)
	return raw ? JSON.parse(raw) : []
}

function saveReviews(reviews) {
	localStorage.setItem(reviewStorageKey, JSON.stringify(reviews))
}

function formatDate(date) {
	return date.toLocaleDateString('hu-HU', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	})
}

function getDateKey(date) {
	return date.toISOString().split('T')[0]
}

async function getServices() {
	try {
		const services = await apiRequest('/api/services')
		return Array.isArray(services) ? services : []
	} catch {
		return []
	}
}

function renderServiceSelect(select, services, placeholder = 'Válassz...') {
	if (!select) return

	if (!services.length) {
		select.innerHTML = '<option value="">Nincs elérhető szolgáltatás</option>'
		return
	}

	select.innerHTML = [`<option value="">${placeholder}</option>`]
		.concat(services.map(service => `<option value="${service.service_id ?? service.id}">${service.service_name ?? service.name}</option>`))
		.join('')
}

function renderProviderOptions(elements) {
	elements.providerSelect.innerHTML = providers
		.map(provider => `<option value="${provider.id}">${provider.name}</option>`)
		.join('')
}

function getSelectedProvider(elements) {
	const providerId = Number(elements.providerSelect.value)
	return providers.find(provider => provider.id === providerId)
}

function renderServiceOptions(elements) {
	const provider = getSelectedProvider(elements)
	if (!provider) {
		elements.serviceSelect.innerHTML = ''
		return
	}

	elements.serviceSelect.innerHTML = provider.services
		.map(service => `<option value="${service}">${service}</option>`)
		.join('')
}

function renderCalendar(elements) {
	elements.calendar.innerHTML = ''
	const now = new Date()

	for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
		const date = new Date(now)
		date.setDate(now.getDate() + dayOffset)

		const dayButton = document.createElement('button')
		dayButton.type = 'button'
		dayButton.className = 'calendar-day available'
		dayButton.textContent = formatDate(date)
		dayButton.dataset.date = getDateKey(date)

		if (selectedDate === dayButton.dataset.date) {
			dayButton.classList.add('selected')
		}

		dayButton.addEventListener('click', () => {
			selectedDate = dayButton.dataset.date
			selectedTime = null
			renderCalendar(elements)
			renderTimeSlots(elements)
			setBookingMessage(elements, '')
		})

		elements.calendar.appendChild(dayButton)
	}
}

function renderTimeSlots(elements) {
	const provider = getSelectedProvider(elements)
	elements.timeSlots.innerHTML = ''

	if (!provider || !selectedDate) {
		elements.timeSlots.innerHTML = '<p>Először válassz napot.</p>'
		return
	}

	provider.slots.forEach(slot => {
		const slotButton = document.createElement('button')
		slotButton.type = 'button'
		slotButton.className = 'time-slot available'
		slotButton.textContent = slot
		slotButton.dataset.time = slot

		if (selectedTime === slot) {
			slotButton.classList.add('selected')
		}

		slotButton.addEventListener('click', () => {
			selectedTime = slot
			renderTimeSlots(elements)
			setBookingMessage(elements, '')
		})

		elements.timeSlots.appendChild(slotButton)
	})
}

function setBookingMessage(elements, message, isError = false) {
	elements.bookingMessage.textContent = message
	elements.bookingMessage.style.color = isError ? '#dc3545' : '#155724'
}

function renderBookings(elements) {
	const bookings = loadBookings()

	if (bookings.length === 0) {
		elements.bookingsList.innerHTML = '<p>Még nincs foglalásod.</p>'
		return
	}

	elements.bookingsList.innerHTML = bookings
		.map(booking => `
			<article class="service-card">
				<h3>${booking.providerName}</h3>
				<p><strong>Szolgáltatás:</strong> ${booking.service}</p>
				<p><strong>Dátum:</strong> ${booking.date}</p>
				<p><strong>Időpont:</strong> ${booking.time}</p>
			</article>
		`)
		.join('')
}

function renderReviewProviderOptions(elements) {
	elements.reviewProviderSelect.innerHTML = providers
		.map(provider => `<option value="${provider.id}">${provider.name}</option>`)
		.join('')
}

function getSelectedReviewProvider(elements) {
	const providerId = Number(elements.reviewProviderSelect.value)
	return providers.find(provider => provider.id === providerId)
}

function renderReviewServiceOptions(elements) {
	const provider = getSelectedReviewProvider(elements)
	if (!provider) {
		elements.reviewServiceSelect.innerHTML = ''
		return
	}

	elements.reviewServiceSelect.innerHTML = provider.services
		.map(service => `<option value="${service}">${service}</option>`)
		.join('')
}

function setReviewMessage(elements, message) {
	elements.reviewMessage.textContent = message
}

function renderReviews(elements) {
	const reviews = loadReviews()

	if (reviews.length === 0) {
		elements.reviewsList.innerHTML = '<p>Még nincs értékelés.</p>'
		return
	}

	elements.reviewsList.innerHTML = reviews
		.slice()
		.reverse()
		.map(review => `
			<article class="review">
				<div class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
				<p><strong>${review.providerName}</strong> - ${review.service}</p>
				<p>${review.comment}</p>
			</article>
		`)
		.join('')
}

function handleReview(elements) {
	const provider = getSelectedReviewProvider(elements)
	const service = elements.reviewServiceSelect.value
	const rating = Number(elements.reviewRating.value)
	const comment = elements.reviewComment.value.trim()

	if (!provider || !service || !rating || !comment) {
		setReviewMessage(elements, 'Kérlek tölts ki minden mezőt az értékeléshez.')
		return
	}

	const reviews = loadReviews()
	reviews.push({
		providerId: provider.id,
		providerName: provider.name,
		service,
		rating,
		comment,
		createdAt: new Date().toISOString()
	})

	saveReviews(reviews)
	elements.reviewComment.value = ''
	setReviewMessage(elements, 'Köszönjük az értékelést!')
	renderReviews(elements)
}

function handleBooking(elements) {
	const provider = getSelectedProvider(elements)
	const service = elements.serviceSelect.value

	if (!provider || !service || !selectedDate || !selectedTime) {
		setBookingMessage(elements, 'Kérlek válassz szolgáltatót, szolgáltatást, napot és időpontot.', true)
		return
	}

	const bookings = loadBookings()
	const alreadyBooked = bookings.some(
		booking => booking.providerId === provider.id && booking.dateKey === selectedDate && booking.time === selectedTime
	)

	if (alreadyBooked) {
		setBookingMessage(elements, 'Ez az időpont már foglalt. Válassz másikat.', true)
		return
	}

	const booking = {
		providerId: provider.id,
		providerName: provider.name,
		service,
		dateKey: selectedDate,
		date: new Date(selectedDate).toLocaleDateString('hu-HU'),
		time: selectedTime
	}

	bookings.push(booking)
	saveBookings(bookings)
	renderBookings(elements)
	setBookingMessage(elements, 'Sikeres foglalás!')
}

function initLogoutLink() {
	const logoutLink = document.getElementById('logoutLink')
	if (!logoutLink) {
		return
	}

	logoutLink.addEventListener('click', async event => {
		event.preventDefault()
		try {
			await apiRequest('/api/auth/logout', { method: 'POST' })
		} catch {
			// Kliens oldali kijelentkezés akkor is lefut, ha a szerver logout hibára fut.
		}
		logoutUser()
		window.location.href = 'bejelentkezes.html'
	})
}

function initBookingPage() {
	const elements = getBookingElements()

	if (!elements.providerSelect || !elements.serviceSelect || !elements.calendar || !elements.timeSlots || !elements.bookBtn) {
		return
	}

	if (!getUserToken()) {
		window.location.href = 'bejelentkezes.html'
		return
	}

	renderProviderOptions(elements)
	renderServiceOptions(elements)
	renderCalendar(elements)
	renderTimeSlots(elements)
	renderBookings(elements)

	if (elements.reviewProviderSelect && elements.reviewServiceSelect && elements.reviewBtn && elements.reviewsList) {
		renderReviewProviderOptions(elements)
		renderReviewServiceOptions(elements)
		renderReviews(elements)

		elements.reviewProviderSelect.addEventListener('change', () => {
			renderReviewServiceOptions(elements)
			setReviewMessage(elements, '')
		})

		elements.reviewBtn.addEventListener('click', () => {
			handleReview(elements)
		})
	}

	elements.providerSelect.addEventListener('change', () => {
		renderServiceOptions(elements)
		selectedTime = null
		renderTimeSlots(elements)
		setBookingMessage(elements, '')
	})

	elements.bookBtn.addEventListener('click', () => {
		handleBooking(elements)
	})
}

function initLoginPage() {
	const form = document.getElementById('login')
	if (!form) {
		return
	}

	const emailInput = document.getElementById('login-email')
	const roleInputs = Array.from(document.querySelectorAll('input[name="login_role"]'))

	const syncStoredLoginRole = () => {
		const storedRole = getStoredLoginRole(emailInput?.value || '')
		if (!storedRole) return
		const matchingInput = roleInputs.find(input => input.value === storedRole)
		if (matchingInput) {
			matchingInput.checked = true
		}
	}

	emailInput?.addEventListener('input', syncStoredLoginRole)
	syncStoredLoginRole()

	form.addEventListener('submit', async event => {
		event.preventDefault()

		const formData = new FormData(form)
		const email = String(formData.get('email') || '').trim()
		const password = String(formData.get('password') || '')
		const selectedLoginRole = String(formData.get('login_role') || 'user')

		try {
			const result = await apiRequest('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			})

			saveUserToken(result.token)
			saveUserInfo(result.user)
			saveStoredLoginRole(email, selectedLoginRole)
			const providerEmails = JSON.parse(localStorage.getItem('ifk_provider_emails') || '[]')
			if (selectedLoginRole === 'provider' || providerEmails.includes(email)) {
				window.location.href = 'szolgaltato.html'
				return
			}
			window.location.href = 'felhaszfooldal.html'
		} catch (error) {
			alert(error.message)
		}
	})
}

function initRegisterPage() {
	const form = document.getElementById('register')
	if (!form) {
		return
	}

	const roleInputs = Array.from(document.querySelectorAll('input[name="role"]'))
	const serviceIdGroup = document.getElementById('service-id-group')
	const serviceIdInput = document.getElementById('register-service-id')

	const syncRoleFields = () => {
		const selectedRole = roleInputs.find(input => input.checked)?.value || 'user'
		const isProvider = selectedRole === 'provider'
		if (serviceIdGroup) {
			serviceIdGroup.style.display = isProvider ? 'block' : 'none'
		}
		if (serviceIdInput) {
			serviceIdInput.required = isProvider
		}
	}

	getServices().then(services => {
		renderServiceSelect(serviceIdInput, services, 'Válassz szakmát')
	})

	roleInputs.forEach(input => input.addEventListener('change', syncRoleFields))
	syncRoleFields()

	const registerMessage = document.getElementById('register-message')

	const showRegisterMessage = (message, isError = false) => {
		if (!registerMessage) return
		registerMessage.textContent = message
		registerMessage.style.display = 'block'
		registerMessage.style.backgroundColor = isError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)'
		registerMessage.style.color = isError ? '#dc3545' : '#155724'
		registerMessage.style.borderLeft = isError ? '4px solid #dc3545' : '4px solid #28a745'
	}

	form.addEventListener('submit', async event => {
		event.preventDefault()

		const formData = new FormData(form)
		const role = String(formData.get('role') || 'user')
		const body = {
			name: String(formData.get('name') || '').trim(),
			email: String(formData.get('email') || '').trim(),
			password: String(formData.get('password') || ''),
			phone: String(formData.get('phone') || '').trim(),
			isProvider: role === 'provider'
		}

		const serviceIdValue = String(formData.get('service_id') || '').trim()
		if (body.isProvider && serviceIdValue) {
			body.service_id = Number(serviceIdValue)
		}

		try {
			const result = await apiRequest('/api/auth/register', {
				method: 'POST',
				body: JSON.stringify(body)
			})

			if (body.isProvider) {
				const providerEmails = JSON.parse(localStorage.getItem('ifk_provider_emails') || '[]')
				providerEmails.push(body.email)
				localStorage.setItem('ifk_provider_emails', JSON.stringify([...new Set(providerEmails)]))
				saveStoredLoginRole(body.email, 'provider')
			}
			showRegisterMessage(result.message || 'Sikeres regisztráció! Átirányítás...', false)
			setTimeout(() => {
				window.location.href = 'bejelentkezes.html'
			}, 1500)
		} catch (error) {
			console.error('[Register Error]', error)
			showRegisterMessage(error.message || 'Hiba történt a regisztráció során.', true)
		}
	})
}

function toSqlDateTime(localDateTime) {
	if (!localDateTime) return ''
	return `${localDateTime.replace('T', ' ')}:00`
}

function setProviderMessage(message, isError = false) {
	const box = document.getElementById('providerMessage')
	if (!box) return
	box.textContent = message
	box.style.color = isError ? '#dc3545' : '#155724'
}

function initProviderPage() {
	const providerPage = document.getElementById('providerPage')
	if (!providerPage) {
		return
	}

	const token = getUserToken()
	if (!token) {
		window.location.href = 'bejelentkezes.html'
		return
	}

	const user = getUserInfo()
	if (user?.isProvider !== true) {
		setProviderMessage('Ez az oldal csak szolgáltatói fiókkal érhető el.', true)
	}

	const loadProfileBtn = document.getElementById('loadProfileBtn')
	const updateProfileForm = document.getElementById('updateProfileForm')
	const generateForm = document.getElementById('generateAppointmentsForm')
	const serviceSelect = document.getElementById('providerServiceSelect')
	const profileDump = document.getElementById('providerProfileDump')

	getServices().then(services => {
		renderServiceSelect(serviceSelect, services, 'Válassz szolgáltatást')
	})

	loadProfileBtn?.addEventListener('click', async () => {
		try {
			const profile = await apiRequest('/api/provider/me', {}, token)
			const addressInput = document.getElementById('provider-address')
			const descriptionInput = document.getElementById('provider-description')
			if (addressInput) addressInput.value = profile.address || ''
			if (descriptionInput) descriptionInput.value = profile.description || ''
			if (profileDump) profileDump.textContent = JSON.stringify(profile, null, 2)
			setProviderMessage('Profil sikeresen betöltve.')
		} catch (error) {
			setProviderMessage(error.message, true)
		}
	})

	updateProfileForm?.addEventListener('submit', async event => {
		event.preventDefault()
		const formData = new FormData(updateProfileForm)
		const address = String(formData.get('address') || '').trim()
		const description = String(formData.get('description') || '').trim()

		try {
			const result = await apiRequest(
				'/api/provider/update',
				{
					method: 'POST',
					body: JSON.stringify({ address, description })
				},
				token
			)
			setProviderMessage(result.message || 'Profil frissítve.')
		} catch (error) {
			setProviderMessage(error.message, true)
		}
	})

	generateForm?.addEventListener('submit', async event => {
		event.preventDefault()
		const formData = new FormData(generateForm)
		const serviceId = Number(formData.get('service_id'))
		const start = toSqlDateTime(String(formData.get('start_time') || ''))
		const end = toSqlDateTime(String(formData.get('end_time') || ''))

		try {
			const result = await apiRequest(
				'/api/appointments/generate',
				{
					method: 'POST',
					body: JSON.stringify({
						service_id: serviceId,
						start_time: start,
						end_time: end
					})
				},
				token
			)

			setProviderMessage(result.message || 'Időpontok legenerálva.')
		} catch (error) {
			setProviderMessage(error.message, true)
		}
	})
}

document.addEventListener('DOMContentLoaded', () => {
	initBookingPage()
	initLoginPage()
	initRegisterPage()
	initProviderPage()
	initLogoutLink()
})