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
// Prototype start pages — A/B testing entry points
// =============================================================================

/**
 * GET /prototype-1
 *
 * Start page for Prototype 1. Service overview/landing page mimicking the
 * real SP allocation service. Forecasting links point to Option 1 layout.
 */
router.get('/prototype-1', function (req, res) {
  req.session.data['activePrototype'] = '1'
  res.render('prototype-1/start')
})

/**
 * GET /prototype-2
 *
 * Start page for Prototype 2. Same service overview but Forecasting links
 * point to Option 2 layout (submitted-forecasts-v2).
 */
router.get('/prototype-2', function (req, res) {
  req.session.data['activePrototype'] = '2'
  res.render('prototype-2/start')
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
// Overview (GDS) — pure GDS components version of the overview page
// =============================================================================

/**
 * GET /overview-gds
 *
 * Renders the GDS-only Overview page. Same data states as /overview but
 * every element uses standard GDS components only — no custom components.
 */
router.get('/overview-gds', function (req, res) {
  res.render('overview-gds/index', {
    dataState: req.session.data['dataStateGds'] || 'mvp'
  })
})

/**
 * POST /overview-gds/set-state
 *
 * Prototype control — switches between mvp / mature data states.
 * Uses a separate session key (dataStateGds) so it does not interfere
 * with the standard overview page state.
 */
router.post('/overview-gds/set-state', function (req, res) {
  req.session.data['dataStateGds'] = req.body['dataState']
  res.redirect('/overview-gds')
})

/**
 * GET /overview-gds/build-analysis
 *
 * Build analysis page for the GDS-only Overview — documents all GDS
 * components used and confirms zero custom departures.
 */
router.get('/overview-gds/build-analysis', function (req, res) {
  res.render('overview-gds/build-analysis')
})

// =============================================================================
// Sites — landing page + add new site (2-step form)
// =============================================================================

/**
 * Seed data for the sites table — 44 sites to match stat cards.
 * In production this would come from the IMS API.
 */
const seedSites = [
  { siteId: '1001', siteName: 'Belgrave Square',       status: 'Site completed', homes: 120,  statusInDeal: 'Active',   localAuthority: 'Havering',          region: 'South East' },
  { siteId: '1002', siteName: 'Riverside Gardens',     status: 'Site completed', homes: 85,   statusInDeal: 'Active',   localAuthority: 'Greenwich',         region: 'London' },
  { siteId: '1003', siteName: 'Meadow Lane',           status: 'Site completed', homes: 200,  statusInDeal: 'Active',   localAuthority: 'Nottingham',        region: 'East Midlands' },
  { siteId: '1004', siteName: 'Victoria Dock',         status: 'Site completed', homes: 340,  statusInDeal: 'Active',   localAuthority: 'Newham',            region: 'London' },
  { siteId: '1005', siteName: 'Kingsway Park',         status: 'Site completed', homes: 150,  statusInDeal: 'Active',   localAuthority: 'Derby',             region: 'East Midlands' },
  { siteId: '1010', siteName: 'Westfield Rise',        status: 'Active',         homes: 450,  statusInDeal: 'Active',   localAuthority: 'Barnet',            region: 'London' },
  { siteId: '1011', siteName: 'Oakwood Place',         status: 'Active',         homes: 310,  statusInDeal: 'Active',   localAuthority: 'Camden',            region: 'London' },
  { siteId: '1012', siteName: 'Harbour View',          status: 'Active',         homes: 275,  statusInDeal: 'Active',   localAuthority: 'Bristol',           region: 'South West' },
  { siteId: '1013', siteName: 'Station Quarter',       status: 'Active',         homes: 520,  statusInDeal: 'Active',   localAuthority: 'Leeds',             region: 'Yorkshire and the Humber' },
  { siteId: '1014', siteName: 'Canal Basin',           status: 'Active',         homes: 180,  statusInDeal: 'Active',   localAuthority: 'Birmingham',        region: 'West Midlands' },
  { siteId: '1015', siteName: 'Greenhill Terrace',     status: 'Active',         homes: 95,   statusInDeal: 'Active',   localAuthority: 'Sheffield',         region: 'Yorkshire and the Humber' },
  { siteId: '1016', siteName: 'Millbrook Estate',      status: 'Active',         homes: 400,  statusInDeal: 'Active',   localAuthority: 'Southampton',       region: 'South East' },
  { siteId: '1017', siteName: 'Northgate Crescent',    status: 'Active',         homes: 165,  statusInDeal: 'Active',   localAuthority: 'Newcastle',         region: 'North East' },
  { siteId: '1018', siteName: 'Ashton Fields',         status: 'Active',         homes: 230,  statusInDeal: 'Active',   localAuthority: 'Manchester',        region: 'North West' },
  { siteId: '1019', siteName: 'Elm Park',              status: 'Active',         homes: 350,  statusInDeal: 'Active',   localAuthority: 'Liverpool',         region: 'North West' },
  { siteId: '1020', siteName: 'Priory Court',          status: 'Active',         homes: 140,  statusInDeal: 'Active',   localAuthority: 'Norwich',           region: 'East of England' },
  { siteId: '1021', siteName: 'Birchwood Heights',     status: 'Active',         homes: 290,  statusInDeal: 'Active',   localAuthority: 'Warrington',        region: 'North West' },
  { siteId: '1022', siteName: 'Foxglove Meadows',      status: 'Active',         homes: 185,  statusInDeal: 'Active',   localAuthority: 'Exeter',            region: 'South West' },
  { siteId: '1023', siteName: 'Sycamore Close',        status: 'Active',         homes: 110,  statusInDeal: 'Active',   localAuthority: 'Ipswich',           region: 'East of England' },
  { siteId: '1024', siteName: 'Thornbury Gate',        status: 'Active',         homes: 475,  statusInDeal: 'Active',   localAuthority: 'Bradford',          region: 'Yorkshire and the Humber' },
  { siteId: '1025', siteName: 'Lakeside Avenue',       status: 'Active',         homes: 205,  statusInDeal: 'Active',   localAuthority: 'Peterborough',      region: 'East of England' },
  { siteId: '1026', siteName: 'Windmill Lane',         status: 'Active',         homes: 330,  statusInDeal: 'Active',   localAuthority: 'Coventry',          region: 'West Midlands' },
  { siteId: '1027', siteName: 'Hawthorn Drive',        status: 'Active',         homes: 160,  statusInDeal: 'Active',   localAuthority: 'Sunderland',        region: 'North East' },
  { siteId: '1030', siteName: 'Orchard Way',           status: 'Pipeline',       homes: 600,  statusInDeal: 'Inactive', localAuthority: 'Lewisham',          region: 'London' },
  { siteId: '1031', siteName: 'Chapel Street',         status: 'Pipeline',       homes: 250,  statusInDeal: 'Active',   localAuthority: 'Bolton',            region: 'North West' },
  { siteId: '1032', siteName: 'Quarry Hill',           status: 'Pipeline',       homes: 180,  statusInDeal: 'Inactive', localAuthority: 'Wakefield',         region: 'Yorkshire and the Humber' },
  { siteId: '1033', siteName: 'Prospect Row',          status: 'Pipeline',       homes: 420,  statusInDeal: 'Active',   localAuthority: 'Plymouth',          region: 'South West' },
  { siteId: '1034', siteName: 'High Cross',            status: 'Pipeline',       homes: 310,  statusInDeal: 'Inactive', localAuthority: 'Leicester',         region: 'East Midlands' },
  { siteId: '1035', siteName: 'Copperfield Park',      status: 'Pipeline',       homes: 145,  statusInDeal: 'Active',   localAuthority: 'Gateshead',         region: 'North East' },
  { siteId: '1036', siteName: 'Sunbury Wharf',         status: 'Pipeline',       homes: 530,  statusInDeal: 'Inactive', localAuthority: 'Tower Hamlets',     region: 'London' },
  { siteId: '1037', siteName: 'Beechwood Grove',       status: 'Pipeline',       homes: 270,  statusInDeal: 'Active',   localAuthority: 'Wolverhampton',     region: 'West Midlands' },
  { siteId: '1038', siteName: 'Ferndale Road',         status: 'Pipeline',       homes: 195,  statusInDeal: 'Inactive', localAuthority: 'Colchester',        region: 'East of England' },
  { siteId: '1039', siteName: 'Crestwood Chase',       status: 'Pipeline',       homes: 380,  statusInDeal: 'Active',   localAuthority: 'Salford',           region: 'North West' },
  { siteId: '1040', siteName: 'Kingfisher Reach',      status: 'Pipeline',       homes: 225,  statusInDeal: 'Inactive', localAuthority: 'Reading',           region: 'South East' },
  { siteId: '1041', siteName: 'Pennine View',          status: 'Pipeline',       homes: 170,  statusInDeal: 'Active',   localAuthority: 'Barnsley',          region: 'Yorkshire and the Humber' },
  { siteId: '1050', siteName: 'Linden Walk',           status: 'Not started',    homes: 500,  statusInDeal: 'Inactive', localAuthority: 'Stoke-on-Trent',    region: 'West Midlands' },
  { siteId: '1051', siteName: 'Chestnut Grove',        status: 'Not started',    homes: 280,  statusInDeal: 'Inactive', localAuthority: 'Doncaster',         region: 'Yorkshire and the Humber' },
  { siteId: '1052', siteName: 'Ashfield Gardens',      status: 'Not started',    homes: 340,  statusInDeal: 'Inactive', localAuthority: 'Northampton',       region: 'East Midlands' },
  { siteId: '1053', siteName: 'Rosemary Lane',         status: 'Not started',    homes: 190,  statusInDeal: 'Inactive', localAuthority: 'Middlesbrough',     region: 'North East' },
  { siteId: '1054', siteName: 'Brindley Quay',         status: 'Not started',    homes: 650,  statusInDeal: 'Inactive', localAuthority: 'Hackney',           region: 'London' },
  { siteId: '1055', siteName: 'Fielding Crescent',     status: 'Not started',    homes: 155,  statusInDeal: 'Inactive', localAuthority: 'Chelmsford',        region: 'East of England' },
  { siteId: '1056', siteName: 'Wren Close',            status: 'Not started',    homes: 410,  statusInDeal: 'Inactive', localAuthority: 'Wigan',             region: 'North West' },
  { siteId: '1057', siteName: 'Ivy Court',             status: 'Not started',    homes: 220,  statusInDeal: 'Inactive', localAuthority: 'Bath',              region: 'South West' },
  { siteId: '1058', siteName: 'Bluebell Mews',         status: 'Not started',    homes: 365,  statusInDeal: 'Inactive', localAuthority: 'Brighton and Hove', region: 'South East' }
]

/**
 * Map from query param values to display names for status filter.
 */
const statusParamMap = {
  'not-started': 'Not started',
  'pipeline': 'Pipeline',
  'active': 'Active',
  'site-completed': 'Site completed'
}

/**
 * Map from query param values to display names for region filter.
 */
const regionParamMap = {
  'east-midlands': 'East Midlands',
  'east-of-england': 'East of England',
  'london': 'London',
  'north-east': 'North East',
  'north-west': 'North West',
  'south-east': 'South East',
  'south-west': 'South West',
  'west-midlands': 'West Midlands',
  'yorkshire': 'Yorkshire and the Humber'
}

var SITES_PER_PAGE = 15

/**
 * GET /sites
 *
 * Server-side filtering and pagination.
 * Query params:
 *   status  — comma-separated status slugs (default: all)
 *   region  — comma-separated region slugs (default: all)
 *   page    — 1-based page number (default: 1)
 *   success — show notification banner if 'true'
 */
router.get('/sites', function (req, res) {
  // --- Parse filter params (default = all checked) ---
  var activeStatusSlugs = req.query.status
    ? req.query.status.split(',')
    : Object.keys(statusParamMap)

  var activeRegionSlugs = req.query.region
    ? req.query.region.split(',')
    : Object.keys(regionParamMap)

  var activeStatuses = activeStatusSlugs.map(function (s) { return statusParamMap[s] }).filter(Boolean)
  var activeRegions = activeRegionSlugs.map(function (s) { return regionParamMap[s] }).filter(Boolean)

  // --- Prepend new site from session if one was just added ---
  var allSites = seedSites.slice()
  if (req.session.data['newSiteAdded'] && req.session.data['newSite']) {
    var ns = req.session.data['newSite']
    allSites.unshift({
      siteId: String(2000 + Math.floor(Math.random() * 1000)),
      siteName: ns.siteName || 'New site',
      status: 'Not started',
      homes: 0,
      statusInDeal: 'Active',
      localAuthority: ns.localAuthority || '',
      region: ns.region || ''
    })
  }

  // --- Filter ---
  var filtered = allSites.filter(function (site) {
    return activeStatuses.indexOf(site.status) !== -1
      && activeRegions.indexOf(site.region) !== -1
  })

  // --- Compute stats from filtered set ---
  var totalSites = filtered.length
  var totalHomes = filtered.reduce(function (sum, s) { return sum + s.homes }, 0)
  var completedSites = filtered.filter(function (s) { return s.status === 'Site completed' }).length

  // --- Paginate ---
  var page = parseInt(req.query.page, 10) || 1
  var totalPages = Math.max(1, Math.ceil(filtered.length / SITES_PER_PAGE))
  if (page > totalPages) page = totalPages
  if (page < 1) page = 1

  var start = (page - 1) * SITES_PER_PAGE
  var pageSites = filtered.slice(start, start + SITES_PER_PAGE)

  // --- Build filter query string (without page) for pagination links ---
  var filterParams = ''
  if (req.query.status) filterParams += '&status=' + req.query.status
  if (req.query.region) filterParams += '&region=' + req.query.region

  // --- Build pagination items for govukPagination ---
  var paginationItems = []
  for (var i = 1; i <= totalPages; i++) {
    paginationItems.push({
      number: i,
      current: i === page,
      href: '/sites?page=' + i + filterParams
    })
  }

  var pagination = {}
  if (totalPages > 1) {
    pagination.items = paginationItems
    if (page > 1) {
      pagination.previous = {
        href: '/sites?page=' + (page - 1) + filterParams
      }
    }
    if (page < totalPages) {
      pagination.next = {
        href: '/sites?page=' + (page + 1) + filterParams
      }
    }
  }

  res.render('sites/index', {
    success: req.query.success === 'true',
    sites: pageSites,
    pagination: pagination,
    totalSites: totalSites,
    totalHomes: totalHomes,
    completedSites: completedSites,
    activeStatusSlugs: activeStatusSlugs,
    activeRegionSlugs: activeRegionSlugs,
    activeProgressSlugs: req.query.progress ? req.query.progress.split(',') : [],
    activeStatusInDealSlugs: req.query.statusInDeal ? req.query.statusInDeal.split(',') : []
  })
})

/**
 * GET /sites/add/step-1
 *
 * Clears all add-site session fields so each new site starts with a
 * blank form. Without this, navigating back to step 1 after submitting
 * a site would show the previous site's data in every field.
 *
 * Only clears when arriving fresh (no ?back param). Back navigation
 * from step 2 passes ?back=true to preserve in-progress data.
 */
router.get('/sites/add/step-1', function (req, res) {
  if (!req.query.back) {
    var addSiteFields = [
      'site-name', 'site-type', 'local-authority', 'region', 'he-region',
      'procurement-route', 'rural-settlement', 'rural-exception-site',
      'address-line-1', 'address-line-2', 'town-or-city', 'county',
      'postcode', 'x-coordinate', 'y-coordinate',
      'strategic-site', 'strategic-site-name', 'green-belt',
      'regeneration-site', 'regeneration-plans', 'regeneration-benefits',
      'regeneration-funding', 'historical-grant', 'historical-grant-amount',
      'historical-grant-scheme-ids', 'historical-grant-notified',
      'occupancy-status', 'vacancy-date-day', 'vacancy-date-month',
      'vacancy-date-year', 'decanting-steps',
      'mmc-used', 'mmc-categories', 'mmc-cat1-subs', 'mmc-cat2-subs',
      'land-acquisition-status', 'land-acquisition-date-day',
      'land-acquisition-date-month', 'land-acquisition-date-year',
      'planning-status', 'planning-approval-date-day',
      'planning-approval-date-month', 'planning-approval-date-year',
      'planning-reference', 'grant-funding-all-homes',
      'works-contract-status', 'building-contract-date-day',
      'building-contract-date-month', 'building-contract-date-year',
      'contractor-type', 'contractor-name',
      'start-on-site-status', 'start-on-site-date-day',
      'start-on-site-date-month', 'start-on-site-date-year',
      'practical-completion-date-day', 'practical-completion-date-month',
      'practical-completion-date-year'
    ]
    addSiteFields.forEach(function (key) {
      delete req.session.data[key]
    })
  }
  res.render('sites/add/step-1')
})

/**
 * POST /sites/add/step-1
 *
 * Prototype Kit auto-stores all POSTed fields in session.data,
 * so we just redirect to step 2.
 */
router.post('/sites/add/step-1', function (req, res) {
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
 */
router.post('/sites/add/step-2', function (req, res) {
  res.redirect('/sites/add/step-3')
})

/**
 * GET /sites/add/step-3
 */
router.get('/sites/add/step-3', function (req, res) {
  res.render('sites/add/step-3')
})

/**
 * POST /sites/add/step-3
 */
router.post('/sites/add/step-3', function (req, res) {
  res.redirect('/sites/add/step-4')
})

/**
 * GET /sites/add/step-4
 */
router.get('/sites/add/step-4', function (req, res) {
  res.render('sites/add/step-4')
})

/**
 * POST /sites/add/step-4
 */
router.post('/sites/add/step-4', function (req, res) {
  res.redirect('/sites/add/step-5')
})

/**
 * GET /sites/add/step-5
 */
router.get('/sites/add/step-5', function (req, res) {
  res.render('sites/add/step-5')
})

/**
 * POST /sites/add/step-5
 *
 * Final step — saves the new site to the session newSite object
 * and redirects to the Sites page with a success banner.
 */
router.post('/sites/add/step-5', function (req, res) {
  req.session.data['newSite'] = {
    siteName: req.session.data['site-name'],
    siteType: req.session.data['site-type'],
    localAuthority: req.session.data['local-authority'],
    region: req.session.data['region'],
    postcode: req.session.data['postcode'],
    procurementRoute: req.session.data['procurement-route'],
    planningStatus: req.session.data['planning-status'],
    contractorName: req.session.data['contractor-name'],
    mmcUsed: req.session.data['mmc-used']
  }
  req.session.data['newSiteAdded'] = true
  res.redirect('/sites?success=true')
})

/**
 * GET /sites/build-analysis
 *
 * Documents GDS alignment, custom departures and accessibility predictions
 * for the Sites landing page and Add new site flow.
 */
router.get('/sites/build-analysis', function (req, res) {
  res.render('sites/build-analysis')
})

/**
 * GET /sites/summary-build-analysis
 *
 * Build analysis page for site summary options — documents GDS alignment,
 * custom departures, option comparison and accessibility predictions.
 * Must be defined BEFORE /sites/:siteId to avoid wildcard matching.
 */
router.get('/sites/summary-build-analysis', function (req, res) {
  res.render('sites/summary-build-analysis')
})

// =============================================================================
// Allocate home types — GDS-only prototype
// =============================================================================

/**
 * Mock home type data — represents templates created at programme level.
 * In production these would come from a home type manager/API.
 * Each home type has a unique ID, a template description, building type,
 * bedrooms, persons capacity and a valid/draft status.
 */
var allHomeTypes = [
  { id: 'HT-001', description: '2B4P House - Social Rent',           status: 'Valid', buildingType: 'House',       bedrooms: 2, persons: 4 },
  { id: 'HT-002', description: '3B5P House - Social Rent',           status: 'Valid', buildingType: 'House',       bedrooms: 3, persons: 5 },
  { id: 'HT-003', description: '4B5P House - Affordable Rent',       status: 'Valid', buildingType: 'House',       bedrooms: 4, persons: 5 },
  { id: 'HT-004', description: '4B6P Maisonette - Shared Ownership', status: 'Valid', buildingType: 'Maisonette',  bedrooms: 4, persons: 6 },
  { id: 'HT-005', description: '2B4P House - Shared Ownership',      status: 'Valid', buildingType: 'House',       bedrooms: 2, persons: 4 },
  { id: 'HT-006', description: '3B5P House - Affordable Rent',       status: 'Valid', buildingType: 'House',       bedrooms: 3, persons: 5 },
  { id: 'HT-007', description: '4B5P House - Social Rent',           status: 'Valid', buildingType: 'House',       bedrooms: 4, persons: 5 },
  { id: 'HT-008', description: '4B6P Maisonette - Affordable Rent',  status: 'Valid', buildingType: 'Maisonette',  bedrooms: 4, persons: 6 },
  { id: 'HT-009', description: '2B4P Flat - Social Rent',            status: 'Valid', buildingType: 'Flat',        bedrooms: 2, persons: 4 },
  { id: 'HT-010', description: '3B5P House - Shared Ownership',      status: 'Valid', buildingType: 'House',       bedrooms: 3, persons: 5 },
  { id: 'HT-011', description: '1B2P Flat - Social Rent',            status: 'Valid', buildingType: 'Flat',        bedrooms: 1, persons: 2 },
  { id: 'HT-012', description: '4B5P House - Rent to Buy',           status: 'Valid', buildingType: 'House',       bedrooms: 4, persons: 5 },
  { id: 'HT-013', description: '2B3P Bungalow - Shared Ownership',   status: 'Valid', buildingType: 'Bungalow',    bedrooms: 2, persons: 3 },
  { id: 'HT-014', description: '3B5P House - Rent to Buy',           status: 'Valid', buildingType: 'House',       bedrooms: 3, persons: 5 },
  { id: 'HT-015', description: '2B4P Flat - Affordable Rent',        status: 'Valid', buildingType: 'Flat',        bedrooms: 2, persons: 4 }
]

/**
 * Default home types allocated to Bracken Avenue (site 1234) on first visit.
 * Stored in session as an array of home type IDs.
 */
var defaultAllocatedIds = ['HT-001', 'HT-002', 'HT-003', 'HT-004']

/**
 * Helper — initialise session allocation if not yet set.
 */
function ensureAllocationSession(req) {
  if (!req.session.data['allocatedHomeTypes']) {
    req.session.data['allocatedHomeTypes'] = defaultAllocatedIds.slice()
  }
  return req.session.data['allocatedHomeTypes']
}

/**
 * GET /sites/allocate-home-types
 *
 * Main page — shows home types currently allocated to this site.
 * Uses the GDS "Add to a list" pattern: summary list + "Add" button.
 */
router.get('/sites/allocate-home-types', function (req, res) {
  var allocatedIds = ensureAllocationSession(req)
  var allocated = allHomeTypes.filter(function (ht) {
    return allocatedIds.indexOf(ht.id) !== -1
  })

  res.render('sites/allocate-home-types/index', {
    allocatedHomeTypes: allocated,
    success: req.query.success || null,
    removed: req.query.removed === 'true'
  })
})

/**
 * GET /sites/allocate-home-types/add
 *
 * Checkbox page — lists all home types NOT currently allocated.
 * Standard GDS checkboxes pattern. User selects which to add.
 */
router.get('/sites/allocate-home-types/add', function (req, res) {
  var allocatedIds = ensureAllocationSession(req)
  var available = allHomeTypes.filter(function (ht) {
    return allocatedIds.indexOf(ht.id) === -1
  })

  res.render('sites/allocate-home-types/add', {
    availableHomeTypes: available
  })
})

/**
 * POST /sites/allocate-home-types/add
 *
 * Processes the checkbox form. Adds selected home type IDs to the
 * session allocation array and redirects back with a success message.
 */
router.post('/sites/allocate-home-types/add', function (req, res) {
  var allocatedIds = ensureAllocationSession(req)
  var selected = req.body['home-types'] || []

  // Normalise to array (single checkbox posts as string)
  if (typeof selected === 'string') selected = [selected]

  selected.forEach(function (id) {
    if (allocatedIds.indexOf(id) === -1) {
      allocatedIds.push(id)
    }
  })

  req.session.data['allocatedHomeTypes'] = allocatedIds
  var count = selected.length
  res.redirect('/sites/allocate-home-types?success=' + count)
})

/**
 * GET /sites/allocate-home-types/remove/:homeTypeId
 *
 * Confirmation page — "Are you sure you want to remove [home type]?"
 * Standard GDS confirmation pattern.
 */
router.get('/sites/allocate-home-types/remove/:homeTypeId', function (req, res) {
  var homeType = allHomeTypes.find(function (ht) {
    return ht.id === req.params.homeTypeId
  })
  if (!homeType) return res.redirect('/sites/allocate-home-types')

  res.render('sites/allocate-home-types/remove', {
    homeType: homeType
  })
})

/**
 * POST /sites/allocate-home-types/remove/:homeTypeId
 *
 * Processes the removal. If user confirmed, removes the home type ID
 * from the session allocation array.
 */
/**
 * GET /sites/allocate-home-types/build-analysis
 *
 * Documents GDS alignment, zero custom departures and accessibility
 * predictions for the Allocate home types flow.
 */
router.get('/sites/allocate-home-types/build-analysis', function (req, res) {
  res.render('sites/allocate-home-types/build-analysis')
})

router.post('/sites/allocate-home-types/remove/:homeTypeId', function (req, res) {
  if (req.body['confirm-remove'] === 'yes') {
    var allocatedIds = ensureAllocationSession(req)
    var idx = allocatedIds.indexOf(req.params.homeTypeId)
    if (idx !== -1) {
      allocatedIds.splice(idx, 1)
      req.session.data['allocatedHomeTypes'] = allocatedIds
    }
    return res.redirect('/sites/allocate-home-types?removed=true')
  }
  // User chose "No" — go back to main page without removing
  res.redirect('/sites/allocate-home-types')
})

// =============================================================================
// Completions — phase-based completions journey for a site
// =============================================================================

/**
 * Helper — ensure completions session structure exists.
 */
function ensureCompletionsSession(req) {
  if (!req.session.data.completions) {
    req.session.data.completions = { phases: [] }
  }
  return req.session.data.completions
}

/**
 * Helper — strip commas from a form value so parseFloat works correctly.
 * Currency inputs may contain thousands separators from client-side formatting.
 */
function stripCommas(value) {
  return (value || '').replace(/,/g, '').trim()
}

/**
 * Helper — find a phase by ID within the completions session.
 */
function findPhase(req, phaseId) {
  var completions = ensureCompletionsSession(req)
  return completions.phases.find(function (p) { return p.id === phaseId })
}

/**
 * Helper — find a tenure home type within a phase.
 */
function findTenureHomeType(phase, thtId) {
  return phase.tenureHomeTypes.find(function (t) { return t.id === thtId })
}

/**
 * Helper — count total addresses across all tenure home types in a phase.
 */
function countPhaseHomes(phase) {
  return phase.tenureHomeTypes.reduce(function (sum, tht) {
    return sum + (tht.addresses ? tht.addresses.length : 0)
  }, 0)
}

/**
 * Helper — format {day, month, year} object to DD/MM/YYYY string.
 */
function formatCompletionDate(dateObj) {
  if (!dateObj || !dateObj.day) return ''
  return String(dateObj.day).padStart(2, '0') + '/' +
    String(dateObj.month).padStart(2, '0') + '/' +
    dateObj.year
}

/**
 * Helper — enrich a site from seedSites with mock detail data.
 */
function enrichSite(site) {
  return Object.assign({}, site, {
    typeOfSite: 'greenfield',
    ruralArea: 'no',
    operatingArea: 'South East',
    processingRoute: 'acquisition-works',
    regenerationSite: 'no',
    postcode: 'XXXX XXX',
    xCoordinate: '',
    yCoordinate: '',
    typeOfContractor: 'in-house',
    contractor: '---',
    ownershipStatus: 'conditional',
    planningStatus: 'detailed-no-steps',
    buildingContractStatus: 'conditional-let',
    startOnSiteStatus: 'forecast',
    forecastCompletionDay: '27',
    forecastCompletionMonth: '3',
    forecastCompletionYear: '2027'
  })
}

/**
 * GET /sites/:siteId/completions
 *
 * Completions landing page — lists all completion phases for a site.
 */
router.get('/sites/:siteId/completions', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var completions = ensureCompletionsSession(req)

  res.render('sites/completions/index', {
    site: enrichSite(site),
    phases: completions.phases,
    success: req.query.success || null
  })
})

/**
 * GET /sites/:siteId/completions/build-analysis
 *
 * Build analysis page documenting the completions journey.
 */
router.get('/sites/:siteId/completions/build-analysis', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  res.render('sites/completions/build-analysis', {
    site: enrichSite(site)
  })
})

/**
 * GET /sites/:siteId/completions/add
 *
 * Add a new completion phase — form with phase details and date.
 */
router.get('/sites/:siteId/completions/add', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  res.render('sites/completions/add', {
    site: enrichSite(site),
    errors: null
  })
})

/**
 * POST /sites/:siteId/completions/add
 *
 * Creates a new phase in session and redirects to the phase hub.
 */
router.post('/sites/:siteId/completions/add', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var phaseDetails = (req.body['phase-details'] || '').trim()
  var day = (req.body['practical-completion-date-day'] || '').trim()
  var month = (req.body['practical-completion-date-month'] || '').trim()
  var year = (req.body['practical-completion-date-year'] || '').trim()

  // Validation
  var errors = []
  if (!phaseDetails) errors.push({ text: 'Enter a phase name', href: '#phase-details' })
  if (!day) errors.push({ text: 'Enter a day', href: '#practical-completion-date-day' })
  if (!month) errors.push({ text: 'Enter a month', href: '#practical-completion-date-month' })
  if (!year) errors.push({ text: 'Enter a year', href: '#practical-completion-date-year' })

  if (errors.length > 0) {
    return res.render('sites/completions/add', {
      site: enrichSite(site),
      errors: errors,
      values: req.body
    })
  }

  var completions = ensureCompletionsSession(req)
  var nextNum = completions.phases.length + 1
  var phaseId = 'CP-' + String(nextNum).padStart(3, '0')

  completions.phases.push({
    id: phaseId,
    phaseDetails: phaseDetails,
    practicalCompletionDate: { day: day, month: month, year: year },
    owner: '',
    contractor: '',
    status: 'in-progress',
    tenureHomeTypes: [],
    costs: {
      grossDevelopmentValue: '1250000',
      acquisitionCosts: '',
      workCosts: '',
      onCosts: ''
    },
    contributions: {
      grossDevelopmentValue: '',
      totalBaselineGrant: '',
      communityLedRuralGrant: '',
      providersOwnResources: '',
      incomeFromSharedOwnershipSales: '',
      loanSupportableFromRentalIncome: '',
      rcgf: '',
      dpf: '',
      otherPublicSubsidy: '',
      other: ''
    }
  })

  res.redirect('/sites/' + req.params.siteId + '/completions/' + phaseId)
})

