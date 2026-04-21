/**
 * local-authority-lookup.js — Local authority autocomplete with
 * auto-populated Region and Homes England region fields.
 *
 * Uses the GOV.UK accessible-autocomplete component to provide a
 * styled typeahead search matching the GDS select autocomplete pattern.
 * When a user selects a local authority, the Region and Homes England
 * region displays update automatically, and the hint text below those
 * fields is hidden.
 */

document.addEventListener('DOMContentLoaded', function () {
  // ─── Local authority data ────────────────────────────────────────────
  var localAuthorities = [
    // East Midlands
    { code: 'E06000015', name: 'Derby City Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E10000007', name: 'Derbyshire County Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E06000016', name: 'Leicester City Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E10000018', name: 'Leicestershire County Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E10000019', name: 'Lincolnshire County Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E06000061', name: 'North Northamptonshire Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E06000018', name: 'Nottingham City Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E10000024', name: 'Nottinghamshire County Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E06000017', name: 'Rutland County Council', region: 'East Midlands', heRegion: 'East Midlands' },
    { code: 'E06000062', name: 'West Northamptonshire Council', region: 'East Midlands', heRegion: 'East Midlands' },
    // East of England
    { code: 'E06000055', name: 'Bedford Borough Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E10000003', name: 'Cambridgeshire County Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E06000056', name: 'Central Bedfordshire Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E10000012', name: 'Essex County Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E10000015', name: 'Hertfordshire County Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E06000032', name: 'Luton Borough Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E10000020', name: 'Norfolk County Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E06000031', name: 'Peterborough City Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E06000033', name: 'Southend-on-Sea City Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E10000029', name: 'Suffolk County Council', region: 'East of England', heRegion: 'East of England' },
    { code: 'E06000034', name: 'Thurrock Council', region: 'East of England', heRegion: 'East of England' },
    // London
    { code: 'E09000001', name: 'City of London Corporation', region: 'London', heRegion: 'London' },
    { code: 'E09000002', name: 'London Borough of Barking and Dagenham', region: 'London', heRegion: 'London' },
    { code: 'E09000003', name: 'London Borough of Barnet', region: 'London', heRegion: 'London' },
    { code: 'E09000004', name: 'London Borough of Bexley', region: 'London', heRegion: 'London' },
    { code: 'E09000005', name: 'London Borough of Brent', region: 'London', heRegion: 'London' },
    { code: 'E09000006', name: 'London Borough of Bromley', region: 'London', heRegion: 'London' },
    { code: 'E09000007', name: 'London Borough of Camden', region: 'London', heRegion: 'London' },
    { code: 'E09000008', name: 'London Borough of Croydon', region: 'London', heRegion: 'London' },
    { code: 'E09000009', name: 'London Borough of Ealing', region: 'London', heRegion: 'London' },
    { code: 'E09000010', name: 'London Borough of Enfield', region: 'London', heRegion: 'London' },
    { code: 'E09000011', name: 'London Borough of Greenwich', region: 'London', heRegion: 'London' },
    { code: 'E09000012', name: 'London Borough of Hackney', region: 'London', heRegion: 'London' },
    { code: 'E09000013', name: 'London Borough of Hammersmith and Fulham', region: 'London', heRegion: 'London' },
    { code: 'E09000014', name: 'London Borough of Haringey', region: 'London', heRegion: 'London' },
    { code: 'E09000015', name: 'London Borough of Harrow', region: 'London', heRegion: 'London' },
    { code: 'E09000016', name: 'London Borough of Havering', region: 'London', heRegion: 'London' },
    { code: 'E09000017', name: 'London Borough of Hillingdon', region: 'London', heRegion: 'London' },
    { code: 'E09000018', name: 'London Borough of Hounslow', region: 'London', heRegion: 'London' },
    { code: 'E09000019', name: 'London Borough of Islington', region: 'London', heRegion: 'London' },
    { code: 'E09000020', name: 'Royal Borough of Kensington and Chelsea', region: 'London', heRegion: 'London' },
    { code: 'E09000021', name: 'Royal Borough of Kingston upon Thames', region: 'London', heRegion: 'London' },
    { code: 'E09000022', name: 'London Borough of Lambeth', region: 'London', heRegion: 'London' },
    { code: 'E09000023', name: 'London Borough of Lewisham', region: 'London', heRegion: 'London' },
    { code: 'E09000024', name: 'London Borough of Merton', region: 'London', heRegion: 'London' },
    { code: 'E09000025', name: 'London Borough of Newham', region: 'London', heRegion: 'London' },
    { code: 'E09000026', name: 'London Borough of Redbridge', region: 'London', heRegion: 'London' },
    { code: 'E09000027', name: 'London Borough of Richmond upon Thames', region: 'London', heRegion: 'London' },
    { code: 'E09000028', name: 'London Borough of Southwark', region: 'London', heRegion: 'London' },
    { code: 'E09000029', name: 'London Borough of Sutton', region: 'London', heRegion: 'London' },
    { code: 'E09000030', name: 'London Borough of Tower Hamlets', region: 'London', heRegion: 'London' },
    { code: 'E09000031', name: 'London Borough of Waltham Forest', region: 'London', heRegion: 'London' },
    { code: 'E09000032', name: 'London Borough of Wandsworth', region: 'London', heRegion: 'London' },
    { code: 'E09000033', name: 'City of Westminster', region: 'London', heRegion: 'London' },
    // North East
    { code: 'E06000047', name: 'County Durham Council', region: 'North East', heRegion: 'North East' },
    { code: 'E06000005', name: 'Darlington Borough Council', region: 'North East', heRegion: 'North East' },
    { code: 'E08000037', name: 'Gateshead Council', region: 'North East', heRegion: 'North East' },
    { code: 'E06000001', name: 'Hartlepool Borough Council', region: 'North East', heRegion: 'North East' },
    { code: 'E06000002', name: 'Middlesbrough Borough Council', region: 'North East', heRegion: 'North East' },
    { code: 'E08000021', name: 'Newcastle upon Tyne City Council', region: 'North East', heRegion: 'North East' },
    { code: 'E08000022', name: 'North Tyneside Council', region: 'North East', heRegion: 'North East' },
    { code: 'E06000057', name: 'Northumberland County Council', region: 'North East', heRegion: 'North East' },
    { code: 'E06000003', name: 'Redcar and Cleveland Borough Council', region: 'North East', heRegion: 'North East' },
    { code: 'E08000023', name: 'South Tyneside Council', region: 'North East', heRegion: 'North East' },
    { code: 'E06000004', name: 'Stockton-on-Tees Borough Council', region: 'North East', heRegion: 'North East' },
    { code: 'E08000024', name: 'Sunderland City Council', region: 'North East', heRegion: 'North East' },
    // North West
    { code: 'E06000008', name: 'Blackburn with Darwen Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E06000009', name: 'Blackpool Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000001', name: 'Bolton Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000002', name: 'Bury Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E06000049', name: 'Cheshire East Council', region: 'North West', heRegion: 'North West' },
    { code: 'E06000050', name: 'Cheshire West and Chester Council', region: 'North West', heRegion: 'North West' },
    { code: 'E06000063', name: 'Cumberland Council', region: 'North West', heRegion: 'North West' },
    { code: 'E06000006', name: 'Halton Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000011', name: 'Knowsley Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E10000017', name: 'Lancashire County Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000012', name: 'Liverpool City Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000003', name: 'Manchester City Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000004', name: 'Oldham Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000005', name: 'Rochdale Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000006', name: 'Salford City Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000014', name: 'Sefton Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000013', name: 'St Helens Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000007', name: 'Stockport Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000008', name: 'Tameside Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000009', name: 'Trafford Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E06000007', name: 'Warrington Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E06000064', name: 'Westmorland and Furness Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000010', name: 'Wigan Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    { code: 'E08000015', name: 'Wirral Metropolitan Borough Council', region: 'North West', heRegion: 'North West' },
    // South East
    { code: 'E06000036', name: 'Bracknell Forest Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000043', name: 'Brighton and Hove City Council', region: 'South East', heRegion: 'South East' },
    { code: 'E10000002', name: 'Buckinghamshire Council', region: 'South East', heRegion: 'South East' },
    { code: 'E10000011', name: 'East Sussex County Council', region: 'South East', heRegion: 'South East' },
    { code: 'E10000014', name: 'Hampshire County Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000046', name: 'Isle of Wight Council', region: 'South East', heRegion: 'South East' },
    { code: 'E10000016', name: 'Kent County Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000035', name: 'Medway Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000042', name: 'Milton Keynes City Council', region: 'South East', heRegion: 'South East' },
    { code: 'E10000025', name: 'Oxfordshire County Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000044', name: 'Portsmouth City Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000038', name: 'Reading Borough Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000039', name: 'Slough Borough Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000045', name: 'Southampton City Council', region: 'South East', heRegion: 'South East' },
    { code: 'E10000030', name: 'Surrey County Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000037', name: 'West Berkshire Council', region: 'South East', heRegion: 'South East' },
    { code: 'E10000032', name: 'West Sussex County Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000040', name: 'Windsor and Maidenhead Council', region: 'South East', heRegion: 'South East' },
    { code: 'E06000041', name: 'Wokingham Borough Council', region: 'South East', heRegion: 'South East' },
    // South West
    { code: 'E06000022', name: 'Bath and North East Somerset Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000058', name: 'Bournemouth, Christchurch and Poole Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000023', name: 'Bristol City Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000052', name: 'Cornwall Council', region: 'South West', heRegion: 'South West' },
    { code: 'E10000008', name: 'Devon County Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000059', name: 'Dorset Council', region: 'South West', heRegion: 'South West' },
    { code: 'E10000013', name: 'Gloucestershire County Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000053', name: 'Isles of Scilly Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000024', name: 'North Somerset Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000026', name: 'Plymouth City Council', region: 'South West', heRegion: 'South West' },
    { code: 'E10000027', name: 'Somerset County Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000025', name: 'South Gloucestershire Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000030', name: 'Swindon Borough Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000027', name: 'Torbay Council', region: 'South West', heRegion: 'South West' },
    { code: 'E06000054', name: 'Wiltshire Council', region: 'South West', heRegion: 'South West' },
    // West Midlands
    { code: 'E08000025', name: 'Birmingham City Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E08000026', name: 'Coventry City Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E08000027', name: 'Dudley Metropolitan Borough Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E06000019', name: 'Herefordshire Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E08000028', name: 'Sandwell Metropolitan Borough Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E06000051', name: 'Shropshire Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E08000029', name: 'Solihull Metropolitan Borough Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E10000028', name: 'Staffordshire County Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E06000020', name: 'Stoke-on-Trent City Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E06000021', name: 'Telford and Wrekin Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E08000030', name: 'Walsall Metropolitan Borough Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E10000031', name: 'Warwickshire County Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E08000031', name: 'Wolverhampton City Council', region: 'West Midlands', heRegion: 'West Midlands' },
    { code: 'E10000034', name: 'Worcestershire County Council', region: 'West Midlands', heRegion: 'West Midlands' },
    // Yorkshire and The Humber
    { code: 'E08000016', name: 'Barnsley Metropolitan Borough Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000032', name: 'Bradford Metropolitan District Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000033', name: 'Calderdale Metropolitan Borough Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000017', name: 'Doncaster Metropolitan Borough Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E06000011', name: 'East Riding of Yorkshire Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E06000010', name: 'Kingston upon Hull City Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000034', name: 'Kirklees Metropolitan Borough Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000035', name: 'Leeds City Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E06000012', name: 'North East Lincolnshire Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E06000013', name: 'North Lincolnshire Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E06000065', name: 'North Yorkshire Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000018', name: 'Rotherham Metropolitan Borough Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000019', name: 'Sheffield City Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E08000036', name: 'Wakefield Metropolitan District Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' },
    { code: 'E06000014', name: 'York City Council', region: 'Yorkshire and The Humber', heRegion: 'Yorkshire and The Humber' }
  ]

  // ─── Build lookup maps ───────────────────────────────────────────────
  var laByDisplay = {}
  var allOptions = []

  localAuthorities.forEach(function (la) {
    var display = la.code + ' - ' + la.name
    laByDisplay[display] = la
    allOptions.push(display)
  })

  // ─── Initialise accessible-autocomplete ──────────────────────────────
  var container = document.getElementById('local-authority-autocomplete-container')
  var hiddenInput = document.getElementById('local-authority')
  if (!container || typeof accessibleAutocomplete === 'undefined') return

  accessibleAutocomplete({
    element: container,
    id: 'local-authority-autocomplete',
    name: 'local-authority-display',
    source: function (query, populateResults) {
      var q = query.toLowerCase()
      var filtered = allOptions.filter(function (opt) {
        return opt.toLowerCase().indexOf(q) !== -1
      })
      populateResults(filtered)
    },
    defaultValue: hiddenInput.value || '',
    minLength: 1,
    showNoOptionsFound: true,
    onConfirm: function (confirmed) {
      if (!confirmed) return
      hiddenInput.value = confirmed
      updateRegions(confirmed)
    },
    confirmOnBlur: true,
    autoselect: false,
    placeholder: '',
    cssNamespace: 'autocomplete'
  })

  // ─── Auto-populate Region and HE Region ──────────────────────────────
  var regionDisplay = document.getElementById('region-display')
  var regionHidden = document.getElementById('region')
  var heRegionDisplay = document.getElementById('he-region-display')
  var heRegionHidden = document.getElementById('he-region')
  var regionHint = document.getElementById('region-hint')
  var heRegionHint = document.getElementById('he-region-hint')

  function updateRegions (displayVal) {
    var la = laByDisplay[displayVal]
    if (la) {
      regionDisplay.textContent = la.region
      regionHidden.value = la.region
      heRegionDisplay.textContent = la.heRegion
      heRegionHidden.value = la.heRegion
      // Hide the hint text once a region is populated
      if (regionHint) regionHint.style.display = 'none'
      if (heRegionHint) heRegionHint.style.display = 'none'
    } else {
      regionDisplay.textContent = ''
      regionHidden.value = ''
      heRegionDisplay.textContent = ''
      heRegionHidden.value = ''
      if (regionHint) regionHint.style.display = ''
      if (heRegionHint) heRegionHint.style.display = ''
    }
  }

  // If there's already a value (back navigation), populate on load
  if (hiddenInput.value) {
    updateRegions(hiddenInput.value)
  }
})
