/**
 * contact-form.js
 * Handles all contact form logic for Prime Solid Contracting & General Maintenance
 * - Real-time field validation
 * - Error / success UI feedback
 * - Character counter for message textarea
 * - WhatsApp & Email submission options
 * - Urgent-request visual indicator
 */

'use strict';

/* ============================================================
   CONSTANTS
   ============================================================ */
const WHATSAPP_NUMBER = '971501984302';
const EMAIL_ADDRESS   = 'promesolid2022@gmail.com';

const SERVICE_LABELS = {
    ac:          'AC Installation & Repair',
    plumbing:    'Plumbing Works',
    electrical:  'Electrical Works',
    painting:    'Painting Services',
    carpentry:   'Carpentry Works',
    maintenance: 'Building Maintenance',
    other:       'Other / General Inquiry',
};

const PROPERTY_LABELS = {
    residential: 'Residential - Villa',
    apartment:   'Residential - Apartment',
    commercial:  'Commercial Office',
    retail:      'Retail Space',
    warehouse:   'Warehouse / Industrial',
    other:       'Other',
};

const MSG_MAX_CHARS = 1000;

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Returns true when the value is a non-empty string (after trimming).
 */
function isNotEmpty(value) {
    return value.trim().length > 0;
}

/**
 * Basic email format check.
 */
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Accepts formats: +971501984302, 0501984302, 00971501984302, 971501984302
 * Minimum 7 digits, maximum 15 digits (after stripping spaces/dashes).
 */
function isValidPhone(value) {
    const stripped = value.trim().replace(/[\s\-().]/g, '');
    return /^\+?[0-9]{7,15}$/.test(stripped);
}

/* ============================================================
   UI HELPERS
   ============================================================ */

/**
 * Marks a field group as invalid and shows the error message.
 */
function showError(fieldId, message) {
    const group = document.getElementById(fieldId)?.closest('.form-group');
    if (!group) return;

    clearError(fieldId);                     // avoid duplicates

    group.classList.add('form-group--error');
    group.classList.remove('form-group--success');

    const err = document.createElement('span');
    err.className = 'form-error-msg';
    err.textContent = message;
    group.appendChild(err);
}

/**
 * Marks a field group as valid (green border).
 */
function showSuccess(fieldId) {
    const group = document.getElementById(fieldId)?.closest('.form-group');
    if (!group) return;

    clearError(fieldId);
    group.classList.add('form-group--success');
}

/**
 * Removes any existing error state from a field group.
 */
function clearError(fieldId) {
    const group = document.getElementById(fieldId)?.closest('.form-group');
    if (!group) return;

    group.classList.remove('form-group--error', 'form-group--success');
    group.querySelector('.form-error-msg')?.remove();
}

