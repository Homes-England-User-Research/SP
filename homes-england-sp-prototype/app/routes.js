//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// =============================================================================
// Global middleware — expose current path to all templates for nav active state
// =============================================================================
router.use(function (req, res, next) {
  res.locals.currentPath = req.path
  next()
})

// =============================================================================
// Site Units Forecast — Strategic Partnerships
// =============================================================================

/**
 * Mock session seed data.
 *
 * Pre-populates the Site home forecasts page.
 * Tier 1 and Tier 2 rows use -t1 / -t2 suffixes.
 * In production this would be fetched from the IMS API.
 */
const mockForecastData = {
  // Tier 1 rows
  'social-rent-t1-forecast':        '',
  'social-rent-t1-actual':          '',
  'affordable-rent-t1-forecast':    '',
  'affordable-rent-t1-actual':      '',
  'specialist-housing-t1-forecast': '',
  'specialist-housing-t1-actual':   '',
  'rent-to-buy-t1-forecast':        '',
  'rent-to-buy-t1-actual':          '',
  'shared-ownership-t1-forecast':   '',
  'shared-ownership-t1-actual':     '',
  'older-persons-so-t1-forecast':   '',
  'older-persons-so-t1-actual':     '',

  // Tier 2 rows
  'social-rent-t2-forecast':        '',
  'social-rent-t2-actual':          '',
  'affordable-rent-t2-forecast':    '',
  'affordable-rent-t2-actual':      '',
  'specialist-housing-t2-forecast': '',
  'specialist-housing-t2-actual':   '',
  'rent-to-buy-t2-forecast':        '',
  'rent-to-buy-t2-actual':          '',
  'shared-ownership-t2-forecast':   '',
  'shared-ownership-t2-actual':     '',
  'older-persons-so-t2-forecast':   '',
  'older-persons-so-t2-actual':     '',

  // Further forecast details
  'community-led-homes': '',
  'mmc-homes':           ''
}

/**
 * GET /site-units-forecast
 *
 * Seed session data with mock values on first visit, then render the page.
 */
router.get('/site-units-forecast', function (req, res) {
  // Seed session data only if not already set (preserves user changes on back navigation)
  Object.keys(mockForecastData).forEach(function (key) {
    if (req.session.data[key] === undefined || req.session.data[key] === '') {
      req.session.data[key] = mockForecastData[key]
    }
  })

  res.render('site-units-forecast')
})

/**
 * POST /site-units-forecast
 *
 * The GOV.UK Prototype Kit automatically saves POST body fields into
 * req.session.data via its built-in middleware. We simply redirect to the
 * confirmation page after any additional processing needed.
 */
router.post('/site-units-forecast', function (req, res) {
  // Session data is automatically persisted by the kit's middleware.
  // Redirect to the confirmation page.
  res.redirect('/site-units-forecast-confirmation')
})

router.get('/site-units-forecast-build-analysis', function (req, res) {
  res.render('site-units-forecast-build-analysis')
})

// =============================================================================
// Component Library — GET routes
// =============================================================================

router.get('/components', function (req, res) {
  res.render('components/index')
})

router.get('/components/accessible-chart', function (req, res) {
  res.render('components/accessible-chart')
})

router.get('/components/date-picker', function (req, res) {
  res.render('components/date-picker')
})

/**
 * /components/editable-table
 * Seeds mock data so the live example table renders with pre-populated values.
 * Reuses the same mockForecastData object defined above.
 */
router.get('/components/editable-table', function (req, res) {
  Object.keys(mockForecastData).forEach(function (key) {
    if (!req.session.data[key]) {
      req.session.data[key] = mockForecastData[key]
    }
  })
  res.render('components/editable-table')
})

router.get('/components/important-notification-banner', function (req, res) {
  res.render('components/important-notification-banner')
})

router.get('/components/multi-column-form', function (req, res) {
  res.render('components/multi-column-form')
})

router.get('/components/role-switcher', function (req, res) {
  res.render('components/role-switcher')
})

router.get('/components/stat-card', function (req, res) {
  res.render('components/stat-card')
})

router.get('/components/year-tabs', function (req, res) {
  res.render('components/year-tabs')
})
