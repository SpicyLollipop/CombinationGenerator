<template>
  <div class="container">
    <h1 class="title">Welcome to Food Festival Planner</h1>
    <div style="display: flex; gap: 40px; justify-content: center; width: 100%;">
      <div class="form-box">
        <form @submit.prevent="handleSubmit">
          <label class="label">Event:</label>
          <div class="input-text">Food Festival</div>

          <label class="label">Parameter:</label>
          <select v-model="selectedParameter" class="input" @change="handleParameterChange">
            <option value="" disabled selected>Select a parameter</option>
            <option value="total_vendor">Total Vendor</option>
            <option value="cuisene_type">Cuisene Type</option>
            <option value="main_ingredient">Main Ingredient</option>
            <option value="others">Others</option>
          </select>
        </form>

        <div class="save-row">
          <button class="save" type="button" @click="handleSubmit">Save</button>
        </div>
      </div>

      <div v-if="displayedParameters.length > 0" class="form-box parameters-display">
        <div class="values-display">
          <div v-for="(param, idx) in displayedParameters" :key="idx" class="value-row">
            <template v-if="editingIndex === idx">
              <div class="edit-form">
                <input 
                  v-model="editForm.parameterName"
                  class="input edit-input"
                  placeholder="Parameter name"
                />
                <div v-for="(value, vIdx) in editForm.values" :key="vIdx" class="edit-value-row">
                  <input 
                    v-model="editForm.values[vIdx]"
                    class="input edit-input"
                    placeholder="Value"
                  />
                  <button 
                    @click="removeValue(vIdx)" 
                    class="icon-btn" 
                    v-if="editForm.values.length > 1"
                    :disabled="editForm.values.length <= 2"
                    :class="{ 'disabled': editForm.values.length <= 2 }"
                  >
                    <span class="delete-icon">×</span>
                  </button>
                </div>
                <div class="edit-actions">
                  <button 
                    @click="addValue" 
                    class="add-btn" 
                    :disabled="editForm.values.length >= 10"
                    :class="{ 'disabled': editForm.values.length >= 10 }"
                  >
                    + Add Value
                  </button>
                  <div>
                    <button @click="saveEdit" class="save-btn">Save</button>
                    <button @click="cancelEdit" class="cancel-btn">Cancel</button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="value-item">
                {{ selectedParameterNames[idx] }}: {{ param.values.join(', ') }}
                <div style="display: flex; gap: 8px; align-items: center;">
                  <button @click="startEdit(idx)" class="edit-btn" title="Edit">
                    <span class="edit-icon">✎</span>
                  </button>
                  <button @click="removeParameter(idx)" class="icon-btn" title="Delete" style="margin-left: 4px;">
                    <span class="delete-icon">×</span>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

    </div>
    <div class="generate-row">
      <button class="generate" type="button" @click="handleGenerate">Generate</button>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCombinationStore } from '../store/combinationStore'
import { useParameterStore } from '../store/parameterStore'
import { getParameterValues } from '../config/api'
import { generate3WiseCombinations } from '../services/combinationService'

const selectedParameter = ref('')
const router = useRouter()
const combinationStore = useCombinationStore()
const parameterStore = useParameterStore()
const { displayedParameters, selectedParameterNames } = storeToRefs(parameterStore)
const currentValues = ref([])
const errorMessage = ref('')
const editingIndex = ref(null)
const editForm = reactive({
  parameterName: '',
  values: []
})

// Backend parameter id mapping (could be externalized if needed)
const parameterMapping = {
  total_vendor: 1,
  cuisene_type: 2,
  main_ingredient: 3,
  others: 4 // Hardcoded, not in database
}

