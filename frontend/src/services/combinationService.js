// Service responsible for generating vendor distribution combinations
// Keeps business logic out of the view component for cleanliness and testability.

/**
 * Generate randomized 3-wise combinations for Total Vendor, Cuisene Type, and Main Ingredient.
 * @param {Array<{parameter:string, values:any[]}>} params - Array of parameter objects with name + values
 * @returns {Array<Object>} combinations array
 */
export function generate3WiseCombinations(params) {
  // Extract parameters by fuzzy includes to allow flexible naming
  const totalVendorParam = params.find(p => p.parameter?.includes('Total Vendor') || p.parameter?.includes('Parameter 1'))
  const cuisineParam = params.find(p => p.parameter?.includes('Cuisene Type') || p.parameter?.includes('Parameter 2'))
  const ingredientParam = params.find(p => p.parameter?.includes('Main Ingredient') || p.parameter?.includes('Parameter 3'))

  if (!totalVendorParam || !cuisineParam || !ingredientParam) return []

  const totalVendorValues = totalVendorParam.values
  const cuisineTypes = cuisineParam.values
  const ingredients = ingredientParam.values

  const results = []

  totalVendorValues.forEach(totalVendors => {
    const totalVendorNum = parseInt(totalVendors)
    if (isNaN(totalVendorNum) || totalVendorNum <= 0) return

    // Randomly distribute vendors among cuisine types
    const vendorsPerCuisine = {}
    let remainingVendors = totalVendorNum

    // Cuisine distribution
    const cuisineDistribution = []
    for (let i = 0; i < cuisineTypes.length - 1; i++) {
      const minPercentage = 0.15
      const maxPercentage = Math.min(0.6, remainingVendors / totalVendorNum)
      const randomPercentage = Math.random() * (maxPercentage - minPercentage) + minPercentage
      const vendorCount = Math.floor(totalVendorNum * randomPercentage)
      cuisineDistribution.push(Math.max(1, vendorCount))
      remainingVendors -= cuisineDistribution[i]
    }
    cuisineDistribution.push(Math.max(1, remainingVendors))

    // Shuffle cuisine allocation
    for (let i = cuisineDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cuisineDistribution[i], cuisineDistribution[j]] = [cuisineDistribution[j], cuisineDistribution[i]]
    }

    // Assign cuisine counts
    cuisineTypes.forEach((cuisine, index) => {
      vendorsPerCuisine[cuisine] = cuisineDistribution[index]
    })

    // Generate ingredient distributions per cuisine
    cuisineTypes.forEach(cuisine => {
      const cuisineVendorCount = vendorsPerCuisine[cuisine]
      const vendorsPerIngredient = {}
      let remainingCuisineVendors = cuisineVendorCount

      const ingredientDistribution = []
      for (let i = 0; i < ingredients.length - 1; i++) {
        const maxForThisIngredient = Math.max(1, Math.floor(remainingCuisineVendors * 0.7))
        const minForThisIngredient = Math.max(1, Math.floor(remainingCuisineVendors * 0.1))
        const randomCount = Math.floor(Math.random() * (maxForThisIngredient - minForThisIngredient + 1)) + minForThisIngredient
        const actualCount = Math.min(randomCount, remainingCuisineVendors - (ingredients.length - i - 1))
        ingredientDistribution.push(Math.max(1, actualCount))
        remainingCuisineVendors -= ingredientDistribution[i]
      }
      ingredientDistribution.push(Math.max(1, remainingCuisineVendors))

      // Shuffle ingredient allocation
      for (let i = ingredientDistribution.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[ingredientDistribution[i], ingredientDistribution[j]] = [ingredientDistribution[j], ingredientDistribution[i]]
      }

      ingredients.forEach((ingredient, index) => {
        vendorsPerIngredient[ingredient] = ingredientDistribution[index]
        results.push({
          'Total Vendor': totalVendorNum,
            'Number of vendor': cuisineVendorCount,
            'Cuisene Type': cuisine,
            'Main Ingredient': ingredient,
            'No. of vendor per ingredient': vendorsPerIngredient[ingredient]
        })
      })
    })
  })

  return results
}