/**
 * POST /sites/:siteId/completions/:phaseId/phase-details
 *
 * Saves phase details tab form and redirects back to hub.
 */
router.post('/sites/:siteId/completions/:phaseId/phase-details', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  phase.phaseDetails = (req.body['phase-details'] || '').trim()
  phase.practicalCompletionDate = {
    day: (req.body['practical-completion-date-day'] || '').trim(),
    month: (req.body['practical-completion-date-month'] || '').trim(),
    year: (req.body['practical-completion-date-year'] || '').trim()
  }
  phase.owner = req.body['owner'] || ''
  phase.contractor = req.body['contractor'] || ''

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#phase-details')
})

/**
 * POST /sites/:siteId/completions/:phaseId/phase-costs
 *
 * Saves phase costs tab form and redirects back to hub.
 */
router.post('/sites/:siteId/completions/:phaseId/phase-costs', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  phase.costs = {
    grossDevelopmentValue: phase.costs.grossDevelopmentValue,
    acquisitionCosts: stripCommas(req.body['acquisition-costs']),
    workCosts: stripCommas(req.body['work-costs']),
    onCosts: stripCommas(req.body['on-costs'])
  }

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#phase-costs')
})

/**
 * POST /sites/:siteId/completions/:phaseId/phase-contributions
 *
 * Saves phase contributions tab form and redirects back to hub.
 */