const handleParameterChange = async () => {
  try {
    // Clear any existing error message when parameter changes
    errorMessage.value = '';
    
    // Handle "others" parameter with hardcoded values
    if (selectedParameter.value === 'others') {
      currentValues.value = ['value1', 'value2', 'value3'];
      console.log('Using hardcoded values for Others:', currentValues.value);
      return;
    }
    
    const paramId = parameterMapping[selectedParameter.value];
    const response = await getParameterValues(paramId);
    console.log('API Response:', response.data);
    
    if (response.data && response.data.data && response.data.data.values) {
      if (selectedParameter.value === 'total_vendor') {
        // For total_vendor, parse as numbers
        currentValues.value = response.data.data.values.map(item => {
          const num = parseInt(item.value);
          return isNaN(num) ? item.value : num;
        });
      } else {
        // For other parameters, use strings
        currentValues.value = response.data.data.values.map(item => item.value);
      }
      console.log('Processed values:', currentValues.value);
    }
  } catch (error) {
    console.error('Error fetching parameter values:', error);
    errorMessage.value = 'Error loading parameter values. Please try again.';
  }
}

const handleSubmit = () => {
  if (!selectedParameter.value || currentValues.value.length === 0) {
    errorMessage.value = 'Please select a parameter and ensure it has values.';
    return;
  }

  // Convert parameter key to display name
  const displayName = selectedParameter.value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Check if this parameter has already been saved
  if (Array.isArray(selectedParameterNames.value) && selectedParameterNames.value.includes(displayName)) {
    errorMessage.value = `${displayName} has already been saved. Please select a different parameter.`;
    return;
  }

  // Clear any existing error message
  errorMessage.value = '';

  // Store both parameter name and values
  parameterStore.addParameter([...currentValues.value], displayName)
}

// Remove a parameter by index
const removeParameter = (idx) => {
  parameterStore.removeParameter(idx);
  // Optionally clear error or edit state if the deleted index was being edited
  if (editingIndex.value === idx) {
    cancelEdit();
  }
  // If editingIndex is after the removed index, decrement it
  if (editingIndex.value !== null && editingIndex.value > idx) {
    editingIndex.value--;
  }
  errorMessage.value = '';
};

const startEdit = (idx) => {
  editingIndex.value = idx;
  editForm.parameterName = selectedParameterNames.value[idx];
  editForm.values = [...displayedParameters.value[idx].values];
}

const cancelEdit = () => {
  editingIndex.value = null;
  editForm.parameterName = '';
  editForm.values = [];
  errorMessage.value = '';
}

const saveEdit = () => {
  // First check if we have a valid editing index
  if (editingIndex.value === null) {
    errorMessage.value = 'No parameter is being edited';
    return;
  }

  // Validate parameter name
  if (!editForm.parameterName.trim()) {
    errorMessage.value = 'Parameter name is required';
    return;
  }

  // Validate values
  if (!editForm.values || editForm.values.length < 2) {
    errorMessage.value = 'At least 2 values are required per parameter';
    return;
  }

  // Check maximum values limit
  if (editForm.values.length > 10) {
    errorMessage.value = 'Maximum 10 values allowed per parameter';
    return;
  }

  // Handle validation for total vendor (numbers) vs other parameters (strings)
  const paramNameForType = selectedParameterNames.value?.[editingIndex.value]
  const isNumber = typeof paramNameForType === 'string' && paramNameForType.toLowerCase().includes('vendor');
  
  // Check for empty fields first
  const emptyFields = editForm.values.filter((v, index) => {
    if (typeof v !== 'string' && typeof v !== 'number') return true;
    return v.toString().trim().length === 0;
  });

  if (emptyFields.length > 0) {
    errorMessage.value = 'Please fill in all empty fields before saving';
    return;
  }

  // Validate field types and content
  const validValues = editForm.values.filter(v => {
    if (isNumber) {
      const num = parseFloat(v);
      return !isNaN(num) && num.toString() === v.toString().trim();
    }
    return v.trim().length > 0;
  });

  if (validValues.length !== editForm.values.length) {
    errorMessage.value = isNumber ? 
      'All values must be valid numbers' : 
      'All values must contain valid text';
    return;
  }

  // Process the values based on the parameter type
  const processedValues = editForm.values.map(v => {
    if (isNumber) {
      return parseFloat(v);
    }
    return v.trim();
  });

  try {
    // Update the parameter
    selectedParameterNames.value[editingIndex.value] = editForm.parameterName.trim();
    displayedParameters.value[editingIndex.value] = {
      values: processedValues
    };
    
    // Clear error message and edit state
    errorMessage.value = '';
    cancelEdit();
  } catch (error) {
    console.error('Error saving edit:', error);
    errorMessage.value = 'Failed to save changes. Please try again.';
  }
}

