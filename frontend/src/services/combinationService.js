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

    // Randomly distribute vendors among cuisine types, but ensure max difference is at most 10
    const n = cuisineTypes.length;
    let cuisineDistribution = Array(n).fill(1); // Start with 1 vendor per cuisine
    let remaining = totalVendorNum - n;
    // Randomly assign the rest, but never let any cuisine get more than 10 above any other
    while (remaining > 0) {
      // Find all indices that are currently at the minimum
      let min = Math.min(...cuisineDistribution);
      let max = Math.max(...cuisineDistribution);
      // Only allow adding to those not already at max
      let candidates = cuisineDistribution
        .map((val, idx) => ({ val, idx }))
        .filter(obj => (max - obj.val) < 10)
        .map(obj => obj.idx);
      // Pick a random candidate
      const idx = candidates[Math.floor(Math.random() * candidates.length)];
      cuisineDistribution[idx]++;
      remaining--;
    }
    // Shuffle for randomness
    for (let i = cuisineDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cuisineDistribution[i], cuisineDistribution[j]] = [cuisineDistribution[j], cuisineDistribution[i]];
    }
    // Assign cuisine counts
    const vendorsPerCuisine = {};
    cuisineTypes.forEach((cuisine, index) => {
      vendorsPerCuisine[cuisine] = cuisineDistribution[index];
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
