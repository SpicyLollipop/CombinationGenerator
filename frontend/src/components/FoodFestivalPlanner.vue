<template>
  <div class="container">
    <h1 class="title">Welcome to Food Festival Planner</h1>
    <div style="display: flex; gap: 40px; justify-content: center; width: 100%;">
      <div class="form-box">
        <form @submit.prevent="handleSubmit">
          <label class="label" for="parameter">Parameter:</label>
          <input 
            class="input" 
            :class="{ 'error': errors.parameter }"
            id="parameter" 
            type="text" 
            v-model="parameter" 
          />
          <span v-if="errors.parameter" class="error-message">{{ errors.parameter }}</span>

          <label class="label" for="value-0">Value:</label>
          <input 
            class="input" 
            :class="{ 'error': errors.values[0] }"
            id="value-0" 
            type="text" 
            v-model="values[0]" 
          />
          <span v-if="errors.values[0]" class="error-message">{{ errors.values[0] }}</span>

          <template v-for="(value, index) in values.slice(1)" :key="index + 1">
            <input 
              class="input" 
              :class="{ 'error': errors.values[index + 1] }"
              :id="'value-' + (index + 1)" 
              type="text" 
              v-model="values[index + 1]" 
            />
            <span v-if="errors.values[index + 1]" class="error-message">{{ errors.values[index + 1] }}</span>
          </template>

          <span v-if="errors.valuesGeneral" class="error-message">{{ errors.valuesGeneral }}</span>

          <div class="add-more-row">
            <button class="add-more" type="button" @click="addValue">Add More</button>
          </div>
        </form>

        <div class="save-row">
          <button class="save" type="button" @click="handleSubmit">Save</button>
        </div>
      </div>
      <template v-if="savedParameters.length > 0">
        <div class="form-box" style="min-height: 250px; display: flex; align-items: flex-start; justify-content: center;">
          <div>
            <div v-for="(item, idx) in savedParameters" :key="idx" style="margin-bottom: 12px;">
              <template v-if="editingIndex === idx">
                <input class="input" v-model="editForm.parameter" style="margin-bottom: 6px;" />
                <div v-for="(val, vIdx) in editForm.values" :key="vIdx" style="display: flex; align-items: center; margin-bottom: 4px;">
                  <input class="input" v-model="editForm.values[vIdx]" style="width: 200px; margin-right: 8px;" />
                  <template v-if="vIdx === editForm.values.length - 1">
                    <button class="icon-btn plus-btn" type="button" @click="addEditValue">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#444" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12" y2="16" stroke="#444" stroke-width="2" stroke-linecap="round"/>
                        <line x1="8" y1="12" x2="16" y2="12" stroke="#444" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </template>
                </div>
                <div style="margin-top: 8px;">
                  <button class="save" type="button" @click="saveEdit(idx)">Save</button>
                  <button class="add-more" type="button" @click="cancelEdit" style="margin-left: 8px;">Cancel</button>
                </div>
              </template>
              <template v-else>
                <span><b>{{ item.parameter }}:</b> {{ item.values.join(', ') }}</span>
                <button class="icon-btn" type="button" @click="startEdit(idx)" style="margin-left: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#444" stroke-width="1.5"/>
                    <path d="M8 16.5V16.5C8 16.5 8.5 14.5 10 13L15.5 7.5C15.7761 7.22386 16.2239 7.22386 16.5 7.5V7.5C16.7761 7.77614 16.7761 8.22386 16.5 8.5L11 14C9.5 15.5 7.5 16 7.5 16H7.5C7.5 16 7.5 16.5 8 16.5Z" stroke="#444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="generate-row">
      <button class="generate" type="button" @click="handleGenerate">Generate</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCombinationStore } from '../store/combinationStore'

const parameter = ref('')
const values = ref([''])
const errors = reactive({
  parameter: '',
  values: {},
  valuesGeneral: ''
})
const savedParameters = ref([])
const router = useRouter()
const combinationStore = useCombinationStore()

// Edit state
const editingIndex = ref(null)
const editForm = reactive({
  parameter: '',
  values: []
})

const startEdit = (idx) => {
  editingIndex.value = idx
  editForm.parameter = savedParameters.value[idx].parameter
  editForm.values = [...savedParameters.value[idx].values]
}

const cancelEdit = () => {
  editingIndex.value = null
  editForm.parameter = ''
  editForm.values = []
}

const saveEdit = (idx) => {
  if (!editForm.parameter.trim()) return
  if (editForm.values.filter(v => v.trim()).length < 2) return
  savedParameters.value[idx] = {
    parameter: editForm.parameter.trim(),
    values: editForm.values.map(v => v.trim())
  }
  cancelEdit()
}

const addEditValue = () => {
  editForm.values.push('')
}

const validateForm = () => {
  let isValid = true
  errors.parameter = ''
  errors.values = {}
  errors.valuesGeneral = ''

  if (!parameter.value.trim()) {
    errors.parameter = 'Parameter is required'
    isValid = false
  }

  let nonEmptyCount = 0
  values.value.forEach((value, index) => {
    if (!value.trim()) {
      errors.values[index] = 'Value is required'
      isValid = false
    } else {
      nonEmptyCount++
    }
  })

  if (nonEmptyCount < 2) {
    errors.valuesGeneral = 'At least two values are required.'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (validateForm()) {
    savedParameters.value.push({
      parameter: parameter.value,
      values: values.value.map(v => v.trim())
    })
    parameter.value = ''
    values.value = ['']
    errors.parameter = ''
    errors.values = {}
    errors.valuesGeneral = ''
  }
}

const addValue = () => {
  values.value.push('')
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
  const combinations = getAll3WiseCombinations(savedParameters.value)
  combinationStore.setCombinations(combinations)
  router.push({ name: 'ResultPage' })
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
.error {
  border-color: #ff4444 !important;
}

.error-message {
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: -5px;
  margin-bottom: 10px;
  text-align: left;
  display: block;
}

.icon-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  transition: background 0.2s;
  margin-left: 28px;
}
.icon-btn:hover {
  background: #f7d3a6;
  border-radius: 50%;
}
.plus-btn {
  margin-left: 6px;
  padding: 2px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.plus-btn:hover {
  background: #f7d3a6;
  border-radius: 50%;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  background: #f7d3a6;
}
</style> 