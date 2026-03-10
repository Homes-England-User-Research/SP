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
// Overview — programme dashboard
// =============================================================================

/**
 * GET /overview
 *
 * Renders the Overview page. dataState controls which data display is shown:
 * 'mvp' (default), 'growing' (first chart tab), 'mature' (all four tabs).
 */
router.get('/overview', function (req, res) {
  res.render('overview/index', {
    dataState: req.session.data['dataState'] || 'mvp'
  })
})

/**
 * POST /overview/set-state
 *
 * Prototype control — switches between mvp / growing / mature data states.
 * Remove before handoff to development.
 */
router.post('/overview/set-state', function (req, res) {
  req.session.data['dataState'] = req.body['dataState']
  res.redirect('/overview')
})

/**
 * GET /overview/build-analysis
 *
 * Documents GDS alignment, custom departures and accessibility predictions
 * for the Overview page. Modelled on the Site home forecasts build analysis.
 */
router.get('/overview/build-analysis', function (req, res) {
  res.render('overview/build-analysis')
})

// =============================================================================
// Sites — landing page + add new site (2-step form)
// =============================================================================

/**
 * Seed data for the sites table.
 * In production this would come from the IMS API.
 */
const seedSites = [
  { siteId: '1234', siteName: 'Belgrave Square',   status: 'Site completed', homes: 19, statusInDeal: 'Active',   localAuthority: 'Havering',    region: 'South East' },
  { siteId: '2222', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Active',         homes: 24, statusInDeal: 'Active',   localAuthority: 'Barnet',      region: 'London' },
  { siteId: '2345', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Active',         homes: 18, statusInDeal: 'Active',   localAuthority: 'Camden',      region: 'London' },
  { siteId: '2456', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Pipeline',       homes: 12, statusInDeal: 'Inactive', localAuthority: 'Leeds',       region: 'Yorkshire' },
  { siteId: '2567', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Pipeline',       homes: 31, statusInDeal: 'Active',   localAuthority: 'Bristol',     region: 'South West' },
  { siteId: '2678', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Not started',    homes: 8,  statusInDeal: 'Inactive', localAuthority: 'Manchester',  region: 'North West' },
  { siteId: '2789', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Not started',    homes: 15, statusInDeal: 'Inactive', localAuthority: 'Sheffield',   region: 'Yorkshire' },
  { siteId: '2890', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Active',         homes: 22, statusInDeal: 'Active',   localAuthority: 'Liverpool',   region: 'North West' },
  { siteId: '2901', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Pipeline',       homes: 9,  statusInDeal: 'Inactive', localAuthority: 'Newcastle',   region: 'North East' },
  { siteId: '3012', siteName: 'Xxx Xxxxxxxxxxx',   status: 'Not started',    homes: 11, statusInDeal: 'Inactive', localAuthority: 'Birmingham',  region: 'Midlands' }
]

/**
 * GET /sites
 *
 * Renders the Sites landing page. If ?success=true is in the URL and a new
 * site has been added via session, it is prepended to the table.
 */
router.get('/sites', function (req, res) {
  var sites = seedSites.slice()

  // Prepend newly added site if the 2-step form was completed
  if (req.session.data['newSiteAdded'] && req.session.data['newSite']) {
    sites.unshift({
      siteId: req.session.data['newSite'].siteId || '—',
      siteName: req.session.data['newSite'].siteName || 'New site',
      status: 'Not started',
      homes: 0,
      statusInDeal: 'Inactive',
      localAuthority: req.session.data['newSite'].localAuthority || '—',
      region: req.session.data['newSite'].region || '—'
    })
  }

  res.render('sites/index', {
    success: req.query.success === 'true',
    sites: sites
  })
})

/**
 * GET /sites/add/step-1
 */
router.get('/sites/add/step-1', function (req, res) {
  res.render('sites/add/step-1')
})

/**
 * POST /sites/add/step-1
 *
 * Saves step 1 fields to session and redirects to step 2.
 */
router.post('/sites/add/step-1', function (req, res) {
  req.session.data['newSite'] = {
    ...req.session.data['newSite'],
    siteId: req.body['site-id'],
    siteName: req.body['site-name'],
    typeOfSite: req.body['type-of-site'],
    ruralArea: req.body['rural-area'],
    localAuthority: req.body['local-authority'],
    operatingArea: req.body['operating-area'],
    region: req.body['region'],
    processingRoute: req.body['processing-route'],
    regenerationSite: req.body['regeneration-site'],
    postcode: req.body['postcode'],
    xCoordinate: req.body['x-coordinate'],
    yCoordinate: req.body['y-coordinate'],
    typeOfContractor: req.body['type-of-contractor'],
    contractor: req.body['contractor']
  }
  res.redirect('/sites/add/step-2')
})

/**
 * GET /sites/add/step-2
 */
router.get('/sites/add/step-2', function (req, res) {
  res.render('sites/add/step-2')
})

/**
 * POST /sites/add/step-2
 *
 * Saves step 2 fields, marks the new site as complete, and redirects
 * to the Sites page with a success banner.
 */
router.post('/sites/add/step-2', function (req, res) {
  req.session.data['newSite'] = {
    ...req.session.data['newSite'],
    ownershipStatus: req.body['ownership-status'],
    planningStatus: req.body['planning-status'],
    buildingContractStatus: req.body['building-contract-status'],
    startOnSiteStatus: req.body['start-on-site-status'],
    forecastCompletionDate: req.body['forecast-completion-date']
  }
  req.session.data['newSiteAdded'] = true
  res.redirect('/sites?success=true')
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
