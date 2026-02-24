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

let selectedDate = null
let selectedTime = null

const bookingStorageKey = 'ifk_bookings'
const reviewStorageKey = 'ifk_reviews'

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

function initBookingPage() {
	const elements = getBookingElements()

	if (!elements.providerSelect || !elements.serviceSelect || !elements.calendar || !elements.timeSlots || !elements.bookBtn) {
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

document.addEventListener('DOMContentLoaded', initBookingPage)
