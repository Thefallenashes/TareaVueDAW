<template>
  <div class="game-root px-6 py-8">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Prestigio</h1>
      <div class="flex items-center gap-3">
        <router-link to="/" class="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">
          ← Volver al Juego
        </router-link>
        <ThemeToggle />
      </div>
    </div>

    <div class="mb-4">
      <div class="points-display p-4 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <div class="text-sm text-gray-500">Puntos Totales</div>
        <div class="text-4xl font-bold">{{ format(totalPoints) }}</div>
        <div class="text-sm text-gray-600">Prestige Tokens: <strong>{{ prestigeTokens }}</strong></div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Sistema de Prestigio</h2>
        <div class="text-sm text-gray-600 mb-3">Reinicia tu progreso y obtén bonificadores permanentes.</div>

        <div class="space-y-3">
          <div>
            <div class="text-sm text-gray-700 dark:text-gray-300">Fórmula: ⌊√(puntos totales) / 100⌋</div>
            <div class="text-lg font-medium mt-1">Ganarías: +{{ prestigeTokens }} tokens</div>
          </div>
          <button 
            v-if="totalPoints >= 1000000000"
            class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            @click="resetPrestige"
          >
            Ascender (Reset)
          </button>
          <div v-else class="text-sm text-red-600">Requiere 1,000,000,000 puntos</div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Tokens Acumulados: {{ prestige }}</h2>
        <div class="text-sm text-gray-600 mb-3">Mejoras permanentes con tus tokens.</div>

        <div class="space-y-2">
          <div class="flex justify-between items-center p-2 rounded bg-gray-100 dark:bg-gray-700/50">
            <div>
              <div class="font-medium">+5% CPS por token</div>
              <div class="text-xs text-gray-600">Multiplicador actual: x{{ (1 + prestige * 0.05).toFixed(2) }}</div>
            </div>
          </div>
          <div class="flex justify-between items-center p-2 rounded bg-gray-100 dark:bg-gray-700/50">
            <div>
              <div class="font-medium">+3% Click Value por token</div>
              <div class="text-xs text-gray-600">Multiplicador actual: x{{ (1 + prestige * 0.03).toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 text-sm text-gray-500">
      <div>Tu progreso en el juego será reseteado, pero mantendrás los bonificadores de prestigio.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

// Cargar datos de prestigio
const prestige = ref(Number(stored('game_prestige', 0)) || 0)

// Cargar puntos totales acumulados (incluyendo resets anteriores)
const totalPointsFromPrestige = ref(Number(stored('game_totalPointsFromPrestige', 0)) || 0)

// Puntos actuales del juego
const currentGamePoints = ref(Number(stored('game_points', 0)) || 0)

const totalPoints = computed(() => totalPointsFromPrestige.value + currentGamePoints.value)

const prestigeTokens = computed(() => {
  return Math.floor(Math.sqrt(totalPoints.value) / 100)
})

const format = (v) => {
  if (v >= 1e9) return (v/1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v/1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v/1e3).toFixed(2) + 'k'
  return Math.floor(v)
}

const resetPrestige = () => {
  if (totalPoints.value < 1000000000) return
  
  // Sumar puntos actuales a totalPointsFromPrestige
  const newTotal = totalPointsFromPrestige.value + currentGamePoints.value
  
  // Calcular y añadir nuevos tokens
  const newTokens = Math.floor(Math.sqrt(totalPoints.value) / 100)
  const updatedPrestige = prestige.value + newTokens
  
  // Guardar datos de prestigio
  try {
    localStorage.setItem('game_prestige', JSON.stringify(updatedPrestige))
    localStorage.setItem('game_totalPointsFromPrestige', JSON.stringify(newTotal))
    
    // Resetear puntos del juego (pero mantener otros datos si es necesario)
    localStorage.setItem('game_points', '0')
  } catch (e) {}
  
  // Volver al juego
  router.push('/')
  window.location.reload() // Recargar para aplicar los cambios
}
</script>

<style scoped>
.game-root { max-width: 900px; margin: 0 auto; }
.points-display { text-align: left }
.card { border: 1px solid rgba(0,0,0,0.04) }
</style>
