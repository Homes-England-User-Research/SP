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

  // --- Filter ---
  var filtered = seedSites.filter(function (site) {
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
    activeRegionSlugs: activeRegionSlugs
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

/**
 * GET /sites/build-analysis
 *
 * Documents GDS alignment, custom departures and accessibility predictions
 * for the Sites landing page and Add new site flow.
 */
router.get('/sites/build-analysis', function (req, res) {
  res.render('sites/build-analysis')
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
