import { defineStore } from 'pinia'

export const useCombinationStore = defineStore('combination', {
  state: () => ({
    combinations: []
  }),
  actions: {
    setCombinations(combos) {
      this.combinations = combos
    }
  }
}) 