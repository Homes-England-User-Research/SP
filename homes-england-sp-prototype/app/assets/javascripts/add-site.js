/**
 * add-site.js — Conditional reveals for Add New Site steps 3 and 4.
 *
 * Two patterns handled:
 *
 * 1. Dropdown-driven conditional reveals (Step 4: Site milestones)
 *    Elements with class .js-conditional-select-content are shown/hidden
 *    based on the value of a <select> element identified by the
 *    data-conditional-for attribute. The data-conditional-value attribute
 *    specifies which option value triggers the reveal.
 *
 * 2. MMC sub-category reveals (Step 3: Design and sustainability)
 *    Sections with data-mmc-parent="category-N" are shown/hidden based
 *    on whether the parent category checkbox is checked.
 *
 * 3. Currency formatting (Step 2: Historical grant amount)
 *    Inputs with class .js-currency-input get live comma formatting
 *    as the user types, matching the forecasting table pattern.
 *
 * Progressive enhancement: without JS, all conditional sections are
 * visible (hidden attribute is set server-side only when values match).
 */

document.addEventListener('DOMContentLoaded', function () {
  // ─── Pattern 1: Dropdown conditional reveals ─────────────────────────
  var conditionalSections = document.querySelectorAll('.js-conditional-select-content')

  conditionalSections.forEach(function (section) {
    var selectId = section.getAttribute('data-conditional-for')
    var triggerValue = section.getAttribute('data-conditional-value')
    var selectEl = document.getElementById(selectId)

    if (!selectEl) return

    function toggleSection () {
      if (selectEl.value === triggerValue) {
        section.removeAttribute('hidden')
      } else {
        section.setAttribute('hidden', '')
      }
    }

    selectEl.addEventListener('change', toggleSection)
    // Initial state set server-side via Nunjucks, no need to call on load
  })

  // ─── Pattern 2: MMC sub-category reveals ─────────────────────────────
  var mmcSubSections = document.querySelectorAll('[data-mmc-parent]')

  mmcSubSections.forEach(function (section) {
    var parentValue = section.getAttribute('data-mmc-parent')
    var checkbox = document.querySelector(
      'input[name="mmc-categories"][value="' + parentValue + '"]'
    )

    if (!checkbox) return

    function toggleSubCategory () {
      if (checkbox.checked) {
        section.removeAttribute('hidden')
      } else {
        section.setAttribute('hidden', '')
      }
    }

    checkbox.addEventListener('change', toggleSubCategory)

    // Set initial state based on checkbox state
    toggleSubCategory()
  })

  // ─── Pattern 3: Currency formatting ──────────────────────────────────
  var currencyInputs = document.querySelectorAll('.js-currency-input')

  currencyInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      // Strip non-digit characters, parse, and re-format with commas
      var raw = parseInt(input.value.replace(/[^0-9]/g, ''), 10)
      if (isNaN(raw) || raw === 0) {
        input.value = ''
        return
      }
      // Preserve cursor position relative to end
      var endOffset = input.value.length - input.selectionStart
      var formatted = raw.toLocaleString('en-GB')
      input.value = formatted
      // Restore cursor
      var newPos = formatted.length - endOffset
      if (newPos < 0) newPos = 0
      input.setSelectionRange(newPos, newPos)
    })
  })
})
