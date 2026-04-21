/**
 * Forecasting table auto-calculation.
 *
 * Handles real-time calculation of:
 *   - Variance per quarter (forecast − actual)
 *   - Yearly totals (sum of Q1–Q4 for each year tab)
 *   - Overall totals (sum of all yearly totals across all year tabs)
 *   - Totals tab (pulls through Q1–Q4 and yearly total per year)
 *
 * Table naming convention:
 *   - 2026-27 tab: data-table="capex", "grant", "starts", "completions"
 *   - Future tabs:  data-table="capex-2027", "grant-2028", etc.
 *
 * The JS groups tables by their base type (capex, grant, starts, completions)
 * by stripping the year suffix.
 *
 * Vanilla JavaScript — no jQuery or framework dependencies.
 */
(function () {
  'use strict'

  // Base table types used across all year tabs
  var BASE_TYPES = ['capex', 'grant', 'starts', 'completions']

  // Year IDs matching the tab panels
  var YEAR_IDS = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035']

  /**
   * Get the table name for a given base type and year.
   * 2026 uses plain names (e.g. "capex"), other years use suffixed names (e.g. "capex-2027").
   */
  function getTableName (baseType, yearId) {
    return yearId === '2026' ? baseType : baseType + '-' + yearId
  }

  /**
   * Format a number for display.
   */
  function formatValue (value, isCurrency) {
    if (isCurrency) {
      if (value < 0) {
        return '-£' + Math.abs(value).toLocaleString('en-GB')
      }
      return '£' + value.toLocaleString('en-GB')
    }
    if (value < 0) {
      return '-' + Math.abs(value).toLocaleString('en-GB')
    }
    return value.toLocaleString('en-GB')
  }

  /**
   * Parse a raw value from an input or data-value attribute.
   */
  function parseValue (raw) {
    if (!raw && raw !== 0) return 0
    var cleaned = String(raw).replace(/[£,\s]/g, '')
    var num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  /**
   * Read the forecast value for a given table and quarter.
   */
  function readForecastValue (container, tableName, quarter) {
    var input = container.querySelector(
      'input[data-table="' + tableName + '"][data-row="forecast"][data-quarter="' + quarter + '"]'
    )
    if (input) return parseValue(input.value)

    var span = container.querySelector(
      'span[data-table="' + tableName + '"][data-row="forecast"][data-quarter="' + quarter + '"]'
    )
    if (span) return parseValue(span.getAttribute('data-value'))

    return 0
  }

  /**
   * Read the actual value for a given table and quarter.
   */
  function readActualValue (container, tableName, quarter) {
    var span = container.querySelector(
      'span[data-table="' + tableName + '"][data-row="actual"][data-quarter="' + quarter + '"]'
    )
    if (span) return parseValue(span.getAttribute('data-value'))
    return 0
  }

  /**
   * Update a calculated span's text content.
   */
  function updateCalculated (container, tableName, calcId, value, isCurrency) {
    var span = container.querySelector(
      'span[data-table="' + tableName + '"][data-calculated="' + calcId + '"]'
    )
    if (span) span.textContent = formatValue(value, isCurrency)
  }

  /**
   * Check if a base type uses currency formatting.
   */
  function isCurrencyType (container, baseType) {
    // Check from any table with this base type
    for (var i = 0; i < YEAR_IDS.length; i++) {
      var tableName = getTableName(baseType, YEAR_IDS[i])
      var table = container.querySelector('[data-table="' + tableName + '"][data-currency]')
      if (table) return table.getAttribute('data-currency') === 'true'
    }
    return false
  }

  /**
   * Recalculate a single table's per-quarter variance and yearly totals.
   * Returns the yearly totals for use in overall calculation.
   */
  function recalculateTable (container, tableName, isCurrency) {
    var quarters = ['q1', 'q2', 'q3', 'q4']
    var yearlyForecast = 0
    var yearlyActual = 0
    var quarterForecasts = []
    var quarterActuals = []

    quarters.forEach(function (q) {
      var forecast = readForecastValue(container, tableName, q)
      var actual = readActualValue(container, tableName, q)
      var variance = forecast - actual

      yearlyForecast += forecast
      yearlyActual += actual
      quarterForecasts.push(forecast)
      quarterActuals.push(actual)

      updateCalculated(container, tableName, 'variance-' + q, variance, isCurrency)
    })

    var yearlyVariance = yearlyForecast - yearlyActual

    updateCalculated(container, tableName, 'yearly-forecast', yearlyForecast, isCurrency)
    updateCalculated(container, tableName, 'yearly-actual', yearlyActual, isCurrency)
    updateCalculated(container, tableName, 'yearly-variance', yearlyVariance, isCurrency)

    return {
      quarterForecasts: quarterForecasts,
      quarterActuals: quarterActuals,
      yearlyForecast: yearlyForecast,
      yearlyActual: yearlyActual,
      yearlyVariance: yearlyVariance
    }
  }

  /**
   * Update a span in the totals tab.
   */
  function updateTotalsSpan (container, baseType, dataAttr, value, isCurrency) {
    var span = container.querySelector(
      'span[data-totals-base="' + baseType + '"][data-totals-calc="' + dataAttr + '"]'
    )
    if (span) span.textContent = formatValue(value, isCurrency)
  }

  /**
   * Update a span for a specific year row in the totals tab.
   */
  function updateTotalsYearSpan (container, baseType, yearId, dataAttr, value, isCurrency) {
    var span = container.querySelector(
      'span[data-totals-base="' + baseType + '"][data-totals-year="' + yearId + '"][data-totals-col="' + dataAttr + '"]'
    )
    if (span) span.textContent = formatValue(value, isCurrency)
  }

  /**
   * Recalculate everything — all tables, overall totals, and the Totals tab.
   */
  function recalculateAll (container) {
    BASE_TYPES.forEach(function (baseType) {
      var isCurrency = isCurrencyType(container, baseType)
      var overallForecast = 0
      var overallActual = 0

      // First pass: calculate each year's totals and accumulate overall
      var yearResults = {}
      YEAR_IDS.forEach(function (yearId) {
        var tableName = getTableName(baseType, yearId)
        var tableEl = container.querySelector('[data-table="' + tableName + '"]')
        if (!tableEl) return

        var result = recalculateTable(container, tableName, isCurrency)
        yearResults[yearId] = result

        overallForecast += result.yearlyForecast
        overallActual += result.yearlyActual

        // Update the Totals tab year row for this base type
        for (var q = 0; q < 4; q++) {
          updateTotalsYearSpan(container, baseType, yearId, 'q' + (q + 1), result.quarterForecasts[q], isCurrency)
        }
        updateTotalsYearSpan(container, baseType, yearId, 'yearly', result.yearlyForecast, isCurrency)
      })

      var overallVariance = overallForecast - overallActual

      // Second pass: set the overall total column on every year's table to the grand total
      YEAR_IDS.forEach(function (yearId) {
        var tableName = getTableName(baseType, yearId)
        updateCalculated(container, tableName, 'overall-forecast', overallForecast, isCurrency)
        updateCalculated(container, tableName, 'overall-actual', overallActual, isCurrency)
        updateCalculated(container, tableName, 'overall-variance', overallVariance, isCurrency)
      })

      // Update the Totals tab overall row
      updateTotalsSpan(container, baseType, 'overall-forecast', overallForecast, isCurrency)
      updateTotalsSpan(container, baseType, 'overall-actual', overallActual, isCurrency)
      updateTotalsSpan(container, baseType, 'overall-variance', overallVariance, isCurrency)
    })
  }

  /**
   * Initialise the forecasting table auto-calculation.
   */
  function init () {
    var containers = document.querySelectorAll('[data-module="forecasting-tables"]')
    if (!containers.length) return

    containers.forEach(function (container) {
      container.addEventListener('input', function (event) {
        if (event.target.matches('.sp-table-input')) {
          // Format with commas as the user types, preserving cursor position
          var input = event.target
          var raw = parseValue(input.value)
          var formatted = raw !== 0 ? raw.toLocaleString('en-GB') : ''

          // Only reformat if it would change (avoids cursor jump when typing)
          var stripped = input.value.replace(/[^0-9.-]/g, '')
          if (stripped !== input.value.replace(/,/g, '')) {
            // User typed a non-numeric char — ignore formatting
          } else if (formatted !== input.value) {
            // Calculate where cursor should end up after formatting
            var caretFromEnd = input.value.length - input.selectionEnd
            input.value = formatted
            var newCaret = Math.max(0, input.value.length - caretFromEnd)
            input.setSelectionRange(newCaret, newCaret)
          }

          recalculateAll(container)
        }
      })

      container.addEventListener('change', function (event) {
        if (event.target.matches('.sp-table-input')) {
          recalculateAll(container)
        }
      })

      // Prevent Enter key from submitting the form when inside an input field
      container.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && event.target.matches('.sp-table-input')) {
          event.preventDefault()
        }
      })

      // Format any pre-populated values on page load
      container.querySelectorAll('.sp-table-input').forEach(function (input) {
        var raw = parseValue(input.value)
        if (raw !== 0) {
          input.value = raw.toLocaleString('en-GB')
        }
      })

      recalculateAll(container)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
