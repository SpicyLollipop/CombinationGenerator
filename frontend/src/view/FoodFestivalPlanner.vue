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
                  <button @click="removeValue(vIdx)" class="icon-btn" v-if="editForm.values.length > 1">
                    <span class="delete-icon">×</span>
                  </button>
                </div>
                <div class="edit-actions">
                  <button @click="addValue" class="add-btn">+ Add Value</button>
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
                <button @click="startEdit(idx)" class="edit-btn">
                  <span class="edit-icon">✎</span>
                </button>
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
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCombinationStore } from '../store/combinationStore'
import { getParameterValues } from '../config/api'

const selectedParameter = ref('')
const router = useRouter()
const combinationStore = useCombinationStore()
const displayedParameters = ref([])
const currentValues = ref([])
const selectedParameterNames = ref([])
const errorMessage = ref('')
const editingIndex = ref(null)
const editForm = reactive({
  parameterName: '',
  values: []
})

const parameterMapping = {
  'total_vendor': 1,    // ID for total vendor parameter
  'cuisene_type': 2,    // ID for cuisine type parameter
  'main_ingredient': 3  // ID for main ingredient parameter
}

const handleParameterChange = async () => {
  try {
    // Clear any existing error message when parameter changes
    errorMessage.value = '';
    
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

const handleSubmit = async () => {
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
  if (selectedParameterNames.value.includes(displayName)) {
    errorMessage.value = `${displayName} has already been saved. Please select a different parameter.`;
    return;
  }

  // Clear any existing error message
  errorMessage.value = '';

  // Store both parameter name and values
  displayedParameters.value.push({
    values: [...currentValues.value]
  });
  selectedParameterNames.value.push(displayName);
}

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
  if (!editForm.values || editForm.values.length === 0) {
    errorMessage.value = 'At least one value is required';
    return;
  }

  // Handle validation for total vendor (numbers) vs other parameters (strings)
  const isNumber = selectedParameterNames.value[editingIndex.value].toLowerCase().includes('vendor');
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
      'All values must not be empty';
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
  editForm.values.push('');
}

const removeValue = (idx) => {
  editForm.values.splice(idx, 1);
}



function getAll3WiseCombinations(params) {
  // params: [{ parameter: 'A', values: ['a1', 'a2'] }, ...]
  if (params.length < 3) return [];

  // If exactly 3 parameters, generate all possible combinations
  if (params.length === 3) {
    const testCases = [];
    for (const v1 of params[0].values) {
      for (const v2 of params[1].values) {
        for (const v3 of params[2].values) {
          testCases.push({
            [params[0].parameter]: v1,
            [params[1].parameter]: v2,
            [params[2].parameter]: v3
          });
        }
      }
    }
    return testCases;
  }

  // For 4+ parameters, use a greedy algorithm to generate 3-way covering array
  function generate3WayCoveringArray(parameters) {
    // Generate all possible 3-way combinations that need to be covered
    const requiredCombos = new Set();
    const paramIndices = [...Array(parameters.length).keys()];
    
    // Get all combinations of 3 parameters
    const triplets = getCombinations(paramIndices, 3);
    
    // Generate all required 3-way value combinations
    for (const [i, j, k] of triplets) {
      for (const v1 of parameters[i].values) {
        for (const v2 of parameters[j].values) {
          for (const v3 of parameters[k].values) {
            requiredCombos.add(`${i}:${v1}|${j}:${v2}|${k}:${v3}`);
          }
        }
      }
    }
    
    // Greedily build test cases
    const testCases = [];
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    
    while (requiredCombos.size > 0 && attempts < maxAttempts) {
      attempts++;
      
      // Generate a candidate test case
      const candidate = {};
      for (const param of parameters) {
        candidate[param.parameter] = param.values[Math.floor(Math.random() * param.values.length)];
      }
      
      // Check which 3-way combinations this candidate covers
      let covered = [];
      for (const [i, j, k] of triplets) {
        const key = `${i}:${candidate[parameters[i].parameter]}|${j}:${candidate[parameters[j].parameter]}|${k}:${candidate[parameters[k].parameter]}`;
        if (requiredCombos.has(key)) {
          covered.push(key);
        }
      }
      
      // If this candidate covers any new combinations, add it
      if (covered.length > 0) {
        testCases.push(candidate);
        for (const key of covered) {
          requiredCombos.delete(key);
        }
      }
    }
    
    return testCases;
  }
  
  function getCombinations(arr, k) {
    const results = [];
    function helper(start, combo) {
      if (combo.length === k) {
        results.push([...combo]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        combo.push(arr[i]);
        helper(i + 1, combo);
        combo.pop();
      }
    }
    helper(0, []);
    return results;
  }
  
  return generate3WayCoveringArray(params);
}

const handleGenerate = () => {
  if (displayedParameters.value.length < 3) {
    errorMessage.value = 'At least 3 parameters are required to generate combinations.';
    return;
  }

  // Prepare data to save in cookie
  const parameterData = displayedParameters.value.map((param, idx) => ({
    name: selectedParameterNames.value[idx],
    values: param.values
  }));

  // Save to cookie - expires in 7 days
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  document.cookie = `savedParameters=${JSON.stringify(parameterData)}; expires=${expirationDate.toUTCString()}; path=/`;

  // Convert displayedParameters to the format expected by getAll3WiseCombinations
  const paramsWithNames = displayedParameters.value.map((param, idx) => ({
    parameter: `Parameter ${idx + 1}`,
    values: param.values
  }));

  const combinations = getAll3WiseCombinations(paramsWithNames);
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

.delete-icon {
  color: #ff0000;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
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