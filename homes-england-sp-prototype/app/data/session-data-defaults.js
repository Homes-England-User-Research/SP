module.exports = {

  // Allocated home types — seeded from programme-level home type manager.
  // In production these would come from an API. Used by the completions journey
  // when adding tenure home types to a completion phase.
  allocatedHomeTypes: [
    { id: 'HT-01', description: '2B4P House - Social Rent', buildingType: 'House (H)', bedrooms: 2, persons: 4, housingType: 'General', floorAreaM2: 100, facilities: 'Shared', workType: 'New build', meetsWheelchairStandards: 'Yes', meetsNDSS: 'Yes', communityLedDevelopment: 'No' },
    { id: 'HT-02', description: '1B2P Flat - Shared Ownership', buildingType: 'Flat (F)', bedrooms: 1, persons: 2, housingType: 'General', floorAreaM2: 55, facilities: 'Shared', workType: 'New build', meetsWheelchairStandards: 'No', meetsNDSS: 'Yes', communityLedDevelopment: 'No' },
    { id: 'HT-03', description: '3B5P House - Affordable Rent', buildingType: 'House (H)', bedrooms: 3, persons: 5, housingType: 'General', floorAreaM2: 115, facilities: 'Self-contained', workType: 'New build', meetsWheelchairStandards: 'Yes', meetsNDSS: 'Yes', communityLedDevelopment: 'No' },
    { id: 'HT-04', description: '2B3P Flat - Social Rent', buildingType: 'Flat (F)', bedrooms: 2, persons: 3, housingType: 'General', floorAreaM2: 75, facilities: 'Shared', workType: 'Acquisition and works', meetsWheelchairStandards: 'No', meetsNDSS: 'No', communityLedDevelopment: 'No' }
  ],

  // Completions — phase-based completion journey for a site.
  // Each phase contains tenure home types, costs, contributions and addresses.
  completions: {
    phases: []
  }

}
