/**
 * sortable-table.js — MOJ Design System sortable table pattern.
 *
 * Follows the Ministry of Justice Design System implementation:
 * - Wraps sortable <th> text in <button> elements
 * - Uses inline SVG arrows (up, down, up-down) matching MOJ icons
 * - Blue link-coloured headers with GDS focus ring
 * - aria-sort states: ascending, descending, none
 * - data-sort-type="text" or "numeric" on <th>
 *
 * Progressive enhancement: without JS, table displays in default order
 * with plain text headers (no buttons).
 */
(function () {
  'use strict'

  // ─── SVG arrow icons (from MOJ Frontend) ─────────────────────────────
  var upArrow = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5625 15.5L11 6.63125L15.4375 15.5H6.5625Z" fill="currentColor"/></svg>'

  var downArrow = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4375 7L11 15.8687L6.5625 7L15.4375 7Z" fill="currentColor"/></svg>'

  var upDownArrow = '<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.1875 9.5L10.9609 3.95703L13.7344 9.5H8.1875Z" fill="currentColor"/><path d="M13.7344 12.0781L10.9609 17.6211L8.1875 12.0781H13.7344Z" fill="currentColor"/></svg>'

  var tables = document.querySelectorAll('.js-sortable-table')

  tables.forEach(function (table) {
    var headers = table.querySelectorAll('thead th[aria-sort]')
    var tbody = table.querySelector('tbody')

    // ─── Create buttons inside each sortable header ──────────────────
    headers.forEach(function (header, colIndex) {
      var text = header.textContent.trim()
      var sortState = header.getAttribute('aria-sort')

      // Create button to wrap header text
      var button = document.createElement('button')
      button.setAttribute('data-index', colIndex)
      button.textContent = text

      // Add the appropriate arrow SVG
      appendArrow(button, sortState)

      // Clear header and insert button
      header.textContent = ''
      header.appendChild(button)

      // Click handler
      button.addEventListener('click', function () {
        var currentSort = header.getAttribute('aria-sort')
        var newSort = currentSort === 'ascending' ? 'descending' : 'ascending'
        var sortType = header.getAttribute('data-sort-type') || 'text'

        // Reset all headers to none
        headers.forEach(function (h) {
          h.setAttribute('aria-sort', 'none')
          var btn = h.querySelector('button')
          if (btn) updateArrow(btn, 'none')
        })

        // Set this header
        header.setAttribute('aria-sort', newSort)
        updateArrow(button, newSort)

        // Sort rows
        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'))
        rows.sort(function (a, b) {
          var cellA = a.querySelectorAll('td')[colIndex]
          var cellB = b.querySelectorAll('td')[colIndex]
          if (!cellA || !cellB) return 0

          var valA = cellA.getAttribute('data-sort-value') || cellA.textContent.trim()
          var valB = cellB.getAttribute('data-sort-value') || cellB.textContent.trim()

          if (sortType === 'numeric') {
            valA = parseFloat(String(valA).replace(/[^0-9.-]/g, '')) || 0
            valB = parseFloat(String(valB).replace(/[^0-9.-]/g, '')) || 0
          } else {
            valA = String(valA).toLowerCase()
            valB = String(valB).toLowerCase()
          }

          if (valA < valB) return newSort === 'ascending' ? -1 : 1
          if (valA > valB) return newSort === 'ascending' ? 1 : -1
          return 0
        })

        rows.forEach(function (row) {
          tbody.appendChild(row)
        })
      })
    })
  })

  function appendArrow (button, sortState) {
    var svg = getArrowSvg(sortState)
    button.insertAdjacentHTML('beforeend', ' ' + svg)
  }

  function updateArrow (button, sortState) {
    // Remove existing SVG
    var existing = button.querySelector('svg')
    if (existing) existing.remove()
    button.insertAdjacentHTML('beforeend', ' ' + getArrowSvg(sortState))
  }

  function getArrowSvg (sortState) {
    if (sortState === 'ascending') return upArrow
    if (sortState === 'descending') return downArrow
    return upDownArrow
  }
})()