/**
 * Shows a toast notification at the top-right of the screen.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'success') {
    // Remove any existing toast
    document.querySelector('.cf-toast')?.remove();

    const colours = {
        success: '#28a745',
        error:   '#dc3545',
        info:    '#004e89',
    };

    const icons = {
        success: 'fas fa-check-circle',
        error:   'fas fa-times-circle',
        info:    'fas fa-info-circle',
    };

    const toast = document.createElement('div');
    toast.className = 'cf-toast';
    toast.innerHTML = `<i class="${icons[type]}"></i><span>${message}</span>`;

    Object.assign(toast.style, {
        position:        'fixed',
        top:             '100px',
        right:           '20px',
        display:         'flex',
        alignItems:      'center',
        gap:             '12px',
        background:      colours[type],
        color:           '#fff',
        padding:         '16px 24px',
        borderRadius:    '10px',
        boxShadow:       '0 6px 20px rgba(0,0,0,0.2)',
        zIndex:          '99999',
        fontWeight:      '600',
        fontSize:        '1rem',
        maxWidth:        '360px',
        animation:       'cfSlideIn 0.4s ease',
    });

    // Inject keyframe once
    if (!document.getElementById('cf-toast-style')) {
        const style = document.createElement('style');
        style.id = 'cf-toast-style';
        style.textContent = `
            @keyframes cfSlideIn {
                from { transform: translateX(120%); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
            }
            @keyframes cfSlideOut {
                from { transform: translateX(0);    opacity: 1; }
                to   { transform: translateX(120%); opacity: 0; }
            }
            /* Validation state styles */
            .form-group--error input,
            .form-group--error select,
            .form-group--error textarea {
                border-color: #dc3545 !important;
                background-color: #fff8f8 !important;
            }
            .form-group--success input,
            .form-group--success select,
            .form-group--success textarea {
                border-color: #28a745 !important;
                background-color: #f8fff9 !important;
            }
            .form-error-msg {
                display: block;
                margin-top: 6px;
                color: #dc3545;
                font-size: 0.85rem;
                font-weight: 500;
            }
            /* Character counter */
            .char-counter {
                display: block;
                text-align: right;
                font-size: 0.82rem;
                color: #888;
                margin-top: 4px;
            }
            .char-counter.over-limit { color: #dc3545; font-weight: 600; }
            /* Urgent checkbox highlight */
            .urgent-active {
                background: #fff3cd !important;
                border: 2px solid #ff6b35 !important;
                border-radius: 8px;
                padding: 10px 14px !important;
            }
            /* Submit button loading state */
            .btn--loading {
                opacity: 0.75;
                pointer-events: none;
                cursor: not-allowed;
            }
            /* Channel picker modal */
            .cf-modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.55);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99998;
                animation: cfFadeIn 0.25s ease;
            }
            @keyframes cfFadeIn {
                from { opacity: 0; } to { opacity: 1; }
            }
            .cf-modal {
                background: #fff;
                border-radius: 18px;
                padding: 40px 35px;
                max-width: 440px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.25);
            }
            .cf-modal h3 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 10px; }
            .cf-modal p  { color: #6c757d; margin-bottom: 30px; font-size: 0.98rem; }
            .cf-modal__buttons { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
            .cf-modal__btn {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 13px 28px;
                border: none;
                border-radius: 50px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
            }
            .cf-modal__btn--whatsapp { background: #25d366; color: #fff; }
            .cf-modal__btn--whatsapp:hover { background: #1ebe5d; transform: translateY(-2px); }
            .cf-modal__btn--email    { background: #ff6b35; color: #fff; }
            .cf-modal__btn--email:hover    { background: #ff5722; transform: translateY(-2px); }
            .cf-modal__btn--cancel   { background: #f5f5f5; color: #555; }
            .cf-modal__btn--cancel:hover   { background: #e0e0e0; }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'cfSlideOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

/* ============================================================
   CHARACTER COUNTER
   ============================================================ */

function initCharCounter() {
    const textarea = document.getElementById('messageText');
    if (!textarea) return;

    const counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.textContent = `0 / ${MSG_MAX_CHARS}`;
    textarea.insertAdjacentElement('afterend', counter);

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        counter.textContent = `${len} / ${MSG_MAX_CHARS}`;
        counter.classList.toggle('over-limit', len > MSG_MAX_CHARS);
    });
}

/* ============================================================
   URGENT CHECKBOX BEHAVIOUR
   ============================================================ */

function initUrgentCheckbox() {
    const checkbox = document.getElementById('urgentService');
    const group    = checkbox?.closest('.checkbox-group');
    if (!checkbox || !group) return;

    checkbox.addEventListener('change', () => {
        group.classList.toggle('urgent-active', checkbox.checked);
    });
}

/* ============================================================
   REAL-TIME FIELD VALIDATION
   ============================================================ */

function initLiveValidation() {
    const rules = [
        {
            id:      'fullName',
            events:  ['input', 'blur'],
            validate: v => isNotEmpty(v) || 'Please enter your full name.',
        },
        {
            id:      'emailAddress',
            events:  ['input', 'blur'],
            validate: v => {
                if (!isNotEmpty(v))    return 'Email address is required.';
                if (!isValidEmail(v)) return 'Please enter a valid email address.';
                return true;
            },
        },
        {
            id:      'phoneNumber',
            events:  ['input', 'blur'],
            validate: v => {
                if (!isNotEmpty(v))    return 'Phone number is required.';
                if (!isValidPhone(v)) return 'Please enter a valid phone number.';
                return true;
            },
        },
        {
            id:      'serviceType',
            events:  ['change', 'blur'],
            validate: v => isNotEmpty(v) || 'Please select a service.',
        },
        {
            id:      'messageText',
            events:  ['input', 'blur'],
            validate: v => {
                if (!isNotEmpty(v))             return 'Please describe your requirements.';
                if (v.trim().length < 10)       return 'Message is too short (min 10 characters).';
                if (v.length > MSG_MAX_CHARS)   return `Message must not exceed ${MSG_MAX_CHARS} characters.`;
                return true;
            },
        },
    ];

    rules.forEach(({ id, events, validate }) => {
        const el = document.getElementById(id);
        if (!el) return;

        events.forEach(evt => {
            el.addEventListener(evt, () => {
                const result = validate(el.value);
                if (result === true) {
                    showSuccess(id);
                } else {
                    showError(id, result);
                }
            });
        });
    });
}

/* ============================================================
   FORM VALIDATION (full check on submit)
   ============================================================ */

/**
 * Validates all required fields.
 * Returns true when all pass, false otherwise.
 */
function validateForm() {
    let valid = true;

    // Full Name
    const name = document.getElementById('fullName')?.value ?? '';
    if (!isNotEmpty(name)) {
        showError('fullName', 'Please enter your full name.');
        valid = false;
    } else {
        showSuccess('fullName');
    }

    // Email
    const email = document.getElementById('emailAddress')?.value ?? '';
    if (!isNotEmpty(email)) {
        showError('emailAddress', 'Email address is required.');
        valid = false;
    } else if (!isValidEmail(email)) {
        showError('emailAddress', 'Please enter a valid email address.');
        valid = false;
    } else {
        showSuccess('emailAddress');
    }

    // Phone
    const phone = document.getElementById('phoneNumber')?.value ?? '';
    if (!isNotEmpty(phone)) {
        showError('phoneNumber', 'Phone number is required.');
        valid = false;
    } else if (!isValidPhone(phone)) {
        showError('phoneNumber', 'Please enter a valid phone number.');
        valid = false;
    } else {
        showSuccess('phoneNumber');
    }

    // Service
    const service = document.getElementById('serviceType')?.value ?? '';
    if (!isNotEmpty(service)) {
        showError('serviceType', 'Please select a service.');
        valid = false;
    } else {
        showSuccess('serviceType');
    }

    // Message
    const msg = document.getElementById('messageText')?.value ?? '';
    if (!isNotEmpty(msg)) {
        showError('messageText', 'Please describe your requirements.');
        valid = false;
    } else if (msg.trim().length < 10) {
        showError('messageText', 'Message is too short (min 10 characters).');
        valid = false;
    } else if (msg.length > MSG_MAX_CHARS) {
        showError('messageText', `Message must not exceed ${MSG_MAX_CHARS} characters.`);
        valid = false;
    } else {
        showSuccess('messageText');
    }

    return valid;
}

/* ============================================================
   BUILD MESSAGE STRING
   ============================================================ */

function buildMessage(data) {
    const urgentTag = data.urgent ? '🚨 URGENT REQUEST\n' : '';
    const serviceLabel  = SERVICE_LABELS[data.service]  ?? data.service;
    const propertyLabel = PROPERTY_LABELS[data.property] ?? (data.property || 'Not specified');

    return `${urgentTag}New Service Request – Prime Solid Contracting
==========================================
👤 Name:     ${data.name}
📧 Email:    ${data.email}
📞 Phone:    ${data.phone}
🔧 Service:  ${serviceLabel}
🏠 Property: ${propertyLabel}
------------------------------------------
📝 Message:
${data.message}
==========================================
Sent via PrimeSolid.ae contact form`;
}

/* ============================================================
   CHANNEL PICKER MODAL
   ============================================================ */

function showChannelModal(message) {
    const waUrl   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const mailUrl = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent('Service Request – Prime Solid Contracting')}&body=${encodeURIComponent(message)}`;

    const backdrop = document.createElement('div');
    backdrop.className = 'cf-modal-backdrop';
    backdrop.innerHTML = `
        <div class="cf-modal" role="dialog" aria-modal="true" aria-label="Choose how to send your message">
            <h3>How would you like to send?</h3>
            <p>Choose your preferred contact channel. We respond to WhatsApp within 30 minutes!</p>
            <div class="cf-modal__buttons">
                <a href="${waUrl}" target="_blank" rel="noopener" class="cf-modal__btn cf-modal__btn--whatsapp">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <a href="${mailUrl}" class="cf-modal__btn cf-modal__btn--email">
                    <i class="fas fa-envelope"></i> Email
                </a>
                <button class="cf-modal__btn cf-modal__btn--cancel" id="cfModalCancel">
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    // Close on Cancel button
    backdrop.querySelector('#cfModalCancel').addEventListener('click', () => backdrop.remove());

    // Close when clicking outside the modal box
    backdrop.addEventListener('click', e => {
        if (e.target === backdrop) backdrop.remove();
    });

    // Close on Escape key
    const onKeydown = e => {
        if (e.key === 'Escape') { backdrop.remove(); document.removeEventListener('keydown', onKeydown); }
    };
    document.addEventListener('keydown', onKeydown);
}

/* ============================================================
   FORM SUBMIT HANDLER
   ============================================================ */

function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.form-group--error');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Please fix the errors before submitting.', 'error');
        return;
    }

    // Collect values
    const data = {
        name:     document.getElementById('fullName').value.trim(),
        email:    document.getElementById('emailAddress').value.trim(),
        phone:    document.getElementById('phoneNumber').value.trim(),
        service:  document.getElementById('serviceType').value,
        property: document.getElementById('propertyType')?.value ?? '',
        message:  document.getElementById('messageText').value.trim(),
        urgent:   document.getElementById('urgentService')?.checked ?? false,
    };

    // Simulate brief "sending" state
    const submitBtn = document.querySelector('#contactFormMain [type="submit"]');
    if (submitBtn) {
        submitBtn.classList.add('btn--loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';
    }

    setTimeout(() => {
        if (submitBtn) {
            submitBtn.classList.remove('btn--loading');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }

        const message = buildMessage(data);
        showToast('Message ready! Choose how to send it below.', 'info');
        showChannelModal(message);

        // Reset form after a short delay so user still sees success state
        setTimeout(() => {
            document.getElementById('contactFormMain').reset();
            // Clear all visual states
            ['fullName','emailAddress','phoneNumber','serviceType','propertyType','messageText']
                .forEach(id => clearError(id));
            document.querySelector('.char-counter')?.replaceChildren(
                document.createTextNode(`0 / ${MSG_MAX_CHARS}`)
            );
            document.querySelector('.urgent-active')?.classList.remove('urgent-active');
        }, 500);

    }, 800);
}

/* ============================================================
   INIT
   ============================================================ */

function init() {
    const form = document.getElementById('contactFormMain');
    if (!form) return;      // Not on the contact page – do nothing

    initCharCounter();
    initUrgentCheckbox();
    initLiveValidation();

    form.addEventListener('submit', handleSubmit);
}

// Run after the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}