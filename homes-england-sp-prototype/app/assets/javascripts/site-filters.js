/**
 * site-filters.js
 *
 * Client-side filtering for the Sites table. Filters by:
 * - Site name search (text input, case-insensitive substring match)
 * - Progress checkboxes (Site completed / Site activated)
 * - Status checkboxes (Active / Inactive)
 * - Region checkboxes
 *
 * Filters are applied on the "Apply filters" button click.
 * If no checkboxes are checked in a group, all values pass that filter.
 *
 * Data attributes on each <tr>:
 *   data-site-name, data-status, data-region, data-progress
 */
(function () {
  'use strict'

  var filterContainer = document.getElementById('site-filters')
  var applyBtn = document.getElementById('apply-filters-btn')
  var table = document.getElementById('sites-table')
  if (!filterContainer || !table) return

  var searchInput = document.getElementById('site-name-search')
  var rows = table.querySelectorAll('tbody tr')

  function getCheckedValues (name) {
    var checkboxes = filterContainer.querySelectorAll('input[name="' + name + '"]')
    var values = []
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) values.push(checkboxes[i].value)
    }
    return values
  }

  function applyFilters () {
    var searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim()
    var progressValues = getCheckedValues('progress-filter')
    var statusValues = getCheckedValues('status-filter')
    var regionValues = getCheckedValues('region-filter')

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i]
      var siteName = row.getAttribute('data-site-name') || ''
      var status = row.getAttribute('data-status') || ''
      var region = row.getAttribute('data-region') || ''
      var progress = row.getAttribute('data-progress') || ''

      var matchSearch = !searchTerm || siteName.indexOf(searchTerm) !== -1
      var matchProgress = progressValues.length === 0 || progressValues.indexOf(progress) !== -1
      var matchStatus = statusValues.length === 0 || statusValues.indexOf(status) !== -1
      var matchRegion = regionValues.length === 0 || regionValues.indexOf(region) !== -1

      if (matchSearch && matchProgress && matchStatus && matchRegion) {
        row.style.display = ''
      } else {
        row.style.display = 'none'
      }
    }
  }

  // Apply on button click
  if (applyBtn) {
    applyBtn.addEventListener('click', function (e) {
      e.preventDefault()
      applyFilters()
    })
  }

  // Also apply on Enter in search box
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        applyFilters()
      }
    })
  }

  // Clear filters — uncheck all checkboxes, clear search, show all rows
  var clearBtn = document.getElementById('clear-filters-btn')
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault()
      if (searchInput) searchInput.value = ''
      var allCheckboxes = filterContainer.querySelectorAll('input[type="checkbox"]')
      for (var i = 0; i < allCheckboxes.length; i++) {
        allCheckboxes[i].checked = false
      }
      for (var j = 0; j < rows.length; j++) {
        rows[j].style.display = ''
      }
    })
  }
})()
