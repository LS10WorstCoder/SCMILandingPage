// Flip Card Handler (guard DOM lookups to avoid uncaught exceptions)
const flipCard = document.getElementById('flip-card');
const flipButton = document.querySelector('.flip-button');
const flipButtonBack = document.querySelector('.flip-button-back');
if (flipCard && flipButton) {
  flipButton.addEventListener('click', () => {
    flipCard.classList.add('flipped');
  });
} else {
  console.warn('Flip card or flip button not found in DOM');
}

if (flipCard && flipButtonBack) {
  flipButtonBack.addEventListener('click', () => {
    flipCard.classList.remove('flipped');
  });
} else {
  console.warn('Flip card or flip button (back) not found in DOM');
}

// RSVP Form handler (guard DOM lookups)
const rsvpForm = document.getElementById('rsvp-form');
const rsvpMsg = rsvpForm ? rsvpForm.querySelector('#form-msg') : null;

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

if (rsvpForm && rsvpMsg) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(rsvpForm);
    const data = {
      firstName: formData.get('firstName')?.trim(),
      lastName: formData.get('lastName')?.trim(),
      email: formData.get('email')?.trim(),
      levelOfStudy: formData.get('levelOfStudy'),
      linkedin: formData.get('linkedin')?.trim(),
      createdAt: new Date().toISOString()
    };

    // Validate required fields
    if (!data.firstName || !data.lastName) {
      rsvpMsg.textContent = 'First and last name are required.';
      rsvpMsg.classList.add('error');
      return;
    }

    if (!validateEmail(data.email)) {
      rsvpMsg.textContent = 'Please enter a valid email address.';
      rsvpMsg.classList.add('error');
      return;
    }

    // Keep a local copy for convenience
    try {
      const rsvps = JSON.parse(localStorage.getItem('scmi_rsvps') || '[]');
      rsvps.push(data);
      localStorage.setItem('scmi_rsvps', JSON.stringify(rsvps));
    } catch (err) {
      // ignore storage errors
      console.warn('Could not save RSVP locally', err);
    }

  // Send to server endpoint which will store in SQL database
  try {
    const resp = await fetch('/api/submit-rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        rsvpMsg.textContent = body?.error || 'There was an error sending your RSVP. Please try again later.';
        rsvpMsg.classList.add('error');
        return;
      }

      rsvpMsg.textContent = 'Thank you for your RSVP! We\'ll be in touch soon.';
      rsvpMsg.classList.remove('error');
      rsvpForm.reset();

      // Auto-flip back after 2 seconds
      if (flipCard) {
        setTimeout(() => {
          flipCard.classList.remove('flipped');
        }, 2000);
      }
    } catch (err) {
      console.error('Submit error', err);
      rsvpMsg.textContent = 'Could not send RSVP — please check your network connection and try again.';
      rsvpMsg.classList.add('error');
    }
  });
} else {
  console.warn('RSVP form or message element missing from DOM; submit handling disabled');
}

// Small enhancements
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
} else {
  // element is optional; do not throw if missing
  // console.debug('Year element not found — skipping year injection');
}

// Keyboard focus-visible for better accessibility
(function () {
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();
