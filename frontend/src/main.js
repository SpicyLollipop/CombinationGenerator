import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import FoodFestivalPlanner from './view/FoodFestivalPlanner.vue'
import ResultPage from './view/ResultPage.vue'

const routes = [
  { path: '/', component: FoodFestivalPlanner },
  { path: '/result', name: 'ResultPage', component: ResultPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
