<template>
  <Header />
  <div class="container">
    <h2>3-Wise Combinations</h2>
    <div v-if="combinations.length > 0" style="margin-bottom: 12px; font-size: 1.1rem;">
      Total combinations: <b>{{ combinations.length }}</b>
    </div>
    
    <table v-if="combinations.length > 0" ref="tableRef">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in combinations" :key="idx">
          <td v-for="header in headers" :key="header">{{ row[header] }}</td>
        </tr>
      </tbody>
    </table>
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
        <button @click="handleExportText" class="export-btn text-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2"/>
          </svg>
          Export Text
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
const headers = computed(() => {
  if (combinations.value.length === 0) return []
  return Object.keys(combinations.value[0])
})

// Export functionality
const tableRef = ref(null)
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
 * Handle text export with error handling
 */
const handleExportText = () => {
  try {
    ExportService.exportToText(combinations.value, '3way-combinations.txt')
    showExportMessage('Text file exported successfully!', 'success')
  } catch (error) {
    showExportMessage(`Export failed: ${error.message}`, 'error')
  }
}

/**
 * Handle image export with error handling
 */
const handleExportImage = async () => {
  try {
    if (!tableRef.value) {
      throw new Error('Table element not found')
    }
    await ExportService.exportToImage(tableRef.value, '3way-combinations.png')
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

.text-btn:hover {
  border-color: #2196F3;
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