/**
 * site-filters-gds.js
 *
 * Identical to site-filters.js but redirects to /sites-gds instead of /sites.
 * Reads checkbox state from the status and region filter Details components
 * and redirects with query params so the server can filter and re-paginate.
 * Resets to page 1 on any filter change.
 *
 * No-JS fallback: checkboxes are cosmetic — all data is shown unfiltered.
 */
(function () {
  'use strict'

  var filterContainer = document.getElementById('site-filters')
  if (!filterContainer) return

  filterContainer.addEventListener('change', function (event) {
    if (event.target.type !== 'checkbox') return

    var statusCheckboxes = filterContainer.querySelectorAll('input[name="status-filter"]')
    var regionCheckboxes = filterContainer.querySelectorAll('input[name="region-filter"]')

    var checkedStatuses = []
    for (var i = 0; i < statusCheckboxes.length; i++) {
      if (statusCheckboxes[i].checked) {
        checkedStatuses.push(statusCheckboxes[i].value)
      }
    }

    var checkedRegions = []
    for (var j = 0; j < regionCheckboxes.length; j++) {
      if (regionCheckboxes[j].checked) {
        checkedRegions.push(regionCheckboxes[j].value)
      }
    }

    var params = []
    params.push('status=' + checkedStatuses.join(','))
    params.push('region=' + checkedRegions.join(','))

    window.location.href = '/sites-gds?' + params.join('&')
  })
})()