router.post('/sites/:siteId/completions/:phaseId/phase-contributions', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  phase.contributions = {
    grossDevelopmentValue: stripCommas(req.body['contributions-gdv']),
    totalBaselineGrant: stripCommas(req.body['total-baseline-grant']),
    communityLedRuralGrant: stripCommas(req.body['community-led-rural-grant']),
    providersOwnResources: stripCommas(req.body['providers-own-resources']),
    incomeFromSharedOwnershipSales: stripCommas(req.body['income-shared-ownership-sales']),
    loanSupportableFromRentalIncome: stripCommas(req.body['loan-supportable-rental-income']),
    rcgf: stripCommas(req.body['rcgf']),
    dpf: stripCommas(req.body['dpf']),
    otherPublicSubsidy: stripCommas(req.body['other-public-subsidy']),
    other: stripCommas(req.body['other-contributions'])
  }

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#phase-contributions')
})

/**
 * GET /sites/:siteId/completions/:phaseId/tenure-home-types/add
 *
 * Add tenure home type — select home type and tenure type.
 */
router.get('/sites/:siteId/completions/:phaseId/tenure-home-types/add', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  res.render('sites/completions/tenure-home-types/add', {
    site: enrichSite(site),
    phase: phase,
    allocatedHomeTypes: req.session.data.allocatedHomeTypes || [],
    errors: null
  })
})

