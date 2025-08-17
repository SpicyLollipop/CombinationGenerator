<template>
  <header class="header">
    <button class="back-btn" @click="goBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Back</span>
    </button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() {
  router.back()
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px 24px;
  background: #f7d3a6; /* match result page / app background */
  z-index: 1000;
}
.back-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #333;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 12px 4px 0;
  transition: background 0.2s;
}
.back-btn:hover {
  background: #f7d3a6;
  border-radius: 6px;
}
.back-btn svg {
  margin-right: 8px;
}
</style>