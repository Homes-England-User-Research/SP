/**
 * editable-table.js
 *
 * Auto-calculates "Homes Remaining" and "Attributable Grant" for each row
 * in the SP editable table, and updates the summary totals rows.
 *
 * Formulas:
 *   Homes Remaining    = Forecast Homes - Completed Homes
 *   Attributable Grant = Forecast Homes × grant rate (from data-grant-rate on <tr>)
 *
 * If remaining is negative, a govuk-tag--red "Deficit" indicator is appended.
 * The containing <span> carries aria-live="polite" so screen readers announce
 * the recalculated value when it changes — satisfying WCAG 2.1 SC 4.1.3.
 *
 * Forecast inputs enforce whole numbers only — decimal points and non-numeric
 * characters are stripped on input.
 *
 * Vanilla JS only — no jQuery or framework dependency.
 */

(function () {
  'use strict';

  /**
   * Format a number as £X,XXX with thousands separators.
   * @param {number} value
   * @returns {string}
   */
  function formatCurrency(value) {
    return '£' + value.toLocaleString('en-GB');
  }

  /**
   * Recalculate Homes Remaining and Attributable Grant for a single table row.
   * @param {string} rowId - the data-row-id on the <tr>
   */
  function recalculateRow(rowId) {
    var forecastInput = document.getElementById(rowId + '-forecast');
    var actualSpan    = document.querySelector('[data-col="actual"][data-row="' + rowId + '"]');
    var completedSpan = document.querySelector('[data-col="completed"][data-row="' + rowId + '"]');
    var remainingSpan = document.querySelector('.sp-units-remaining[data-row="' + rowId + '"]');
    var grantSpan     = document.querySelector('[data-col="grant"][data-row="' + rowId + '"]');

    if (!forecastInput || !remainingSpan) {
      return;
    }

    var forecast  = parseInt(forecastInput.value, 10) || 0;

    // Support both column naming conventions: "actual" (old) and "completed" (new)
    var actual = 0;
    if (actualSpan) {
      actual = parseInt(actualSpan.textContent, 10) || 0;
    } else if (completedSpan) {
      actual = parseInt(completedSpan.textContent, 10) || 0;
    }

    var remaining = forecast - actual;

    var displayText = String(remaining);

    if (remaining < 0) {
      displayText +=
        ' <strong class="govuk-tag govuk-tag--red sp-deficit-tag" aria-hidden="true">Deficit</strong>' +
        '<span class="govuk-visually-hidden"> — deficit</span>';
    }

    remainingSpan.innerHTML = displayText;

    // Calculate attributable grant if a grant rate is defined on the row
    if (grantSpan) {
      var row = forecastInput.closest('tr');
      var grantRate = row ? parseInt(row.getAttribute('data-grant-rate'), 10) || 0 : 0;
      var grantValue = forecast * grantRate;
      grantSpan.textContent = grantValue === 0 ? '0' : formatCurrency(grantValue);
    }
  }

  /**
   * Recalculate the "Total homes forecasted" summary row by summing all
   * forecast inputs, actual/completed spans, remaining spans, and grant
   * values across all tier tables.
   */
  function recalculateTotals() {
    var totalForecastEl  = document.querySelector('.sp-total-forecast');
    var totalActualEl    = document.querySelector('.sp-total-actual');
    var totalRemainingEl = document.querySelector('.sp-total-remaining');
    var totalGrantEl     = document.querySelector('.sp-total-grant');
    var grandTotalEl     = document.querySelector('.sp-grand-total-grant');

    if (!totalForecastEl) {
      return;
    }

    var totalForecast  = 0;
    var totalActual    = 0;
    var totalGrant     = 0;

    // Sum all editable forecast inputs across all tier tables
    document.querySelectorAll('.sp-editable-table .sp-table-input[data-col="forecast"]').forEach(function (input) {
      var forecast = parseInt(input.value, 10) || 0;
      totalForecast += forecast;

      // Calculate grant for this row
      var row = input.closest('tr');
      var grantRate = row ? parseInt(row.getAttribute('data-grant-rate'), 10) || 0 : 0;
      totalGrant += forecast * grantRate;
    });

    // Sum all read-only actual/completed spans across all tier tables
    document.querySelectorAll('.sp-editable-table [data-col="actual"]').forEach(function (span) {
      totalActual += parseInt(span.textContent, 10) || 0;
    });
    document.querySelectorAll('.sp-editable-table [data-col="completed"]').forEach(function (span) {
      totalActual += parseInt(span.textContent, 10) || 0;
    });

    var totalRemaining = totalForecast - totalActual;

    totalForecastEl.textContent  = String(totalForecast);
    totalActualEl.textContent    = String(totalActual);
    totalRemainingEl.textContent = String(totalRemaining);

    if (totalGrantEl) {
      totalGrantEl.textContent = totalGrant === 0 ? '0' : formatCurrency(totalGrant);
    }

    if (grandTotalEl) {
      grandTotalEl.textContent = totalGrant === 0 ? '£0' : formatCurrency(totalGrant);
    }
  }

  /**
   * Strip non-numeric characters from forecast inputs to enforce whole numbers.
   * Allows only digits — no decimals, minus signs, or other characters.
   * @param {HTMLInputElement} input
   */
  function enforceWholeNumber(input) {
    var cleaned = input.value.replace(/[^0-9]/g, '');
    if (cleaned !== input.value) {
      input.value = cleaned;
    }
  }

  /**
   * Attach change listeners to all editable inputs in the table.
   * Listens on 'input' for immediate feedback as the user types.
   */
  function init() {
    var tables = document.querySelectorAll('.sp-editable-table');
    if (!tables.length) {
      return;
    }

    var inputs = document.querySelectorAll('.sp-editable-table .sp-table-input');

    inputs.forEach(function (input) {
      var rowId   = input.getAttribute('data-row');
      var colName = input.getAttribute('data-col');

      if (colName === 'forecast' || colName === 'actual') {
        input.addEventListener('input', function () {
          enforceWholeNumber(input);
          recalculateRow(rowId);
          recalculateTotals();
        });

        // Also handle 'change' for assistive technology compatibility
        input.addEventListener('change', function () {
          enforceWholeNumber(input);
          recalculateRow(rowId);
          recalculateTotals();
        });
      }
    });

    // Run initial calculations on page load to reflect any pre-populated data
    var rowIds = [];
    inputs.forEach(function (input) {
      var rowId = input.getAttribute('data-row');
      if (rowIds.indexOf(rowId) === -1) {
        rowIds.push(rowId);
      }
    });

    rowIds.forEach(function (rowId) {
      recalculateRow(rowId);
    });

    recalculateTotals();
  }

  // Initialise after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