/**
 * POST /sites/:siteId/completions/:phaseId/tenure-home-types/add
 *
 * Creates a new tenure home type record and redirects to rent-and-sales.
 */
router.post('/sites/:siteId/completions/:phaseId/tenure-home-types/add', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  var allocatedHomeTypeId = req.body['allocated-home-type'] || ''
  var tenureType = req.body['tenure-type'] || ''

  // Validation
  var errors = []
  if (!allocatedHomeTypeId) errors.push({ text: 'Select an allocated home type', href: '#allocated-home-type' })
  if (!tenureType) errors.push({ text: 'Select a tenure type', href: '#tenure-type' })

  if (errors.length > 0) {
    return res.render('sites/completions/tenure-home-types/add', {
      site: enrichSite(site),
      phase: phase,
      allocatedHomeTypes: req.session.data.allocatedHomeTypes || [],
      errors: errors,
      values: req.body
    })
  }

  var nextNum = phase.tenureHomeTypes.length + 1
  var thtId = 'HE-' + String(nextNum).padStart(2, '0')

  phase.tenureHomeTypes.push({
    id: thtId,
    allocatedHomeTypeId: allocatedHomeTypeId,
    tenureType: tenureType,
    rentAndSales: {},
    addresses: []
  })

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '/tenure-home-types/' + thtId + '/rent-and-sales')
})

