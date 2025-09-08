import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useParameterStore = defineStore('parameterStore', () => {
  const displayedParameters = ref([]) // [{ values: [...] }]
  const selectedParameterNames = ref([]) // [ 'Total Vendor', ... ]

  function setParameters(params, names) {
    displayedParameters.value = params
    selectedParameterNames.value = names
  }

  function addParameter(values, name) {
    displayedParameters.value.push({ values })
    selectedParameterNames.value.push(name)
  }

  function updateParameter(index, values, name) {
    if (name !== undefined) selectedParameterNames.value[index] = name
    displayedParameters.value[index] = { values }
  }

  function clearAll() {
    displayedParameters.value = []
    selectedParameterNames.value = []
  }

  function removeParameter(index) {
    displayedParameters.value.splice(index, 1)
    selectedParameterNames.value.splice(index, 1)
  }

  return { displayedParameters, selectedParameterNames, setParameters, addParameter, updateParameter, 
    clearAll, removeParameter }
})
