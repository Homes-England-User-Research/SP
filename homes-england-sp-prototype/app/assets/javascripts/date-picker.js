/**
 * date-picker.js
 *
 * Progressive enhancement of the GOV.UK date input component.
 * Adds a calendar toggle button that reveals a visual month grid.
 * The base GDS date input (day/month/year fields) works fully without JS.
 *
 * Expected HTML structure:
 *
 *   <div data-module="date-picker" id="my-date-picker">
 *     <div class="govuk-form-group">
 *       <fieldset class="govuk-fieldset">
 *         <legend>...</legend>
 *         <div class="govuk-date-input">
 *           <div class="govuk-date-input__item">
 *             <input class="govuk-input" id="my-date-picker-day"   type="text" name="...day">
 *           </div>
 *           <div class="govuk-date-input__item">
 *             <input class="govuk-input" id="my-date-picker-month" type="text" name="...month">
 *           </div>
 *           <div class="govuk-date-input__item">
 *             <input class="govuk-input" id="my-date-picker-year"  type="text" name="...year">
 *           </div>
 *         </div>
 *       </fieldset>
 *     </div>
 *   </div>
 *
 * Vanilla JS only — no jQuery or framework dependency.
 * Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /**
   * Return true if the user prefers reduced motion.
   */
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Zero-pad a number to two digits.
   * @param {number} n
   * @returns {string}
   */
  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /**
   * Get the number of days in a month.
   * @param {number} year
   * @param {number} month - 0-indexed
   * @returns {number}
   */
  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Get the day-of-week index (0=Mon … 6=Sun) for the 1st of a month.
   * @param {number} year
   * @param {number} month - 0-indexed
   * @returns {number}
   */
  function firstDayOfMonth(year, month) {
    var day = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon…
    return day === 0 ? 6 : day - 1; // Normalise to 0=Mon … 6=Sun
  }

  /**
   * Initialise a single date-picker widget.
   * @param {HTMLElement} container
   */
  function initDatePicker(container) {
    var id = container.id || 'date-picker-' + Math.random().toString(36).slice(2);

    // Find the day/month/year inputs inside the container
    var inputs = container.querySelectorAll('.govuk-date-input .govuk-input');
    if (inputs.length < 3) { return; }

    var dayInput   = inputs[0];
    var monthInput = inputs[1];
    var yearInput  = inputs[2];

    // ── Create toggle button ────────────────────────────────────────────────

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'govuk-button govuk-button--secondary sp-date-picker-toggle';
    toggleBtn.setAttribute('aria-label', 'Open date picker');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', id + '-calendar');
    toggleBtn.innerHTML =
      '<span aria-hidden="true">&#128197;</span>' +
      '<span class="govuk-visually-hidden">Open date picker</span>';

    // Insert the button after the date input group
    var dateInputGroup = container.querySelector('.govuk-date-input');
    if (dateInputGroup) {
      dateInputGroup.parentNode.insertBefore(toggleBtn, dateInputGroup.nextSibling);
    }

    // ── Create calendar popup ───────────────────────────────────────────────

    var calendar = document.createElement('div');
    calendar.id = id + '-calendar';
    calendar.className = 'sp-date-picker-calendar';
    calendar.setAttribute('role', 'dialog');
    calendar.setAttribute('aria-label', 'Date picker calendar');
    calendar.setAttribute('aria-modal', 'true');
    calendar.hidden = true;
    if (!prefersReducedMotion()) {
      calendar.style.transition = 'opacity 0.15s ease';
    }

    container.appendChild(calendar);

    // State
    var today = new Date();
    var displayYear  = today.getFullYear();
    var displayMonth = today.getMonth(); // 0-indexed

    // ── Render the calendar grid ────────────────────────────────────────────

    function renderCalendar() {
      var totalDays = daysInMonth(displayYear, displayMonth);
      var startDay  = firstDayOfMonth(displayYear, displayMonth);

      // Read currently selected date from inputs
      var selDay   = parseInt(dayInput.value, 10)   || 0;
      var selMonth = parseInt(monthInput.value, 10) || 0; // 1-indexed
      var selYear  = parseInt(yearInput.value, 10)  || 0;

      var html = '';

      // Header: prev / month+year / next
      html += '<div class="sp-date-picker-header">';
      html +=   '<button type="button" class="sp-date-picker-nav" data-dir="-1" ' +
                        'aria-label="Previous month">&#8249;</button>';
      html +=   '<span class="sp-date-picker-month-label" aria-live="polite">' +
                  MONTHS[displayMonth] + ' ' + displayYear +
                '</span>';
      html +=   '<button type="button" class="sp-date-picker-nav" data-dir="1" ' +
                        'aria-label="Next month">&#8250;</button>';
      html += '</div>';

      // Grid
      html += '<table role="grid" class="sp-date-picker-grid" ' +
                     'aria-label="' + MONTHS[displayMonth] + ' ' + displayYear + '">';
      html += '<thead><tr>';
      DAYS.forEach(function (d) {
        html += '<th scope="col" role="columnheader" abbr="' + d + '">' + d + '</th>';
      });
      html += '</tr></thead>';
      html += '<tbody>';

      var cell = 0;
      var row = '<tr>';

      // Empty cells before first day
      for (var i = 0; i < startDay; i++) {
        row += '<td role="gridcell"></td>';
        cell++;
      }

      for (var day = 1; day <= totalDays; day++) {
        var isSelected =
          day === selDay &&
          displayMonth + 1 === selMonth &&
          displayYear === selYear;

        var isToday =
          day === today.getDate() &&
          displayMonth === today.getMonth() &&
          displayYear === today.getFullYear();

        var label = day + ' ' + MONTHS[displayMonth] + ' ' + displayYear;
        var classes = 'sp-date-picker-day';
        if (isSelected) { classes += ' sp-date-picker-day--selected'; }
        if (isToday)    { classes += ' sp-date-picker-day--today'; }

        row += '<td role="gridcell" aria-selected="' + (isSelected ? 'true' : 'false') + '">';
        row += '<button type="button" class="' + classes + '" ' +
                       'data-day="' + day + '" ' +
                       'aria-label="' + label + '"' +
                       (isSelected ? ' aria-pressed="true"' : '') + '>' +
               day + '</button>';
        row += '</td>';
        cell++;

        if (cell % 7 === 0) {
          html += row + '</tr>';
          row = '<tr>';
        }
      }

      // Fill remaining cells
      var remainder = cell % 7;
      if (remainder !== 0) {
        for (var j = remainder; j < 7; j++) {
          row += '<td role="gridcell"></td>';
        }
        html += row + '</tr>';
      }

      html += '</tbody></table>';

      // Close button
      html += '<div class="sp-date-picker-footer">' +
                '<button type="button" class="govuk-link sp-date-picker-close">' +
                  'Close' +
                '</button>' +
              '</div>';

      calendar.innerHTML = html;

      // Attach event listeners to the newly rendered elements

      // Prev/next month navigation
      var navBtns = calendar.querySelectorAll('.sp-date-picker-nav');
      Array.prototype.forEach.call(navBtns, function (btn) {
        btn.addEventListener('click', function () {
          var dir = parseInt(btn.getAttribute('data-dir'), 10);
          displayMonth += dir;
          if (displayMonth > 11) { displayMonth = 0; displayYear++; }
          if (displayMonth < 0)  { displayMonth = 11; displayYear--; }
          renderCalendar();
        });
      });

      // Day selection
      var dayBtns = calendar.querySelectorAll('.sp-date-picker-day');
      Array.prototype.forEach.call(dayBtns, function (btn) {
        btn.addEventListener('click', function () {
          var selectedDay = parseInt(btn.getAttribute('data-day'), 10);
          dayInput.value   = pad(selectedDay);
          monthInput.value = pad(displayMonth + 1);
          yearInput.value  = String(displayYear);
          closeCalendar();
          dayInput.focus();
        });
      });

      // Close button
      var closeBtn = calendar.querySelector('.sp-date-picker-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          closeCalendar();
          toggleBtn.focus();
        });
      }

      // Keyboard navigation within the calendar
      calendar.addEventListener('keydown', calendarKeydown);
    }

    // ── Open / close ────────────────────────────────────────────────────────

    function openCalendar() {
      // Navigate to currently entered date if valid
      var enteredMonth = parseInt(monthInput.value, 10);
      var enteredYear  = parseInt(yearInput.value, 10);
      if (enteredMonth >= 1 && enteredMonth <= 12) {
        displayMonth = enteredMonth - 1;
      }
      if (enteredYear >= 1000 && enteredYear <= 9999) {
        displayYear = enteredYear;
      }

      calendar.hidden = false;
      toggleBtn.setAttribute('aria-expanded', 'true');
      renderCalendar();

      // Move focus to the first day button
      var firstDay = calendar.querySelector('.sp-date-picker-day');
      if (firstDay) { firstDay.focus(); }
    }

    function closeCalendar() {
      calendar.hidden = true;
      toggleBtn.setAttribute('aria-expanded', 'false');
      calendar.removeEventListener('keydown', calendarKeydown);
    }

    function calendarKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCalendar();
        toggleBtn.focus();
      }

      // Arrow key navigation within the grid
      var allDayBtns = Array.prototype.slice.call(calendar.querySelectorAll('.sp-date-picker-day'));
      var focused = document.activeElement;
      var idx = allDayBtns.indexOf(focused);

      if (idx === -1) { return; }

      var newIdx;
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          newIdx = Math.min(idx + 1, allDayBtns.length - 1);
          allDayBtns[newIdx].focus();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          newIdx = Math.max(idx - 1, 0);
          allDayBtns[newIdx].focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          newIdx = Math.min(idx + 7, allDayBtns.length - 1);
          allDayBtns[newIdx].focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          newIdx = Math.max(idx - 7, 0);
          allDayBtns[newIdx].focus();
          break;
        default:
          break;
      }
    }

    // Toggle button click
    toggleBtn.addEventListener('click', function () {
      if (calendar.hidden) {
        openCalendar();
      } else {
        closeCalendar();
        toggleBtn.focus();
      }
    });

    // Close on outside click
    document.addEventListener('click', function (event) {
      if (!calendar.hidden && !container.contains(event.target)) {
        closeCalendar();
      }
    });
  }

  /**
   * Find and initialise all date-picker widgets on the page.
   */
  function init() {
    var containers = document.querySelectorAll('[data-module="date-picker"]');
    Array.prototype.forEach.call(containers, function (container) {
      initDatePicker(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