/**
 * GET /sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/rent-and-sales
 *
 * Rent and sales form — fields vary by tenure type.
 */
router.get('/sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/rent-and-sales', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  var tht = findTenureHomeType(phase, req.params.thtId)
  if (!tht) return res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#tenure-home-type-list')

  res.render('sites/completions/tenure-home-types/rent-and-sales', {
    site: enrichSite(site),
    phase: phase,
    tht: tht,
    errors: null
  })
})

/**
 * POST /sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/rent-and-sales
 *
 * Saves rent and sales data and redirects to addresses page.
 */
router.post('/sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/rent-and-sales', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  var tht = findTenureHomeType(phase, req.params.thtId)
  if (!tht) return res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#tenure-home-type-list')

  tht.rentAndSales = {
    // Common
    marketValuePerHome: stripCommas(req.body['market-value-per-home']),
    proposedRentPerWeek: stripCommas(req.body['proposed-rent-per-week']),
    // Shared Ownership / OPSO
    assumedAverageInitialSale: stripCommas(req.body['assumed-average-initial-sale']),
    firstTrancheSalesReceipt: stripCommas(req.body['first-tranche-sales-receipt']),
    rentPercentUnsoldShare: stripCommas(req.body['rent-percent-unsold-share']),
    // OPSO / Affordable Rent / Rent to Buy
    serviceChargePerWeek: stripCommas(req.body['service-charge-per-week']),
    // Affordable Rent / Rent to Buy
    marketRentPerWeek: stripCommas(req.body['market-rent-per-week']),
    rentPercentMarketRent: stripCommas(req.body['rent-percent-market-rent']),
    lhaRate: stripCommas(req.body['lha-rate']),
    exceeds80Percent: (req.body['exceeds-80-percent'] || '').trim()
  }

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '/tenure-home-types/' + req.params.thtId + '/addresses')
})

/**
 * GET /sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/addresses
 *
 * Add home addresses — inline editable table.
 */
router.get('/sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/addresses', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  var tht = findTenureHomeType(phase, req.params.thtId)
  if (!tht) return res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#tenure-home-type-list')

  res.render('sites/completions/tenure-home-types/addresses', {
    site: enrichSite(site),
    phase: phase,
    tht: tht,
    errors: null
  })
})

/**
 * POST /sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/addresses
 *
 * Saves address rows and redirects back to phase hub.
 */
router.post('/sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/addresses', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  var tht = findTenureHomeType(phase, req.params.thtId)
  if (!tht) return res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#tenure-home-type-list')

  // Parse address rows from form data
  var addresses = req.body.addresses || []
  if (!Array.isArray(addresses)) addresses = [addresses]

  // Filter out completely empty rows
  tht.addresses = addresses.filter(function (addr) {
    return (addr.addressLine1 && addr.addressLine1.trim()) || (addr.postcode && addr.postcode.trim())
  }).map(function (addr) {
    return {
      number: (addr.number || '').trim(),
      addressLine1: (addr.addressLine1 || '').trim(),
      addressLine2: (addr.addressLine2 || '').trim(),
      county: (addr.county || '').trim(),
      postcode: (addr.postcode || '').trim(),
      rcgf: (addr.rcgf || '').trim()
    }
  })

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#tenure-home-type-list')
})

/**
 * GET /sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/delete
 *
 * Deletes a tenure home type and redirects back to phase hub.
 */
router.get('/sites/:siteId/completions/:phaseId/tenure-home-types/:thtId/delete', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (phase) {
    phase.tenureHomeTypes = phase.tenureHomeTypes.filter(function (t) {
      return t.id !== req.params.thtId
    })
  }

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId + '#tenure-home-type-list')
})

/**
 * GET /sites/:siteId/completions/:phaseId/submit
 *
 * Submit completion phase — review page with certification.
 */
router.get('/sites/:siteId/completions/:phaseId/submit', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  res.render('sites/completions/submit', {
    site: enrichSite(site),
    phase: phase,
    errors: null
  })
})

/**
 * POST /sites/:siteId/completions/:phaseId/submit
 *
 * Submits the phase and redirects to completions landing with success.
 */
router.post('/sites/:siteId/completions/:phaseId/submit', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  var furtherPhases = req.body['further-phases'] || ''
  var certification = req.body['certification'] || ''

  // Validation
  var errors = []
  if (!furtherPhases) errors.push({ text: 'Select whether there are further phases', href: '#further-phases' })
  if (!certification) errors.push({ text: 'You must confirm the certification', href: '#certification' })

  if (errors.length > 0) {
    var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
    return res.render('sites/completions/submit', {
      site: enrichSite(site),
      phase: phase,
      errors: errors,
      values: req.body
    })
  }

  phase.status = 'submitted'
  res.redirect('/sites/' + req.params.siteId + '/completions?success=' + encodeURIComponent(phase.phaseDetails))
})

/**
 * POST /sites/:siteId/completions/:phaseId/unsubmit
 *
 * Unsubmits a phase — sets status back to in-progress.
 */
router.post('/sites/:siteId/completions/:phaseId/unsubmit', function (req, res) {
  var phase = findPhase(req, req.params.phaseId)
  if (phase) {
    phase.status = 'in-progress'
  }

  res.redirect('/sites/' + req.params.siteId + '/completions/' + req.params.phaseId)
})

/**
 * GET /sites/:siteId/completions/:phaseId
 *
 * Phase hub — central screen with tabs for phase details, tenure home types,
 * costs, and contributions. Must be defined AFTER all other /completions/:phaseId/* routes.
 */
router.get('/sites/:siteId/completions/:phaseId', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var phase = findPhase(req, req.params.phaseId)
  if (!phase) return res.redirect('/sites/' + req.params.siteId + '/completions')

  // Calculate derived values
  var homesCount = countPhaseHomes(phase)

  // Calculate total costs
  var totalCosts = 0
  if (phase.costs) {
    totalCosts = (parseFloat(phase.costs.acquisitionCosts) || 0) +
      (parseFloat(phase.costs.workCosts) || 0) +
      (parseFloat(phase.costs.onCosts) || 0)
  }

  // Calculate RCGF from addresses
  var rcgfTotal = 0
  phase.tenureHomeTypes.forEach(function (tht) {
    if (tht.addresses) {
      tht.addresses.forEach(function (addr) {
        rcgfTotal += parseFloat(addr.rcgf) || 0
      })
    }
  })

  // Calculate total contributions
  var totalContributions = 0
  if (phase.contributions) {
    totalContributions =
      (parseFloat(phase.contributions.grossDevelopmentValue) || 0) +
      (parseFloat(phase.contributions.totalBaselineGrant) || 0) +
      (parseFloat(phase.contributions.communityLedRuralGrant) || 0) +
      (parseFloat(phase.contributions.providersOwnResources) || 0) +
      (parseFloat(phase.contributions.incomeFromSharedOwnershipSales) || 0) +
      (parseFloat(phase.contributions.loanSupportableFromRentalIncome) || 0) +
      rcgfTotal +
      (parseFloat(phase.contributions.dpf) || 0) +
      (parseFloat(phase.contributions.otherPublicSubsidy) || 0) +
      (parseFloat(phase.contributions.other) || 0)
  }

  // Readiness check
  var phaseDetailsComplete = phase.owner && phase.contractor
  var tenureHomeTypesComplete = phase.tenureHomeTypes.some(function (tht) {
    var hasRentAndSales = tht.rentAndSales && Object.values(tht.rentAndSales).some(function (v) { return v })
    var hasAddresses = tht.addresses && tht.addresses.length > 0
    return hasRentAndSales && hasAddresses
  })
  var phaseCostsComplete = phase.costs &&
    phase.costs.grossDevelopmentValue &&
    phase.costs.acquisitionCosts &&
    phase.costs.workCosts &&
    phase.costs.onCosts
  var phaseContributionsComplete = totalContributions > 0 && totalContributions === totalCosts

  // Find allocated home type details for each THT
  var allocatedHomeTypes = req.session.data.allocatedHomeTypes || []
  var enrichedTHTs = phase.tenureHomeTypes.map(function (tht) {
    var allocatedHT = allocatedHomeTypes.find(function (ht) { return ht.id === tht.allocatedHomeTypeId })
    return Object.assign({}, tht, {
      templateDescription: allocatedHT ? allocatedHT.description : tht.allocatedHomeTypeId
    })
  })

  res.render('sites/completions/phase-hub', {
    site: enrichSite(site),
    phase: phase,
    enrichedTHTs: enrichedTHTs,
    homesCount: homesCount,
    totalCosts: totalCosts,
    rcgfTotal: rcgfTotal,
    totalContributions: totalContributions,
    phaseDetailsComplete: phaseDetailsComplete,
    tenureHomeTypesComplete: tenureHomeTypesComplete,
    phaseCostsComplete: phaseCostsComplete,
    phaseContributionsComplete: phaseContributionsComplete,
    allComplete: phaseDetailsComplete && tenureHomeTypesComplete && phaseCostsComplete && phaseContributionsComplete
  })
})

