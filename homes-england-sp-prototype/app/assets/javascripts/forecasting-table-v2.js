/**
 * Forecasting table auto-calculation — Option 2.
 *
 * Option 2 groups data by type (Forecasts, Variances, Actuals) rather than
 * by category. Uses data-v2-* attributes to avoid conflicts with Option 1.
 *
 * Vanilla JavaScript — no jQuery or framework dependencies.
 */
(function () {
  'use strict'

  var BASE_TYPES = ['capex', 'grant', 'starts', 'completions']
  var YEAR_IDS = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035']

  function getTableName (baseType, yearId) {
    return yearId === '2026' ? baseType : baseType + '-' + yearId
  }

  function formatValue (value, isCurrency) {
    if (isCurrency) {
      return (value < 0 ? '-£' : '£') + Math.abs(value).toLocaleString('en-GB')
    }
    return (value < 0 ? '-' : '') + Math.abs(value).toLocaleString('en-GB')
  }

  function parseValue (raw) {
    if (!raw && raw !== 0) return 0
    var cleaned = String(raw).replace(/[£,\s]/g, '')
    var num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  function readValue (container, tableName, row, quarter) {
    var input = container.querySelector(
      'input[data-v2-table="' + tableName + '"][data-v2-row="' + row + '"][data-v2-quarter="' + quarter + '"]'
    )
    if (input) return parseValue(input.value)

    var span = container.querySelector(
      'span[data-v2-table="' + tableName + '"][data-v2-row="' + row + '"][data-v2-quarter="' + quarter + '"]'
    )
    if (span) return parseValue(span.getAttribute('data-value'))
    return 0
  }

  function isCurrencyType (container, tableName) {
    var el = container.querySelector('[data-v2-table="' + tableName + '"][data-currency]')
    return el ? el.getAttribute('data-currency') === 'true' : false
  }

  function updateCalc (container, tableName, calcId, value, isCurrency) {
    var span = container.querySelector(
      'span[data-v2-table="' + tableName + '"][data-v2-calc="' + calcId + '"]'
    )
    if (span) span.textContent = formatValue(value, isCurrency)
  }

  function updateTotalsSpan (container, baseType, attr, value, isCurrency) {
    var span = container.querySelector(
      'span[data-v2-totals-base="' + baseType + '"][data-v2-totals-calc="' + attr + '"]'
    )
    if (span) span.textContent = formatValue(value, isCurrency)
  }

  function updateTotalsYearSpan (container, baseType, yearId, col, value, isCurrency) {
    var span = container.querySelector(
      'span[data-v2-totals-base="' + baseType + '"][data-v2-totals-year="' + yearId + '"][data-v2-totals-col="' + col + '"]'
    )
    if (span) span.textContent = formatValue(value, isCurrency)
  }

  function recalculateAll (container) {
    BASE_TYPES.forEach(function (baseType) {
      var overallForecast = 0
      var overallActual = 0

      YEAR_IDS.forEach(function (yearId) {
        var tableName = getTableName(baseType, yearId)
        var isCurrency = isCurrencyType(container, tableName)

        var yearlyForecast = 0
        var yearlyActual = 0
        var quarterForecasts = []

        for (var q = 1; q <= 4; q++) {
          var forecast = readValue(container, tableName, 'forecast', 'q' + q)
          var actual = readValue(container, tableName, 'actual', 'q' + q)
          var variance = forecast - actual

          yearlyForecast += forecast
          yearlyActual += actual
          quarterForecasts.push(forecast)

          updateCalc(container, tableName, 'variance-q' + q, variance, isCurrency)
        }

        var yearlyVariance = yearlyForecast - yearlyActual

        updateCalc(container, tableName, 'yearly-forecast', yearlyForecast, isCurrency)
        updateCalc(container, tableName, 'yearly-actual', yearlyActual, isCurrency)
        updateCalc(container, tableName, 'yearly-variance', yearlyVariance, isCurrency)

        overallForecast += yearlyForecast
        overallActual += yearlyActual

        // Update totals tab
        for (var qi = 0; qi < 4; qi++) {
          updateTotalsYearSpan(container, baseType, yearId, 'q' + (qi + 1), quarterForecasts[qi], isCurrency)
        }
        updateTotalsYearSpan(container, baseType, yearId, 'yearly', yearlyForecast, isCurrency)
      })

      // Set overall totals on every year's table
      var overallVariance = overallForecast - overallActual
      YEAR_IDS.forEach(function (yearId) {
        var tableName = getTableName(baseType, yearId)
        var isCurrency = isCurrencyType(container, tableName)
        updateCalc(container, tableName, 'overall-forecast', overallForecast, isCurrency)
        updateCalc(container, tableName, 'overall-actual', overallActual, isCurrency)
        updateCalc(container, tableName, 'overall-variance', overallVariance, isCurrency)
      })

      // Totals tab overall row
      var isCurr = isCurrencyType(container, baseType)
      updateTotalsSpan(container, baseType, 'overall-forecast', overallForecast, isCurr)
    })
  }

  function init () {
    var containers = document.querySelectorAll('[data-module="forecasting-tables-v2"]')
    if (!containers.length) return

    containers.forEach(function (container) {
      container.addEventListener('input', function (event) {
        if (event.target.matches('.sp-table-input')) {
          // Live comma formatting
          var input = event.target
          var raw = parseValue(input.value)
          var formatted = raw !== 0 ? raw.toLocaleString('en-GB') : ''
          var stripped = input.value.replace(/[^0-9.-]/g, '')
          if (stripped === input.value.replace(/,/g, '') && formatted !== input.value) {
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

      container.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && event.target.matches('.sp-table-input')) {
          event.preventDefault()
        }
      })

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
