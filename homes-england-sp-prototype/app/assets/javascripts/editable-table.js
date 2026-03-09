/**
 * editable-table.js
 *
 * Auto-calculates "Homes Remaining" for each row in the SP editable table,
 * and updates the "Total homes forecasted" summary row.
 *
 * Formula: Homes Remaining = Homes Current Forecast - Actual Home Completions
 *
 * If the result is negative, a govuk-tag--red "Deficit" indicator is appended.
 * The containing <span> carries aria-live="polite" so screen readers announce
 * the recalculated value when it changes — satisfying WCAG 2.1 SC 4.1.3.
 *
 * Vanilla JS only — no jQuery or framework dependency.
 */

(function () {
  'use strict';

  /**
   * Recalculate Homes Remaining for a single table row.
   * @param {string} rowId - the data-row-id on the <tr>
   */
  function recalculateRow(rowId) {
    var forecastInput = document.getElementById(rowId + '-forecast');
    var actualSpan    = document.querySelector('[data-col="actual"][data-row="' + rowId + '"]');
    var remainingSpan = document.querySelector('.sp-units-remaining[data-row="' + rowId + '"]');

    if (!forecastInput || !remainingSpan) {
      return;
    }

    var forecast  = parseInt(forecastInput.value, 10) || 0;
    var actual    = actualSpan ? (parseInt(actualSpan.textContent, 10) || 0) : 0;
    var remaining = forecast - actual;

    var displayText = String(remaining);

    if (remaining < 0) {
      displayText +=
        ' <strong class="govuk-tag govuk-tag--red sp-deficit-tag" aria-hidden="true">Deficit</strong>' +
        '<span class="govuk-visually-hidden"> — deficit</span>';
    }

    remainingSpan.innerHTML = displayText;
  }

  /**
   * Recalculate the "Total homes forecasted" summary row by summing all
   * forecast inputs, actual spans, and remaining spans across all tier tables.
   */
  function recalculateTotals() {
    var totalForecastEl  = document.querySelector('.sp-total-forecast');
    var totalActualEl    = document.querySelector('.sp-total-actual');
    var totalRemainingEl = document.querySelector('.sp-total-remaining');

    if (!totalForecastEl) {
      return;
    }

    var totalForecast  = 0;
    var totalActual    = 0;

    // Sum all editable forecast inputs across both tier tables
    document.querySelectorAll('.sp-editable-table .sp-table-input[data-col="forecast"]').forEach(function (input) {
      totalForecast += parseInt(input.value, 10) || 0;
    });

    // Sum all read-only actual spans across both tier tables
    document.querySelectorAll('.sp-editable-table [data-col="actual"]').forEach(function (span) {
      totalActual += parseInt(span.textContent, 10) || 0;
    });

    var totalRemaining = totalForecast - totalActual;

    totalForecastEl.textContent  = String(totalForecast);
    totalActualEl.textContent    = String(totalActual);
    totalRemainingEl.textContent = String(totalRemaining);
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
          recalculateRow(rowId);
          recalculateTotals();
        });

        // Also handle 'change' for assistive technology compatibility
        input.addEventListener('change', function () {
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
