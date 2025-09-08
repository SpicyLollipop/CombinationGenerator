<template>
  <Header />
  <div class="container">
    <h2>Food Festival Vendor Distribution</h2>
    <div v-if="groupedCombinations.length > 0" style="margin-bottom: 12px; font-size: 1.1rem;">
      Total combinations: <b>{{ combinations.length }}</b>
    </div>
    
    <div v-if="groupedCombinations.length > 0" class="results-container">
      <div v-for="(group, groupIndex) in groupedCombinations" :key="groupIndex" class="vendor-group">
        <div class="total-vendor-header">
          Total Vendor = {{ group.totalVendor }}
        </div>
        
        <table class="result-table">
          <thead>
            <tr>
              <th>Number of vendor</th>
              <th>Cuisene Type</th>
              <th>Main Ingredient</th>
              <th>No. of vendor per ingredient</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(cuisineGroup, cuisineIndex) in group.cuisineGroups" :key="cuisineIndex">
              <tr v-for="(combination, combIndex) in cuisineGroup.combinations" :key="combIndex">
                <td v-if="combIndex === 0" :rowspan="cuisineGroup.combinations.length" class="merged-cell">
                  {{ combination['Number of vendor'] }}
                </td>
                <td v-if="combIndex === 0" :rowspan="cuisineGroup.combinations.length" class="merged-cell">
                  {{ combination['Cuisene Type'] }}
                </td>
                <td>{{ combination['Main Ingredient'] }}</td>
                <td>{{ combination['No. of vendor per ingredient'] }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-else>No combinations generated.</div>

    <!-- Export Buttons -->
    <div v-if="combinations.length > 0" class="export-section">
      <h3>Export Results</h3>
      <div class="export-buttons">
        <button @click="handleExportCSV" class="export-btn csv-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2"/>
          </svg>
          Export CSV
        </button>
        <button @click="handleExportPDF" class="export-btn pdf-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
            <path d="M8 16H16" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12H16" stroke="currentColor" stroke-width="2"/>
          </svg>
          Export PDF
        </button>
        <button @click="handleExportImage" class="export-btn image-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Export Image
        </button>
      </div>
      <div v-if="exportMessage" class="export-message" :class="exportMessageType">
        {{ exportMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCombinationStore } from '../store/combinationStore'
import { ExportService } from '../services/exportService'
import Header from '../components/Header.vue'

const combinationStore = useCombinationStore()
const combinations = computed(() => combinationStore.combinations)

// Group combinations by total vendor count, then by cuisine type
const groupedCombinations = computed(() => {
  const perTotalVendor = new Map()
  combinations.value.forEach(combo => {
    const key = combo['Total Vendor']
    if (!perTotalVendor.has(key)) perTotalVendor.set(key, [])
    perTotalVendor.get(key).push(combo)
  })

  return Array.from(perTotalVendor.entries())
    .map(([totalVendor, items]) => {
      const cuisines = new Map()
      items.forEach(c => {
        const cuisineKey = c['Cuisene Type']
        if (!cuisines.has(cuisineKey)) cuisines.set(cuisineKey, [])
        cuisines.get(cuisineKey).push(c)
      })
      const cuisineGroups = Array.from(cuisines.entries()).map(([cuisineType, combos]) => ({ cuisineType, combinations: combos }))
      return { totalVendor, combinations: items, cuisineGroups }
    })
    .sort((a, b) => a.totalVendor - b.totalVendor)
})

// Export functionality
const exportMessage = ref('')
const exportMessageType = ref('success')

/**
 * Handle CSV export with error handling
 */
const handleExportCSV = () => {
  try {
    ExportService.exportToCSV(combinations.value, '3way-combinations.csv')
    showExportMessage('CSV exported successfully!', 'success')
  } catch (error) {
    showExportMessage(`Export failed: ${error.message}`, 'error')
  }
}

/**
 * Handle PDF export with error handling
 */
const handleExportPDF = async () => {
  try {
    await ExportService.exportToPDF(combinations.value, groupedCombinations.value, 
        'food-festival-combinations.pdf')
    showExportMessage('PDF exported successfully!', 'success')
  } catch (error) {
    showExportMessage(`Export failed: ${error.message}`, 'error')
  }
}

/**
 * Handle image export with error handling
 */
const handleExportImage = async () => {
  try {
    const resultsContainer = document.querySelector('.results-container')
    if (!resultsContainer) {
      throw new Error('Results container not found')
    }
    await ExportService.exportToImage(resultsContainer, 'food-festival-combinations.png')
    showExportMessage('Image exported successfully!', 'success')
  } catch (error) {
    showExportMessage(`Export failed: ${error.message}`, 'error')
  }
}

/**
 * Show export message with timeout
 * @param {string} message - Message to display
 * @param {string} type - Message type (success/error)
 */
const showExportMessage = (message, type) => {
  exportMessage.value = message
  exportMessageType.value = type
  
  // Clear message after 3 seconds
  setTimeout(() => {
    exportMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40px;
}

.results-container {
  width: 100%;
  max-width: 800px;
}

.vendor-group {
  margin-bottom: 30px;
}

.total-vendor-header {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  text-align: left;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.result-table th,
.result-table td {
  border: 1px solid #000;
  padding: 8px 12px;
  text-align: center;
}

.result-table th {
  background-color: #f7d3a6;
  font-weight: bold;
}

.result-table td {
  background-color: #fff;
}

.merged-cell {
  vertical-align: middle;
  font-weight: bold;
  background-color: #f9f9f9 !important;
}

.export-section {
  margin: 20px 0;
  text-align: center;
}

.export-section h3 {
  margin-bottom: 15px;
  color: #444;
  font-size: 1.3rem;
}

.export-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #aaa;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #f7d3a6;
  transform: translateY(-1px);
}

.export-btn svg {
  width: 16px;
  height: 16px;
}

.csv-btn:hover {
  border-color: #4CAF50;
}

.pdf-btn:hover {
  border-color: #f44336;
}

.image-btn:hover {
  border-color: #FF9800;
}

.export-message {
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.export-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.export-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

table {
  border-collapse: collapse;
  width: 80%;
  margin-top: 20px;
}

th, td {
  border: 1px solid #aaa;
  padding: 8px 16px;
  text-align: center;
}

th {
  background: #f7d3a6;
}
</style> 