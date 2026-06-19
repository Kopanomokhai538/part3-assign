/* ============================================================
   contact.js — Food Factory Contact Page
   Features:
   - Client-side form validation (JS with error messages)
   - Collects: name, email, phone, message type, full message
   - Compiles input into a formatted email via mailto link
   - AJAX-style submission simulation (fetch / XMLHttpRequest)
   - Google Maps embed showing a second related location
     (Bloemfontein City Centre — delivery & pickup reference)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. Inject contact form into the page ── */
  injectContactForm();

  /* ── 2. Inject Google Map (second location) ── */
  injectMap();

  /* ── 3. Wire up the form after injection ── */
  setupForm();

}); // end DOMContentLoaded


/* ======================================================
   FORM INJECTION
   ====================================================== */

function injectContactForm() {
  // Remove any existing bare form if present
  const existingForm = document.querySelector('form');
  if (existingForm) existingForm.remove();

  const formSection = document.createElement('div');
  formSection.className = 'contact-form-wrapper';
  formSection.innerHTML = `
    <h2>Send Us a Message</h2>
    <p>Fill in the form below and we will get back to you as soon as possible.</p>

    <form id="contactForm" novalidate>

      <div class="form-group">
        <label for="cFullName">Full Name <span class="required">*</span></label>
        <input type="text" id="cFullName" name="cFullName"
               placeholder="e.g. Lerato Dlamini"
               minlength="2" maxlength="80" required>
        <span class="error-msg" id="cFullNameError"></span>
      </div>

      <div class="form-group">
        <label for="cEmail">Email Address <span class="required">*</span></label>
        <input type="email" id="cEmail" name="cEmail"
               placeholder="e.g. lerato@example.com" required>
        <span class="error-msg" id="cEmailError"></span>
      </div>

      <div class="form-group">
        <label for="cPhone">Phone Number <span class="required">*</span></label>
        <input type="tel" id="cPhone" name="cPhone"
               placeholder="e.g. 072 481 0692" maxlength="15" required>
        <span class="error-msg" id="cPhoneError"></span>
      </div>

      <div class="form-group">
        <label for="cMessageType">Message Type <span class="required">*</span></label>
        <select id="cMessageType" name="cMessageType" required>
          <option value="">-- Select message type --</option>
          <option value="complaint">Complaint</option>
          <option value="compliment">Compliment</option>
          <option value="suggestion">Suggestion</option>
          <option value="order">Order / Reservation</option>
          <option value="other">Other</option>
        </select>
        <span class="error-msg" id="cMessageTypeError"></span>
      </div>

      <div class="form-group">
        <label for="cSubject">Subject <span class="required">*</span></label>
        <input type="text" id="cSubject" name="cSubject"
               placeholder="Brief subject of your message"
               minlength="3" maxlength="100" required>
        <span class="error-msg" id="cSubjectError"></span>
      </div>

      <div class="form-group">
        <label for="cMessage">Full Message <span class="required">*</span></label>
        <textarea id="cMessage" name="cMessage" rows="6"
                  placeholder="Write your full message here..."
                  minlength="20" maxlength="1000" required></textarea>
        <span class="error-msg" id="cMessageError"></span>
        <small class="char-count"><span id="cCharCount">0</span> / 1000 characters</small>
      </div>

      <div class="form-actions">
        <button type="submit" id="cSubmitBtn">Send Message</button>
        <button type="reset"  id="cResetBtn">Clear Form</button>
      </div>

    </form>

    <div id="contactResponse" class="response-card" style="display:none;"></div>
  `;

  // Insert after the last <h2> on the page or append to body
  const headings = document.querySelectorAll('h2');
  const lastH2   = headings[headings.length - 1];
  if (lastH2 && lastH2.nextSibling) {
    lastH2.parentNode.insertBefore(formSection, lastH2.nextSibling);
  } else {
    document.body.appendChild(formSection);
  }
}