const addValue = () => {
  if (editForm.values.length >= 10) {
    return;
  }
  editForm.values.push('');
}
const removeValue = (idx) => {
  if (editForm.values.length <= 2) {
    return; // Don't remove if only 2 values left
  }
  editForm.values.splice(idx, 1);
}



// Removed cookie restoration; state now lives in Pinia store only.

const handleGenerate = () => {
  if (displayedParameters.value.length < 3) {
    errorMessage.value = 'At least 3 parameters are required to generate combinations.';
    return;
  }

  // Convert displayedParameters to the format expected by getAll3WiseCombinations
  const paramsWithNames = displayedParameters.value.map((param, idx) => ({
    parameter: selectedParameterNames.value[idx],
    values: param.values
  }));

  const combinations = generate3WiseCombinations(paramsWithNames);
  combinationStore.setCombinations(combinations);
  router.push({ name: 'ResultPage' });
}
</script>

<style scoped>
.container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.form-box {
  background: #fff;
  padding: 40px 50px 60px 50px;
  border-radius: 4px;
  border: 1px solid #000000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  width: 400px;
  min-height: fit-content;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 1.2rem;
}
.label {
  font-size: 2rem;
  font-weight: bold;
  text-align: left;
  margin-top: 18px;
  margin-bottom: 8px;
  display: block;
  color: #444;
  width: 100%;
}
.input {
  width: 100%;
  padding: 10px 12px;
  font-size: 1.2rem;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
.input:focus {
  border-color: #f7d3a6;
}

.input-text {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #444;
}

.selected-values {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-value {
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-value:hover {
  border-color: #f7d3a6;
}

.highlighted {
  background: #ccc;
}

.parameter-display {
  margin-bottom: 15px;
  width: 100%;
}

.parameter-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.parameter-values {
  color: #444;
}

.parameters-display {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
}

.values-display {
  width: 100%;
  text-align: left;
  /* padding: 0 20px; */
}

.value-row {
  margin: 10px 0;
  width: 100%;
}

.value-item {
  font-size: 1.2rem;
  padding: 10px;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.edit-form {
  width: 100%;
  padding: 15px;
}

.edit-input {
  margin-bottom: 10px;
  width: 100%;
}

.edit-value-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.edit-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  gap: 10px;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #666;
  font-size: 1.2rem;
  transition: color 0.2s;
}

.edit-btn:hover {
  color: #000;
}

.save-btn, .cancel-btn {
  padding: 8px 15px;
  border: 1px solid #aaa;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.2s;
}

.save-btn:hover, .cancel-btn:hover {
  background: #f7d3a6;
}

.add-btn {
  padding: 8px 15px;
  border: 1px solid #aaa;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #f7d3a6;
}

.add-btn.disabled,
.add-btn:disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
  border-color: #ddd;
}

.add-btn.disabled:hover,
.add-btn:disabled:hover {
  background: #f0f0f0;
  transform: none;
}

.delete-icon {
  color: #ff0000;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
}

.icon-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn.disabled,
.icon-btn:disabled {
  cursor: not-allowed;
}

.icon-btn.disabled .delete-icon,
.icon-btn:disabled .delete-icon {
  color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff0000;
  font-size: 1.2rem;
  margin-top: 10px;
  text-align: center;
}

.add-more-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin: 20px 0;
}
.add-more {
  width: 180px;
  padding: 10px 0;
  background: #fff;
  border: 1px solid #aaa;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.add-more:hover {
  background: #f7d3a6;
  transform: translateY(-1px);
}
.save-row {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.save {
  width: 180px;
  padding: 12px 0;
  background: #fff;
  border: 1px solid #aaa;
  border-radius: 7px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.save:hover {
  background: #f7d3a6;
  transform: translateY(-1px);
}
.generate-row {
  display: flex;
  justify-content: center;
  width: 100%;
}
.generate {
  width: 180px;
  padding: 12px 0;
  background: #fff;
  border: 1px solid #aaa;
  border-radius: 7px;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s ease;
}
.generate:hover {
  background: #f7d3a6;
  transform: translateY(-1px);
}

</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  background: #f7d3a6;
}
</style> 