/* ============================================================
   enquiry.js — Food Factory Enquiry Page
   Features:
   - Client-side form validation (HTML5 + JS)
   - Error message display per field
   - Dynamic response based on enquiry type
     (cost, availability, or general info)
   - Google Maps embed showing Food Factory location
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. Inject improved form HTML ── */
  const formContainer = document.querySelector('form');
  if (formContainer) {
    formContainer.id = 'enquiryForm';
    formContainer.setAttribute('novalidate', true); // use JS validation
    formContainer.innerHTML = `

      <div class="form-group">
        <label for="fullName">Full Name <span class="required">*</span></label>
        <input type="text" id="fullName" name="fullName"
               placeholder="e.g. Thabo Mokoena"
               minlength="2" maxlength="80" required>
        <span class="error-msg" id="fullNameError"></span>
      </div>

      <div class="form-group">
        <label for="email">Email Address <span class="required">*</span></label>
        <input type="email" id="email" name="email"
               placeholder="e.g. thabo@example.com" required>
        <span class="error-msg" id="emailError"></span>
      </div>

      <div class="form-group">
        <label for="phone">Phone Number <span class="required">*</span></label>
        <input type="tel" id="phone" name="phone"
               placeholder="e.g. 072 481 0692"
               maxlength="15">
        <span class="error-msg" id="phoneError"></span>
      </div>

      <div class="form-group">
        <label for="enquiryType">Enquiry Type <span class="required">*</span></label>
        <select id="enquiryType" name="enquiryType" required>
          <option value="">-- Select an option --</option>
          <option value="pricing">Pricing & Costs</option>
          <option value="availability">Availability & Hours</option>
          <option value="catering">Catering / Bulk Orders</option>
          <option value="sponsorship">Sponsorship / Partnership</option>
          <option value="general">General Enquiry</option>
        </select>
        <span class="error-msg" id="enquiryTypeError"></span>
      </div>

      <div class="form-group">
        <label for="message">Your Message <span class="required">*</span></label>
        <textarea id="message" name="message" rows="5"
                  placeholder="Type your enquiry here..."
                  minlength="10" maxlength="500" required></textarea>
        <span class="error-msg" id="messageError"></span>
        <small class="char-count"><span id="charCount">0</span> / 500 characters</small>
      </div>

      <button type="submit" id="submitBtn">Send Enquiry</button>
    `;
  }

  /* ── 2. Inject Google Map ── */
  injectMap();

  /* ── 3. Character counter for textarea ── */
  const messageField = document.getElementById('message');
  const charCount    = document.getElementById('charCount');

  if (messageField && charCount) {
    messageField.addEventListener('input', function () {
      charCount.textContent = this.value.length;
    });
  }

  /* ── 4. Real-time inline validation on blur ── */
  const fields = ['fullName', 'email', 'phone', 'enquiryType', 'message'];
  fields.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', function () {
        validateField(id);
      });
      el.addEventListener('input', function () {
        // Clear error as user fixes input
        clearError(id);
      });
    }
  });

  /* ── 5. Form submission ── */
  const form = document.getElementById('enquiryForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const isValid = validateAll();
      if (!isValid) return;

      // Gather values
      const name         = document.getElementById('fullName').value.trim();
      const email        = document.getElementById('email').value.trim();
      const phone        = document.getElementById('phone').value.trim();
      const enquiryType  = document.getElementById('enquiryType').value;
      const message      = document.getElementById('message').value.trim();

      // Build dynamic response
      showResponse(name, email, phone, enquiryType, message);
    });
  }

  /* ======================================================
     VALIDATION FUNCTIONS
     ====================================================== */

  function validateAll() {
    let valid = true;
    const fields = ['fullName', 'email', 'phone', 'enquiryType', 'message'];
    fields.forEach(function (id) {
      if (!validateField(id)) valid = false;
    });
    return valid;
  }

  function validateField(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const value = el.value.trim();

    switch (id) {

      case 'fullName':
        if (value.length < 2) {
          showError(id, 'Please enter your full name (at least 2 characters).');
          return false;
        }
        if (!/^[a-zA-Z\s\-']+$/.test(value)) {
          showError(id, 'Name may only contain letters, spaces, hyphens or apostrophes.');
          return false;
        }
        break;

      case 'email':
        // RFC-friendly email regex
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          showError(id, 'Please enter a valid email address (e.g. name@example.com).');
          return false;
        }
        break;

      case 'phone':
        // South African phone: 10 digits, optionally with spaces or dashes
        if (!/^(\+27|0)[0-9]{9}$/.test(value.replace(/[\s\-]/g, ''))) {
          showError(id, 'Please enter a valid SA phone number (e.g. 072 481 0692).');
          return false;
        }
        break;

      case 'enquiryType':
        if (value === '') {
          showError(id, 'Please select an enquiry type.');
          return false;
        }
        break;

      case 'message':
        if (value.length < 10) {
          showError(id, 'Message must be at least 10 characters.');
          return false;
        }
        if (value.length > 500) {
          showError(id, 'Message must not exceed 500 characters.');
          return false;
        }
        break;
    }

    clearError(id);
    markValid(id);
    return true;
  }

  function showError(fieldId, message) {
    const errEl = document.getElementById(fieldId + 'Error');
    const input = document.getElementById(fieldId);
    if (errEl)  errEl.textContent = message;
    if (input)  input.classList.add('input-error');
    if (input)  input.classList.remove('input-valid');
  }

  function clearError(fieldId) {
    const errEl = document.getElementById(fieldId + 'Error');
    const input = document.getElementById(fieldId);
    if (errEl) errEl.textContent = '';
    if (input) input.classList.remove('input-error');
  }

  function markValid(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) input.classList.add('input-valid');
  }

  /* ======================================================
     DYNAMIC RESPONSE FUNCTION
     ====================================================== */

  function showResponse(name, email, phone, enquiryType, message) {

    // Response data per enquiry type
    const responses = {
      pricing: {
        heading: 'Pricing Information',
        body: `Thank you for your interest, <strong>${name}</strong>! Here's a summary of our current pricing:
               <ul>
                 <li>Burgers from <strong>R60</strong></li>
                 <li>Chicken Wings (6 pcs) from <strong>R60</strong></li>
                 <li>Seafood meals from <strong>R70</strong></li>
                 <li>Sides from <strong>R30</strong></li>
                 <li>Drinks from <strong>R10</strong></li>
               </ul>
               View the full menu on our <a href="menu.html">Menu page</a>.`
      },
      availability: {
        heading: 'Our Availability',
        body: `Hi <strong>${name}</strong>! We are open at the following times:
               <ul>
                 <li>Monday – Wednesday: 10:00 – 20:00</li>
                 <li>Thursday – Saturday: 10:00 – 20:30</li>
                 <li>Sunday: 10:00 – 20:00</li>
               </ul>
               We offer <strong>dine-in</strong> and <strong>takeaway</strong> services.`
      },
      catering: {
        heading: 'Catering & Bulk Orders',
        body: `Hi <strong>${name}</strong>! We do accommodate bulk and catering orders.
               Our team will contact you at <strong>${email}</strong> or <strong>${phone}</strong>
               within 24 hours to discuss quantities, pricing, and delivery arrangements.
               We recommend placing orders at least <strong>48 hours</strong> in advance.`
      },
      sponsorship: {
        heading: 'Sponsorship & Partnerships',
        body: `Hello <strong>${name}</strong>! We appreciate your interest in partnering with Food Factory.
               A member of our management team will review your proposal and reach out to you
               at <strong>${email}</strong> within 2–3 business days.`
      },
      general: {
        heading: 'General Enquiry Received',
        body: `Thank you, <strong>${name}</strong>! We have received your enquiry and will respond
               to <strong>${email}</strong> as soon as possible, usually within 1 business day.`
      }
    };

    const selected = responses[enquiryType] || responses.general;

    // Build the response card
    const responseCard = document.createElement('div');
    responseCard.id = 'enquiryResponse';
    responseCard.className = 'response-card';
    responseCard.innerHTML = `
      <div class="response-icon">✔</div>
      <h3>${selected.heading}</h3>
      <p>${selected.body}</p>
      <hr>
      <p class="response-meta">
        <strong>Your enquiry:</strong> "${message}"<br>
        <strong>Reference:</strong> FF-${Date.now().toString().slice(-6)}<br>
        A copy will be sent to <strong>${email}</strong>.
      </p>
      <button onclick="resetForm()" class="reset-btn">Send Another Enquiry</button>
    `;

    // Hide form, show response
    const form = document.getElementById('enquiryForm');
    if (form) {
      form.style.display = 'none';
      form.parentNode.insertBefore(responseCard, form.nextSibling);
    }

    // Scroll to response
    responseCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Reset form ── */
  window.resetForm = function () {
    const response = document.getElementById('enquiryResponse');
    const form     = document.getElementById('enquiryForm');
    if (response) response.remove();
    if (form) {
      form.style.display = 'block';
      form.reset();
      if (charCount) charCount.textContent = '0';
      fields.forEach(function (id) { clearError(id); });
    }
  };

  /* ======================================================
     GOOGLE MAP INJECTION
     ====================================================== */

  function injectMap() {
    // Food Factory location: Corner Milner & Waverley Road, Bayswater, Bloemfontein
    const mapWrapper = document.createElement('div');
    mapWrapper.className = 'map-section';
    mapWrapper.innerHTML = `
      <h2>Find Us</h2>
      <p>Corner Milner &amp; Waverley Road, Bayswater, Bloemfontein</p>
      <div class="map-container">
        <iframe
          title="Food Factory Location - Bayswater, Bloemfontein"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.3!2d26.2041!3d-29.0852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e8fb4b3cbffffff%3A0x0!2sBayswater%2C+Bloemfontein%2C+9301!5e0!3m2!1sen!2sza!4v1700000000000"
          width="100%"
          height="320"
          style="border:0; border-radius:6px;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    `;

    // Insert map below the form
    const form = document.getElementById('enquiryForm');
    if (form) {
      form.parentNode.insertBefore(mapWrapper, form.nextSibling);
    } else {
      document.body.appendChild(mapWrapper);
    }
  }

}); // end DOMContentLoaded