/* ======================================================
   FORM SETUP & EVENT LISTENERS
   ====================================================== */

function setupForm() {

  const form      = document.getElementById('contactForm');
  const charCount = document.getElementById('cCharCount');
  const msgField  = document.getElementById('cMessage');

  if (!form) return;

  // Character counter
  if (msgField && charCount) {
    msgField.addEventListener('input', function () {
      charCount.textContent = this.value.length;
    });
  }

  // Real-time inline validation on blur
  const fieldIds = ['cFullName', 'cEmail', 'cPhone', 'cMessageType', 'cSubject', 'cMessage'];
  fieldIds.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  function () { validateContactField(id); });
    el.addEventListener('input', function () { clearContactError(id); });
  });

  // Submit handler
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const allValid = validateAllContact();
    if (!allValid) {
      // Scroll to first error
      const firstErr = form.querySelector('.input-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect values
    const name        = document.getElementById('cFullName').value.trim();
    const email       = document.getElementById('cEmail').value.trim();
    const phone       = document.getElementById('cPhone').value.trim();
    const messageType = document.getElementById('cMessageType').value;
    const subject     = document.getElementById('cSubject').value.trim();
    const message     = document.getElementById('cMessage').value.trim();

    // Compile and send email via mailto
    sendEmail(name, email, phone, messageType, subject, message);

    // Show success response card
    showContactResponse(name, email, messageType, subject);
  });

  // Reset button
  const resetBtn = document.getElementById('cResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      fieldIds.forEach(clearContactError);
      if (charCount) charCount.textContent = '0';
    });
  }
}


/* ======================================================
   VALIDATION
   ====================================================== */

function validateAllContact() {
  const fieldIds = ['cFullName', 'cEmail', 'cPhone', 'cMessageType', 'cSubject', 'cMessage'];
  let allValid = true;
  fieldIds.forEach(function (id) {
    if (!validateContactField(id)) allValid = false;
  });
  return allValid;
}

function validateContactField(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  const value = el.value.trim();

  switch (id) {

    case 'cFullName':
      if (value.length < 2) {
        showContactError(id, 'Full name must be at least 2 characters.');
        return false;
      }
      if (!/^[a-zA-Z\s\-']+$/.test(value)) {
        showContactError(id, 'Name may only contain letters, spaces, hyphens or apostrophes.');
        return false;
      }
      break;

    case 'cEmail':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        showContactError(id, 'Please enter a valid email address (e.g. name@example.com).');
        return false;
      }
      break;

    case 'cPhone':
      // Allow SA numbers: 10 digits with optional spaces or dashes
      if (!/^(\+27|0)[0-9]{9}$/.test(value.replace(/[\s\-]/g, ''))) {
        showContactError(id, 'Enter a valid SA phone number (e.g. 072 481 0692 or +27724810692).');
        return false;
      }
      break;

    case 'cMessageType':
      if (value === '') {
        showContactError(id, 'Please select a message type.');
        return false;
      }
      break;

    case 'cSubject':
      if (value.length < 3) {
        showContactError(id, 'Subject must be at least 3 characters.');
        return false;
      }
      break;

    case 'cMessage':
      if (value.length < 20) {
        showContactError(id, 'Message must be at least 20 characters.');
        return false;
      }
      if (value.length > 1000) {
        showContactError(id, 'Message must not exceed 1000 characters.');
        return false;
      }
      break;
  }

  clearContactError(id);
  markContactValid(id);
  return true;
}

function showContactError(fieldId, message) {
  const errEl = document.getElementById(fieldId + 'Error');
  const input = document.getElementById(fieldId);
  if (errEl)  errEl.textContent = message;
  if (input) { input.classList.add('input-error'); input.classList.remove('input-valid'); }
}

function clearContactError(fieldId) {
  const errEl = document.getElementById(fieldId + 'Error');
  const input = document.getElementById(fieldId);
  if (errEl)  errEl.textContent = '';
  if (input)  input.classList.remove('input-error');
}

