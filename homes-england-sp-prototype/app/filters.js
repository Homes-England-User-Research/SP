//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// Format a number with commas (e.g. 22313 → "22,313")
addFilter('toLocaleString', function (value) {
  if (value === null || value === undefined) return ''
  return Number(value).toLocaleString('en-GB')
})