/**
 * GET /sites/:siteId
 *
 * Site summary page — CRM-style detail view for an individual site.
 * Looks up the site from seedSites by ID, enriches with mock milestone
 * and metric data, and renders the summary template with tabs.
 *
 * IMPORTANT: This wildcard route must be defined AFTER all specific
 * /sites/* routes (add/step-1, add/step-2, build-analysis) to avoid
 * the :siteId param matching "add" or "build-analysis".
 */
router.get('/sites/:siteId', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  // Enrich with mock data that mirrors add-new-site form fields
  var enriched = Object.assign({}, site, {
    typeOfSite: 'greenfield',
    ruralArea: 'no',
    operatingArea: 'South East',
    processingRoute: 'acquisition-works',
    regenerationSite: 'no',
    postcode: 'XXXX XXX',
    xCoordinate: '',
    yCoordinate: '',
    typeOfContractor: 'in-house',
    contractor: '---',
    // Step 2 milestone data
    ownershipStatus: 'conditional',
    planningStatus: 'detailed-no-steps',
    buildingContractStatus: 'conditional-let',
    startOnSiteStatus: 'forecast',
    forecastCompletionDay: '27',
    forecastCompletionMonth: '3',
    forecastCompletionYear: '2027'
  })

  res.render('sites/summary', { site: enriched })
})

/**
 * POST /sites/:siteId
 *
 * Handles save from the site summary form tabs. In a real service this
 * would persist changes; here we just redirect back to the summary page.
 */
router.post('/sites/:siteId', function (req, res) {
  res.redirect('/sites/' + req.params.siteId)
})

/**
 * GET /sites/:siteId/summary-2
 *
 * Option 2 site summary — full-width layout with grouped task list
 * on the Site progress tab (default tab). No sidebar. Matches the
 * Site-summaries.jpg design reference.
 */
router.get('/sites/:siteId/summary-2', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites')

  var enriched = Object.assign({}, site, {
    typeOfSite: 'greenfield',
    ruralArea: 'no',
    operatingArea: 'South East',
    processingRoute: 'acquisition-works',
    regenerationSite: 'no',
    postcode: 'XXXX XXX',
    xCoordinate: '',
    yCoordinate: '',
    typeOfContractor: 'in-house',
    contractor: '---',
    ownershipStatus: 'conditional',
    planningStatus: 'detailed-no-steps',
    buildingContractStatus: 'conditional-let',
    startOnSiteStatus: 'forecast',
    forecastCompletionDay: '27',
    forecastCompletionMonth: '3',
    forecastCompletionYear: '2027'
  })

  res.render('sites/summary-2', { site: enriched })
})

/**
 * GET /sites/:siteId/summary-3
 *
 * Option 3 site summary — pure GDS version with key information sidebar.
 * No custom components (no stat cards). Uses stacked GDS typography for
 * metrics, matching the pattern on /sites-gds. Extends sites-gds layout.
 */
router.get('/sites/:siteId/summary-3', function (req, res) {
  var site = seedSites.find(function (s) { return s.siteId === req.params.siteId })
  if (!site) return res.redirect('/sites-gds')

  var enriched = Object.assign({}, site, {
    typeOfSite: 'greenfield',
    ruralArea: 'no',
    operatingArea: 'South East',
    processingRoute: 'acquisition-works',
    regenerationSite: 'no',
    postcode: 'XXXX XXX',
    xCoordinate: '',
    yCoordinate: '',
    typeOfContractor: 'in-house',
    contractor: '---',
    ownershipStatus: 'conditional',
    planningStatus: 'detailed-no-steps',
    buildingContractStatus: 'conditional-let',
    startOnSiteStatus: 'forecast',
    forecastCompletionDay: '27',
    forecastCompletionMonth: '3',
    forecastCompletionYear: '2027'
  })

  res.render('sites/summary-3', { site: enriched })
})

// =============================================================================
// Sites (GDS) — pure GDS components version of the Sites flow
// =============================================================================

/**
 * GET /sites-gds
 *
 * GDS-only version of the Sites landing page. No filters — GDS has no
 * documented filter pattern, so this page shows all sites with pagination
 * only. Uses stacked typography in a one-third sidebar for key statistics.
 */
router.get('/sites-gds', function (req, res) {
  var allSites = seedSites

  var totalSites = allSites.length
  var totalHomes = allSites.reduce(function (sum, s) { return sum + s.homes }, 0)
  var completedSites = allSites.filter(function (s) { return s.status === 'Site completed' }).length

  var page = parseInt(req.query.page, 10) || 1
  var totalPages = Math.max(1, Math.ceil(allSites.length / SITES_PER_PAGE))
  if (page > totalPages) page = totalPages
  if (page < 1) page = 1

  var start = (page - 1) * SITES_PER_PAGE
  var pageSites = allSites.slice(start, start + SITES_PER_PAGE)

  var paginationItems = []
  for (var i = 1; i <= totalPages; i++) {
    paginationItems.push({
      number: i,
      current: i === page,
      href: '/sites-gds?page=' + i
    })
  }

  var pagination = {}
  if (totalPages > 1) {
    pagination.items = paginationItems
    if (page > 1) {
      pagination.previous = {
        href: '/sites-gds?page=' + (page - 1)
      }
    }
    if (page < totalPages) {
      pagination.next = {
        href: '/sites-gds?page=' + (page + 1)
      }
    }
  }

  res.render('sites-gds/index', {
    success: req.query.success === 'true',
    sites: pageSites,
    pagination: pagination,
    totalSites: totalSites,
    totalHomes: totalHomes,
    completedSites: completedSites
  })
})

/**
 * GET /sites-gds/add/step-1
 */
router.get('/sites-gds/add/step-1', function (req, res) {
  res.render('sites-gds/add/step-1')
})

/**
 * POST /sites-gds/add/step-1
 *
 * Saves step 1 fields to session and redirects to step 2.
 * Uses a separate session key (newSiteGds) to avoid conflicts with /sites flow.
 */