/* ======================================================
   INLINE STYLES injected via JS
   (keeps the HTML clean; in production use style.css)
   ====================================================== */
(function injectEnquiryStyles() {
  const style = document.createElement('style');
  style.textContent = `
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
    #submitBtn {
      padding: 12px 32px; background: #E63946; color: #fff;
      border: none; border-radius: 6px; cursor: pointer;
      font-size: 1rem; font-weight: 700; letter-spacing: 0.05em;
      transition: background 0.2s, transform 0.1s;
    }
    #submitBtn:hover { background: #c62b37; transform: translateY(-1px); }
    .response-card {
      background: #fff; border-left: 5px solid #E63946;
      border-radius: 6px; padding: 28px 32px;
      margin: 24px auto; max-width: 560px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .response-icon { font-size: 2rem; color: #2a9d5c; margin-bottom: 8px; }
    .response-card h3 { font-size: 1.3rem; margin-bottom: 12px; color: #1A1A1A; }
    .response-card ul { padding-left: 20px; margin: 10px 0; }
    .response-card ul li { margin-bottom: 6px; }
    .response-meta { font-size: 0.9rem; color: #555; margin-top: 12px; }
    .reset-btn {
      margin-top: 16px; padding: 10px 24px;
      background: #1A1A1A; color: #fff;
      border: none; border-radius: 6px;
      cursor: pointer; font-size: 0.9rem;
    }
    .reset-btn:hover { background: #333; }
    .map-section { max-width: 960px; margin: 40px auto; padding: 0 24px; }
    .map-section h2 { color: #E63946; font-size: 1.4rem; margin-bottom: 8px; }
    .map-container { margin-top: 12px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  `;
  document.head.appendChild(style);
})();