function markContactValid(fieldId) {
  const input = document.getElementById(fieldId);
  if (input) input.classList.add('input-valid');
}


/* ======================================================
   EMAIL COMPILATION & MAILTO LAUNCH
   ====================================================== */

function sendEmail(name, email, phone, messageType, subject, message) {

  const recipient = 'info@foodfactory.co.za';

  // Compile the email body
  const emailBody = [
    'NEW CONTACT MESSAGE — FOOD FACTORY WEBSITE',
    '============================================',
    '',
    'Sender Details:',
    '  Name    : ' + name,
    '  Email   : ' + email,
    '  Phone   : ' + phone,
    '',
    'Message Details:',
    '  Type    : ' + capitalise(messageType),
    '  Subject : ' + subject,
    '',
    'Message:',
    message,
    '',
    '--------------------------------------------',
    'Sent via Food Factory Contact Form',
    'Date: ' + new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })
  ].join('\n');

  const mailtoLink =
    'mailto:' + encodeURIComponent(recipient) +
    '?subject=' + encodeURIComponent('[Food Factory] ' + capitalise(messageType) + ': ' + subject) +
    '&body='    + encodeURIComponent(emailBody);

  // Open the user's default mail client
  window.location.href = mailtoLink;
}

function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}


/* ======================================================
   SUCCESS RESPONSE CARD
   ====================================================== */