router.post('/sites-gds/add/step-1', function (req, res) {
  req.session.data['newSiteGds'] = {
    ...req.session.data['newSiteGds'],
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
  res.redirect('/sites-gds/add/step-2')
})

/**
 * GET /sites-gds/add/step-2
 */
router.get('/sites-gds/add/step-2', function (req, res) {
  res.render('sites-gds/add/step-2')
})

/**
 * POST /sites-gds/add/step-2
 *
 * Saves step 2 fields, marks the new site as complete, and redirects
 * to the Sites GDS page with a success banner.
 */
router.post('/sites-gds/add/step-2', function (req, res) {
  req.session.data['newSiteGds'] = {
    ...req.session.data['newSiteGds'],
    ownershipStatus: req.body['ownership-status'],
    planningStatus: req.body['planning-status'],
    buildingContractStatus: req.body['building-contract-status'],
    startOnSiteStatus: req.body['start-on-site-status'],
    forecastCompletionDate: req.body['forecast-completion-date']
  }
  req.session.data['newSiteGdsAdded'] = true
  res.redirect('/sites-gds?success=true')
})

// =============================================================================
// Sites (GDS v3) — landing page for Option 3 add-new-site flow
// =============================================================================

/**
 * GET /sites-gds-v3
 *
 * Option 3 version of the Sites landing page. Identical to /sites-gds except
 * the "Add new site" link points to the 4-step add-3 flow.
 */
router.get('/sites-gds-v3', function (req, res) {
  var allSites = seedSites

  var totalSites = allSites.length
  var totalHomes = allSites.reduce(function (sum, s) { return sum + s.homes }, 0)
  var completedSites = allSites.filter(function (s) { return s.status === 'Site completed' }).length

  var page = parseInt(req.query.page, 10) || 1
  var totalPages = Math.max(1, Math.ceil(allSites.length / SITES_PER_PAGE))
  if (page > totalPages) page = totalPages
  if (page < 1) page = 1

  var start = (page - 1) * SITES_PER_PAGE
  var pageSites = allSites.slice(start, start + SITES_PER_PAGE)

  var paginationItems = []
  for (var i = 1; i <= totalPages; i++) {
    paginationItems.push({
      number: i,
      current: i === page,
      href: '/sites-gds-v3?page=' + i
    })
  }

  var pagination = {}
  if (totalPages > 1) {
    pagination.items = paginationItems
    if (page > 1) {
      pagination.previous = {
        href: '/sites-gds-v3?page=' + (page - 1)
      }
    }
    if (page < totalPages) {
      pagination.next = {
        href: '/sites-gds-v3?page=' + (page + 1)
      }
    }
  }

  res.render('sites-gds-v3/index', {
    success: req.query.success === 'true',
    sites: pageSites,
    pagination: pagination,
    totalSites: totalSites,
    totalHomes: totalHomes,
    completedSites: completedSites
  })
})

// =============================================================================
// Sites (GDS) — Option 3: improved add-new-site UX
// =============================================================================

/**
 * GET /sites-gds/add-3/step-1
 *
 * Option 3 step 1 — Site details (ID, name, type, rural area).
 * Shorter, focused pages with radios instead of selects for small option sets.
 */
router.get('/sites-gds/add-3/step-1', function (req, res) {
  res.render('sites-gds/add-3/step-1')
})

/**
 * POST /sites-gds/add-3/step-1
 *
 * Saves step 1 fields to session and redirects to step 2.
 * Uses a separate session key (newSiteV3) to avoid conflicts.
 */
router.post('/sites-gds/add-3/step-1', function (req, res) {
  req.session.data['newSiteV3'] = {
    ...req.session.data['newSiteV3'],
    siteId: req.body['site-id'],
    siteName: req.body['site-name'],
    typeOfSite: req.body['type-of-site'],
    ruralArea: req.body['rural-area']
  }
  res.redirect('/sites-gds/add-3/step-2')
})

/**
 * GET /sites-gds/add-3/step-2
 *
 * Option 3 step 2 — Site location (LA, operating area, region, postcode, coordinates).
 */
router.get('/sites-gds/add-3/step-2', function (req, res) {
  res.render('sites-gds/add-3/step-2')
})

/**
 * POST /sites-gds/add-3/step-2
 */
router.post('/sites-gds/add-3/step-2', function (req, res) {
  req.session.data['newSiteV3'] = {
    ...req.session.data['newSiteV3'],
    localAuthority: req.body['local-authority'],
    operatingArea: req.body['operating-area'],
    region: req.body['region'],
    postcode: req.body['postcode'],
    xCoordinate: req.body['x-coordinate'],
    yCoordinate: req.body['y-coordinate']
  }
  res.redirect('/sites-gds/add-3/step-3')
})

/**
 * GET /sites-gds/add-3/step-3
 *
 * Option 3 step 3 — Processing route, regeneration, contractor details.
 */
router.get('/sites-gds/add-3/step-3', function (req, res) {
  res.render('sites-gds/add-3/step-3')
})

/**
 * POST /sites-gds/add-3/step-3
 */
router.post('/sites-gds/add-3/step-3', function (req, res) {
  req.session.data['newSiteV3'] = {
    ...req.session.data['newSiteV3'],
    processingRoute: req.body['processing-route'],
    regenerationSite: req.body['regeneration-site'],
    typeOfContractor: req.body['type-of-contractor'],
    contractor: req.body['contractor']
  }
  res.redirect('/sites-gds/add-3/step-4')
})

/**
 * GET /sites-gds/add-3/step-4
 *
 * Option 3 step 4 — Site milestones (ownership, planning, building contract,
 * start on site, forecast completion date).
 */
router.get('/sites-gds/add-3/step-4', function (req, res) {
  res.render('sites-gds/add-3/step-4')
})

/**
 * POST /sites-gds/add-3/step-4
 */
router.post('/sites-gds/add-3/step-4', function (req, res) {
  req.session.data['newSiteV3'] = {
    ...req.session.data['newSiteV3'],
    ownershipStatus: req.body['ownership-status'],
    planningStatus: req.body['planning-status'],
    buildingContractStatus: req.body['building-contract-status'],
    startOnSiteStatus: req.body['start-on-site-status'],
    forecastCompletionDay: req.body['forecast-completion-date-day'],
    forecastCompletionMonth: req.body['forecast-completion-date-month'],
    forecastCompletionYear: req.body['forecast-completion-date-year']
  }
  res.redirect('/sites-gds/add-3/check-answers')
})

/**
 * GET /sites-gds/add-3/check-answers
 *
 * GDS "Check your answers" pattern — summary list with change links.
 * Passes the accumulated session data as a site object to the template.
 */
router.get('/sites-gds/add-3/check-answers', function (req, res) {
  res.render('sites-gds/add-3/check-answers', {
    site: req.session.data['newSiteV3'] || {}
  })
})

/**
 * POST /sites-gds/add-3/check-answers
 *
 * Final submission — marks the site as added and redirects to the
 * sites landing page with a success banner.
 */
router.post('/sites-gds/add-3/check-answers', function (req, res) {
  req.session.data['newSiteV3Added'] = true
  res.redirect('/sites-gds-v3?success=true')
})

/**
 * GET /sites-gds/build-analysis
 *
 * Documents GDS alignment, the single agreed deviation (multi-question pages)
 * and comparison with the standard Sites flow.
 */
router.get('/sites-gds/build-analysis', function (req, res) {
  res.render('sites-gds/build-analysis')
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

// =============================================================================
// Forecasting — submitted forecasts and grant funded delivery
// =============================================================================

/**
 * Mock forecast version metadata.
 * Versions 1–4 represent previously submitted forecasts.
 */
var forecastVersions = {
  1: { status: 'Submitted', createdBy: 'Sarah Johnson', reviewedBy: 'Michael Chen', reviewedDate: '15/03/2026' },
  2: { status: 'Approved', createdBy: 'Sarah Johnson', reviewedBy: 'Michael Chen', reviewedDate: '20/06/2026' },
  3: { status: 'Submitted', createdBy: 'Oscar Swanson', reviewedBy: 'Natasha Wilson', reviewedDate: '18/09/2026' },
  4: { status: 'Approved', createdBy: 'Oscar Swanson', reviewedBy: 'Natasha Wilson', reviewedDate: '05/01/2026' }
}

/**
 * Mock forecast table data for 2026-27 (the only year with non-zero values).
 * Currency values are whole pound amounts.
 */
var forecastData2026 = {
  capex:       { forecast: [55797508, 60012520, 0, 0], actual: [55797508, 60012520, 0, 0] },
  grant:       { forecast: [22198349, 48443872, 0, 0], actual: [22198349, 48443872, 0, 0] },
  starts:      { forecast: [31, 285, 0, 0],            actual: [31, 285, 0, 0] },
  completions: { forecast: [99, 194, 0, 0],            actual: [46, 194, 0, 0] }
}

/**
 * Mock comments history for the submitted forecast view.
 */
var forecastComments = [
  { quarter: 2, dateTime: '05/01/2026 14:30', actionedBy: 'Natasha Wilson', comments: 'Reviewed and approved. Figures align with site reports.', status: 'Approved', version: 4 },
  { quarter: 2, dateTime: '18/09/2026 09:15', actionedBy: 'Oscar Swanson', comments: 'Q3 forecast updated to reflect revised site programme.', status: 'Submitted', version: 3 },
  { quarter: 2, dateTime: '20/06/2026 16:45', actionedBy: 'Michael Chen', comments: 'Approved with no changes required.', status: 'Approved', version: 2 },
  { quarter: 2, dateTime: '15/03/2026 11:20', actionedBy: 'Sarah Johnson', comments: 'Initial Q1 forecast based on contractor programme.', status: 'Submitted', version: 1 }
]

/**
 * GET /forecasting/submitted-forecasts
 */
router.get('/forecasting/submitted-forecasts', function (req, res) {
  res.render('forecasting/submitted-forecasts')
})

/**
 * GET /forecasting/grant-funded-delivery
 *
 * Read-only view of submitted forecast versions.
 * ?version=N selects which version to display.
 * ?submitted=true shows the success notification banner.
 */
/**
 * Helper: initialise the submitted versions array in session if not present.
 */
function getSubmittedVersions (sessionData) {
  if (!sessionData['forecastSubmittedVersions']) {
    sessionData['forecastSubmittedVersions'] = []
  }
  return sessionData['forecastSubmittedVersions']
}

/**
 * Helper: parse a session value as a number, stripping commas.
 */
function parseSessionNumber (val) {
  if (val === undefined || val === '') return 0
  return parseFloat(String(val).replace(/,/g, '')) || 0
}

router.get('/forecasting/grant-funded-delivery', function (req, res) {
  var submitted = req.query.submitted === 'true'
  var submittedVersions = getSubmittedVersions(req.session.data)

  // Build version list: base versions 1–4 plus any user-submitted versions
  var versions = JSON.parse(JSON.stringify(forecastVersions))
  submittedVersions.forEach(function (sv) {
    versions[sv.version] = {
      status: 'Submitted',
      createdBy: 'Oscar Swanson',
      reviewedBy: 'Natasha Wilson',
      reviewedDate: sv.date
    }
  })

  var totalVersions = 4 + submittedVersions.length
  var selectedVersion = parseInt(req.query.version, 10) || totalVersions
  var versionMeta = versions[selectedVersion] || versions[totalVersions]

  // Build comments list: seed data plus one entry per submitted version
  var comments = forecastComments.slice()
  // Add in reverse order so newest appears first
  for (var i = submittedVersions.length - 1; i >= 0; i--) {
    var sv = submittedVersions[i]
    comments.unshift({
      quarter: 2,
      dateTime: sv.date + ' ' + sv.time,
      actionedBy: 'Oscar Swanson',
      comments: sv.comments || 'Forecast submitted.',
      status: 'Submitted',
      version: sv.version
    })
  }

  // Build forecast data — if viewing a user-submitted version, use its saved data
  var forecastData = JSON.parse(JSON.stringify(forecastData2026))
  var matchingVersion = submittedVersions.find(function (sv) {
    return sv.version === selectedVersion
  })
  if (matchingVersion && matchingVersion.forecastData) {
    forecastData = JSON.parse(JSON.stringify(matchingVersion.forecastData))
  }

  res.render('forecasting/grant-funded-delivery', {
    submitted: submitted,
    selectedVersion: selectedVersion,
    versionMeta: versionMeta,
    versions: versions,
    totalVersions: totalVersions,
    forecastData: forecastData,
    comments: comments
  })
})

/**
 * GET /forecasting/grant-funded-delivery/new
 *
 * New forecast form. Clears editable fields for a fresh entry each time.
 */
router.get('/forecasting/grant-funded-delivery/new', function (req, res) {
  var submittedVersions = getSubmittedVersions(req.session.data)
  var nextVersion = 5 + submittedVersions.length

  // Pre-populate editable fields from the last submitted version,
  // or fall back to base mock data if no versions submitted yet
  var lastSnapshot = submittedVersions.length > 0
    ? submittedVersions[submittedVersions.length - 1].forecastData
    : forecastData2026

  var tables = ['capex', 'grant', 'starts', 'completions']
  tables.forEach(function (table) {
    for (var q = 0; q < 4; q++) {
      var key = table + '-forecast-q' + (q + 1)
      req.session.data[key] = String(lastSnapshot[table].forecast[q])
    }
  })
  req.session.data['forecast-comments'] = ''

  res.render('forecasting/grant-funded-delivery-new', {
    forecastData: forecastData2026,
    nextVersion: nextVersion
  })
})

/**
 * POST /forecasting/grant-funded-delivery/new
 *
 * Handles both "Submit" and "Save as draft" actions.
 * Each submission snapshots the entered data into a stored version.
 */
router.post('/forecasting/grant-funded-delivery/new', function (req, res) {
  if (req.body.action === 'draft') {
    res.redirect('/forecasting/grant-funded-delivery/new')
  } else {
    var submittedVersions = getSubmittedVersions(req.session.data)
    var newVersion = 5 + submittedVersions.length
    var now = new Date()
    var dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    var timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    // Snapshot the forecast data from session
    var sessionData = req.session.data
    var snapshotData = JSON.parse(JSON.stringify(forecastData2026))
    var tables = ['capex', 'grant', 'starts', 'completions']
    tables.forEach(function (table) {
      for (var q = 0; q < 4; q++) {
        var key = table + '-forecast-q' + (q + 1)
        if (sessionData[key] !== undefined && sessionData[key] !== '') {
          snapshotData[table].forecast[q] = parseSessionNumber(sessionData[key])
        }
      }
    })

    submittedVersions.push({
      version: newVersion,
      date: dateStr,
      time: timeStr,
      comments: sessionData['forecast-comments'] || '',
      forecastData: snapshotData
    })

    res.redirect('/forecasting/grant-funded-delivery?submitted=true&version=' + newVersion)
  }
})

// =============================================================================
// Forecasting — Option 2 (grouped by Forecasts / Variances / Actuals)
// =============================================================================
// Reuses the same mock data, version metadata, and comments as Option 1.
// Separate session keys use 'v2' prefix to avoid conflicts.

router.get('/forecasting/submitted-forecasts-v2', function (req, res) {
  res.render('forecasting/submitted-forecasts-v2')
})

router.get('/forecasting/grant-funded-delivery-v2', function (req, res) {
  var submitted = req.query.submitted === 'true'
  var submittedVersions = req.session.data['forecastSubmittedVersionsV2'] || []

  var versions = JSON.parse(JSON.stringify(forecastVersions))
  submittedVersions.forEach(function (sv) {
    versions[sv.version] = {
      status: 'Submitted',
      createdBy: 'Oscar Swanson',
      reviewedBy: 'Natasha Wilson',
      reviewedDate: sv.date
    }
  })

  var totalVersions = 4 + submittedVersions.length
  var selectedVersion = parseInt(req.query.version, 10) || totalVersions
  var versionMeta = versions[selectedVersion] || versions[totalVersions]

  var comments = forecastComments.slice()
  for (var i = submittedVersions.length - 1; i >= 0; i--) {
    var sv = submittedVersions[i]
    comments.unshift({
      quarter: 2,
      dateTime: sv.date + ' ' + sv.time,
      actionedBy: 'Oscar Swanson',
      comments: sv.comments || 'Forecast submitted.',
      status: 'Submitted',
      version: sv.version
    })
  }

  var forecastData = JSON.parse(JSON.stringify(forecastData2026))
  var matchingVersion = submittedVersions.find(function (sv) {
    return sv.version === selectedVersion
  })
  if (matchingVersion && matchingVersion.forecastData) {
    forecastData = JSON.parse(JSON.stringify(matchingVersion.forecastData))
  }

  res.render('forecasting/grant-funded-delivery-v2', {
    submitted: submitted,
    selectedVersion: selectedVersion,
    versionMeta: versionMeta,
    versions: versions,
    totalVersions: totalVersions,
    forecastData: forecastData,
    comments: comments
  })
})

router.get('/forecasting/grant-funded-delivery-v2/new', function (req, res) {
  var submittedVersions = req.session.data['forecastSubmittedVersionsV2'] || []
  var nextVersion = 5 + submittedVersions.length

  var lastSnapshot = submittedVersions.length > 0
    ? submittedVersions[submittedVersions.length - 1].forecastData
    : forecastData2026

  var tables = ['capex', 'grant', 'starts', 'completions']
  tables.forEach(function (table) {
    for (var q = 0; q < 4; q++) {
      var key = table + '-forecast-q' + (q + 1)
      req.session.data[key] = String(lastSnapshot[table].forecast[q])
    }
  })
  req.session.data['forecast-comments'] = ''

  res.render('forecasting/grant-funded-delivery-v2-new', {
    forecastData: forecastData2026,
    nextVersion: nextVersion
  })
})

router.post('/forecasting/grant-funded-delivery-v2/new', function (req, res) {
  if (req.body.action === 'draft') {
    res.redirect('/forecasting/grant-funded-delivery-v2/new')
  } else {
    if (!req.session.data['forecastSubmittedVersionsV2']) {
      req.session.data['forecastSubmittedVersionsV2'] = []
    }
    var submittedVersions = req.session.data['forecastSubmittedVersionsV2']
    var newVersion = 5 + submittedVersions.length
    var now = new Date()
    var dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    var timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    var sessionData = req.session.data
    var snapshotData = JSON.parse(JSON.stringify(forecastData2026))
    var tables = ['capex', 'grant', 'starts', 'completions']
    tables.forEach(function (table) {
      for (var q = 0; q < 4; q++) {
        var key = table + '-forecast-q' + (q + 1)
        if (sessionData[key] !== undefined && sessionData[key] !== '') {
          snapshotData[table].forecast[q] = parseSessionNumber(sessionData[key])
        }
      }
    })

    submittedVersions.push({
      version: newVersion,
      date: dateStr,
      time: timeStr,
      comments: sessionData['forecast-comments'] || '',
      forecastData: snapshotData
    })

    res.redirect('/forecasting/grant-funded-delivery-v2?submitted=true&version=' + newVersion)
  }
})