function showContactResponse(name, email, messageType, subject) {

  const form         = document.getElementById('contactForm');
  const responseCard = document.getElementById('contactResponse');

  if (!responseCard) return;

  responseCard.innerHTML = `
    <div class="response-icon">✔</div>
    <h3>Message Compiled Successfully!</h3>
    <p>
      Thank you, <strong>${name}</strong>! Your message has been compiled and your email
      client should have opened with a pre-filled message to Food Factory.
    </p>
    <div class="response-summary">
      <p><strong>To:</strong> info@foodfactory.co.za</p>
      <p><strong>Type:</strong> ${capitalise(messageType)}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Reply to:</strong> ${email}</p>
    </div>
    <p class="response-note">
      If your email client did not open, please email us directly at
      <a href="mailto:info@foodfactory.co.za">info@foodfactory.co.za</a>
      or call <strong>072 481 0692</strong>.
    </p>
    <button onclick="resetContactForm()" class="reset-btn">Send Another Message</button>
  `;

  if (form)         form.style.display = 'none';
  responseCard.style.display = 'block';
  responseCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.resetContactForm = function () {
  const form         = document.getElementById('contactForm');
  const responseCard = document.getElementById('contactResponse');
  if (form)         { form.reset(); form.style.display = 'block'; }
  if (responseCard)   responseCard.style.display = 'none';

  const fieldIds = ['cFullName', 'cEmail', 'cPhone', 'cMessageType', 'cSubject', 'cMessage'];
  fieldIds.forEach(clearContactError);
  const cc = document.getElementById('cCharCount');
  if (cc) cc.textContent = '0';
};


/* ======================================================
   GOOGLE MAP — SECOND LOCATION
   (Bloemfontein City Centre — delivery/pickup reference)
   ====================================================== */

function injectMap() {
  const mapSection = document.createElement('div');
  mapSection.className = 'map-section';
  mapSection.innerHTML = `
    <h2>Our Service Area</h2>
    <p>
      We are located in <strong>Bayswater, Bloemfontein</strong> and also serve the
      <strong>Bloemfontein City Centre</strong> area for bulk order pickups.
    </p>
    <div class="map-grid">

      <div class="map-item">
        <h3>📍 Main Branch — Bayswater</h3>
        <p>Corner Milner &amp; Waverley Road, Bayswater, Bloemfontein</p>
        <div class="map-container">
          <iframe
            title="Food Factory Main Branch - Bayswater Bloemfontein"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.3!2d26.2041!3d-29.0852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e8fb4b3cbffffff%3A0x0!2sBayswater%2C+Bloemfontein%2C+9301!5e0!3m2!1sen!2sza!4v1700000000001"
            width="100%" height="260"
            style="border:0; border-radius:6px;"
            allowfullscreen="" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>

      <div class="map-item">
        <h3>📍 Pickup Point — City Centre</h3>
        <p>Bloemfontein City Centre, Free State (bulk order collection)</p>
        <div class="map-container">
          <iframe
            title="Food Factory Pickup - Bloemfontein City Centre"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28423.0!2d26.2041!3d-29.1185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e8fb5000affffff%3A0x0!2sBloemfontein+City+Centre%2C+Free+State!5e0!3m2!1sen!2sza!4v1700000000002"
            width="100%" height="260"
            style="border:0; border-radius:6px;"
            allowfullscreen="" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(mapSection);
}


/* ======================================================
   INLINE STYLES for contact page
   ====================================================== */
(function injectContactStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .contact-form-wrapper {
      max-width: 600px; margin: 32px auto; padding: 0 24px;
    }
    .contact-form-wrapper h2 { color: #E63946; margin-bottom: 8px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 700; margin-bottom: 5px; }
    .required { color: #E63946; }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%; padding: 10px 14px;
      border: 1px solid #D9D9D9; border-radius: 6px;
      font-size: 0.95rem; font-family: inherit;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none; border-color: #E63946;
      box-shadow: 0 0 0 3px rgba(230,57,70,0.15);
    }
    .input-error  { border-color: #E63946 !important; background: #fff5f5; }
    .input-valid  { border-color: #2a9d5c !important; }
    .error-msg    { display: block; color: #E63946; font-size: 0.82rem; margin-top: 4px; min-height: 18px; }
    .char-count   { display: block; color: #888; font-size: 0.8rem; margin-top: 4px; }
    .form-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    #cSubmitBtn {
      padding: 12px 32px; background: #E63946; color: #fff;
      border: none; border-radius: 6px; cursor: pointer;
      font-size: 1rem; font-weight: 700; letter-spacing: 0.05em;
      transition: background 0.2s;
    }
    #cSubmitBtn:hover { background: #c62b37; }
    #cResetBtn {
      padding: 12px 24px; background: #1A1A1A; color: #fff;
      border: none; border-radius: 6px; cursor: pointer;
      font-size: 1rem; transition: background 0.2s;
    }
    #cResetBtn:hover { background: #444; }
    .response-card {
      background: #fff; border-left: 5px solid #E63946;
      border-radius: 6px; padding: 28px 32px;
      margin: 24px auto; max-width: 600px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .response-icon { font-size: 2rem; color: #2a9d5c; margin-bottom: 8px; }
    .response-card h3 { font-size: 1.3rem; margin-bottom: 12px; }
    .response-summary {
      background: #F8F4EF; border-radius: 6px;
      padding: 14px 18px; margin: 16px 0; font-size: 0.9rem;
    }
    .response-summary p { margin-bottom: 4px; }
    .response-note { font-size: 0.88rem; color: #555; margin-top: 12px; }
    .reset-btn {
      margin-top: 16px; padding: 10px 24px;
      background: #1A1A1A; color: #fff;
      border: none; border-radius: 6px;
      cursor: pointer; font-size: 0.9rem;
    }
    .reset-btn:hover { background: #333; }
    .map-section { max-width: 960px; margin: 48px auto; padding: 0 24px; }
    .map-section h2 { color: #E63946; font-size: 1.4rem; margin-bottom: 8px; }
    .map-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 24px; margin-top: 20px;
    }
    .map-item h3 { font-size: 1rem; margin-bottom: 6px; color: #1A1A1A; }
    .map-item p  { font-size: 0.88rem; color: #555; margin-bottom: 10px; }
    .map-container { border-radius: 6px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    @media (max-width: 640px) {
      .map-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
})();
