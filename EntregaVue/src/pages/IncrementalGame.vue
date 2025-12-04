<template>
  <div class="game-root px-6 py-8">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Juego Incremental</h1>
      <div class="flex items-center gap-3">
        <div v-if="prestige > 0" class="text-sm text-purple-600 dark:text-purple-400">Prestigio: {{ prestige }}</div>
        <ThemeToggle />
        <button class="px-3 py-1 bg-gray-700 text-white rounded" @click="goToSettings">Ir a configuración</button>
      </div>
    </div>

    <div class="mb-4">
      <div class="points-display p-4 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <div class="text-sm text-gray-500">Puntos</div>
        <div class="text-4xl font-bold">{{ format(points) }}</div>
        <div class="text-sm text-gray-600">/ segundo: <strong>{{ cps.toFixed(1) }}</strong></div>
      </div>
    </div>

    <div class="flex items-center gap-4 mb-6">
      <button class="px-6 py-3 bg-blue-600 text-white rounded shadow" @click="gain()">
        Hacer click (+{{ Math.floor(clickValue * clickMultiplier) }})
      </button>
      <div class="text-gray-600">Valor base: <strong>{{ clickValue }}</strong>, Multiplicador: <strong>x{{ clickMultiplier.toFixed(2) }}</strong></div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Automatizadores</h2>
        <div class="text-sm text-gray-600 mb-3">Generan puntos automáticamente cada segundo.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Auto Clickers: {{ autosCount }}</div>
            <div class="text-sm text-gray-600">+{{ format(autosCount * autoCps * speedMultiplier) }}/s</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Precio: {{ format(autoCost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-green-600 text-white rounded" @click="buyAutoQty(1)" :disabled="points < autoCost">1</button>
              <button class="px-2 py-1 text-sm bg-green-600/90 text-white rounded" @click="buyAutoQty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-green-700 text-white rounded" @click="buyAutoMax()">Max</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Mejora de click</h2>
        <div class="text-sm text-gray-600 mb-3">Aumentan el valor de cada click.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Nivel: {{ clickLevel }}</div>
            <div class="text-sm text-gray-600">+{{ Math.floor(clickValue * clickMultiplier) }} por click</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Precio: {{ format(clickUpgradeCost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-indigo-600 text-white rounded" @click="buyClickUpgradeQty(1)" :disabled="points < clickUpgradeCost">1</button>
              <button class="px-2 py-1 text-sm bg-indigo-600/90 text-white rounded" @click="buyClickUpgradeQty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-indigo-700 text-white rounded" @click="buyClickUpgradeMax()">Max</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Aceleración de ticks</h2>
        <div class="text-sm text-gray-600 mb-3">Reduce el tiempo entre ticks automáticos mejorando la velocidad del juego.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Compradas: {{ speedUpCount }}</div>
            <div class="text-sm text-gray-600">+{{ format(cps) }}/s totales</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Precio: {{ format(speedUpCost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-amber-600 text-white rounded" @click="buySpeedUpQty(1)" :disabled="points < speedUpCost || speedUpCount >= MAX_SPEED_UP">1</button>
              <button class="px-2 py-1 text-sm bg-amber-600/90 text-white rounded" @click="buySpeedUpQty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-amber-700 text-white rounded" @click="buySpeedUpMax()">Max</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Mejora Momentum</h2>
        <div class="text-sm text-gray-600 mb-3">Añade un multiplicador a los clicks en base en tus clicks.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Nivel: {{ momentumLevel }}</div>
            <div class="text-sm text-gray-600">Últimos clicks 5s: {{ clicksLast5s }}</div>
            <div class="text-sm text-gray-600"> x{{ momentumMultiplier.toFixed(2) }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Precio: {{ format(momentumCost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-pink-600 text-white rounded" @click="buyMomentumQty(1)" :disabled="points < momentumCost">1</button>
              <button class="px-2 py-1 text-sm bg-pink-600/90 text-white rounded" @click="buyMomentumQty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-pink-700 text-white rounded" @click="buyMomentumMax()">Max</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Mejora de puntos automáticos</h2>
        <div class="text-sm text-gray-600 mb-3">Mejora la formula de la mejora de puntos automáticos.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Compradas: {{ autoBonusCount }}</div>
            <div class="text-sm text-gray-600">+{{ autoBonusValue.toFixed(2) }}/s</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Precio: {{ format(autoBonusCost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-cyan-600 text-white rounded" @click="buyAutoBonusQty(1)" :disabled="points < autoBonusCost">1</button>
              <button class="px-2 py-1 text-sm bg-cyan-600/90 text-white rounded" @click="buyAutoBonusQty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-cyan-700 text-white rounded" @click="buyAutoBonusMax()">Max</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Mejora de la formula de los clicks</h2>
        <div class="text-sm text-gray-600 mb-3">Aumenta el multiplicador de la fórmula de click.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Compradas: {{ clickFormulaBump }}</div>
            <div class="text-sm text-gray-600">Multiplicador actual: x{{ (1.1 + clickFormulaBump * 0.01).toFixed(2) }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Precio: {{ format(clickFormulaBumpCost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-violet-600 text-white rounded" @click="buyClickFormulaBumpQty(1)" :disabled="points < clickFormulaBumpCost">1</button>
              <button class="px-2 py-1 text-sm bg-violet-600/90 text-white rounded" @click="buyClickFormulaBumpQty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-violet-700 text-white rounded" @click="buyClickFormulaBumpMax()">Max</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Potencia de puntos </h2>
        <div class="text-sm text-gray-600 mb-3">Añade +2 a la producción base de cada auto.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Compradas: {{ autoCpsBonus }}</div>
            <div class="text-sm text-gray-600">+{{ (autoCpsBonus * 2 * autosCount * speedMultiplier).toFixed(2) }}/s totales</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Precio: {{ format(autoCpsBonusCost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-orange-600 text-white rounded" @click="buyAutoCpsBonusQty(1)" :disabled="points < autoCpsBonusCost">1</button>
              <button class="px-2 py-1 text-sm bg-orange-600/90 text-white rounded" @click="buyAutoCpsBonusQty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-orange-700 text-white rounded" @click="buyAutoCpsBonusMax()">Max</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Mejora Sinérgica (Mejora 8)</h2>
        <div class="text-sm text-gray-600 mb-3">Coste base: 5,000,000. Cada compra aumenta el efecto de <strong>Mejora Momentum</strong> multiplicándolo por 2^(((Nivel de click × Nivel de esta mejora)/10) + 1). Escala de coste: 1.1× por compra.</div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-medium">Compradas: {{ upgrade8Count }}</div>
            <div class="text-sm text-gray-600">Efecto actual (multiplicador aplicado a Momentum): x{{ (Math.pow(2, ((clickLevel * upgrade8Count)/10) + 1)).toFixed(3) }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-700 mb-2">Coste: {{ format(upgrade8Cost) }}</div>
            <div class="flex gap-2">
              <button class="px-2 py-1 text-sm bg-emerald-600 text-white rounded" @click="buyUpgrade8Qty(1)" :disabled="points < upgrade8Cost">1</button>
              <button class="px-2 py-1 text-sm bg-emerald-600/90 text-white rounded" @click="buyUpgrade8Qty(5)">5</button>
              <button class="px-2 py-1 text-sm bg-emerald-700 text-white rounded" @click="buyUpgrade8Max()">Max</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="points >= 1000000000" class="mt-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
      <div class="text-sm text-yellow-800 dark:text-yellow-200">
        ¡Desbloqueado! <router-link to="/prestigio" class="font-semibold underline hover:opacity-75">Ir a Prestigio</router-link>
      </div>
    </div>

    <div class="mt-6 text-sm text-gray-500">
      <div>Guardado automático en el almacenamiento local del navegador.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'

const stored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

// Cargar bonificadores de prestigio
const prestige = ref(Number(stored('game_prestige', 0)) || 0)
const prestigeCpsBonus = computed(() => 1 + prestige.value * 0.05) // +5% CPS por token
const prestigeClickBonus = computed(() => 1 + prestige.value * 0.03) // +3% Click value por token

const points = ref(Number(stored('game_points', 0)) || 0)
const clickValue = ref(Number(stored('game_clickValue', 1)) || 1)
const clickLevel = ref(Number(stored('game_clickLevel', 0)) || 0)

const autosCount = ref(Number(stored('game_autosCount', 0)) || 0)
const autoCps = 1 // cada auto da 1 punto por segundo
const autoCpsBonus = ref(Number(stored('game_autoCpsBonus', 0)) || 0) // +2 per upgrade (mejora 7)

// New upgrades state
const speedUpCount = ref(Number(stored('game_speedUpCount', 0)) || 0) // reduce interval by 0.5% multiplicatively, max 99
const momentumLevel = ref(Number(stored('game_momentumLevel', 0)) || 0) // each level sets cap multiplier (level 1 => cap x3)
const autoBonusCount = ref(Number(stored('game_autoBonusCount', 0)) || 0) // formula: n * (sqrt(n) + 1)
const clickFormulaBump = ref(Number(stored('game_clickFormulaBump', 0)) || 0) // +0.01 to clickValue formula per upgrade (mejora 6)

// Nueva mejora 8 (base 5,000,000)
const upgrade8Count = ref(Number(stored('game_upgrade8Count', 0)) || 0)


// click history for last 20s
const clicksHistory = ref([])

// Maximum speedUp count: calculated when base^n reaches 1000 (99.9% cap)
// Mejora 3: ahora da +5% por compra (base = 1.05)
const SPEED_UP_BASE = 1.05
const MAX_SPEED_UP = Math.ceil(Math.log(1000) / Math.log(SPEED_UP_BASE))

const speedMultiplier = computed(() => {
  const uncappedMultiplier = Math.pow(SPEED_UP_BASE, speedUpCount.value)
  const cappedMultiplier = Math.min(uncappedMultiplier, 1000)
  return cappedMultiplier
})

const speedUpMultiplierPercent = computed(() => {
  return (speedMultiplier.value - 1) * 100
})

const autoBonusValue = computed(() => {
  if (autoBonusCount.value <= 0) return 0
  const n = autoBonusCount.value
  // Nueva fórmula: n * (sqrt(n) + 1)
  // ahora la mejora 5 incrementa un 20% más sobre su valor previo
  return n * (Math.sqrt(n) + 1) * 1.2
})

const cps = computed(() => {
  // autoCps base (1) + bonus (+2 per mejora 7) applied to each auto
  const baseCpsPerAuto = autoCps + autoCpsBonus.value * 2
  const baseAutos = autosCount.value * baseCpsPerAuto * speedMultiplier.value
  const bonusAutos = autoBonusValue.value
  // Apply prestige CPS bonus
  return (baseAutos + bonusAutos) * prestigeCpsBonus.value
})

const format = (v) => {
  if (v >= 1e9) return (v/1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v/1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v/1e3).toFixed(2) + 'k'
  return Math.floor(v)
}

const clicksLast20s = computed(() => {
  const now = Date.now()
  const cutoff = now - 20000
  clicksHistory.value = clicksHistory.value.filter(t => t >= cutoff)
  return clicksHistory.value.length
})

const clicksLast5s = computed(() => {
  const now = Date.now()
  const cutoff = now - 5000
  return clicksHistory.value.filter(t => t >= cutoff).length
})

const momentumMultiplier = computed(() => {
  if (momentumLevel.value <= 0) return 1
  // Base multiplier: starts at 3x, then scales by 1.05 per level
  // Formula: 3 * (1.05)^level
  const baseMult = 3 * Math.pow(1.05, momentumLevel.value)
  // Dynamic bonus based on clicks in last 5 seconds (max 5 clicks = full bonus)
  const ratio = Math.min(clicksLast5s.value / 5, 1)
  let result = 1 + (baseMult - 1) * ratio
  // Aplicar efecto de la nueva mejora (mejora base 5,000,000) si existe
  if (typeof upgrade8Count !== 'undefined' && upgrade8Count.value > 0) {
    // Fórmula modificada: multiplicador adicional = 2^(((clickLevel * upgrade8Count)/10) + 1)
    const extra = Math.pow(2, ((clickLevel.value * upgrade8Count.value) / 10) + 1)
    result *= extra
  }
  return result
})

const clickMultiplier = computed(() => {
  // Combina todos los multiplicadores aplicables al click manual
  // incluye: speedUp (reduce tiempo pero también suma a clicks), autoBonusCount (bonus automático), y momentum
  let totalMultiplier = momentumMultiplier.value
  // speedUp también contribuye al click (velocidad del juego)
  totalMultiplier *= speedMultiplier.value
  // autoBonusValue suma directamente al click en proporción a los autos (simplificado)
  if (autoBonusCount.value > 0) {
    totalMultiplier *= (1 + autoBonusValue.value / (clickValue.value * 10)) // normalized bonus
  }
  // Apply prestige click bonus
  totalMultiplier *= prestigeClickBonus.value
  return totalMultiplier
})

const gain = () => {
  // track click timestamp
  clicksHistory.value.push(Date.now())
  const amount = Math.floor(clickValue.value * clickMultiplier.value)
  points.value += amount
}

const autoCost = computed(() => Math.floor(10 * Math.pow(1.15, autosCount.value)))
const buyAuto = () => {
  const cost = autoCost.value
  if (points.value >= cost) {
    points.value -= cost
    autosCount.value += 1
  }
}

const clickUpgradeCost = computed(() => Math.floor(20 * Math.pow(2.1, clickLevel.value)))
const buyClickUpgrade = () => {
  const cost = clickUpgradeCost.value
  if (points.value >= cost) {
    points.value -= cost
    clickLevel.value += 1
    // Formula: floor(clickValue * (1.1 + clickFormulaBump * 0.01)) + 1
    const multiplier = 1.1 + clickFormulaBump.value * 0.01
    clickValue.value = Math.floor(clickValue.value * multiplier) + 1
  }
}

// Speed upgrade: base cost 200, scaling 1.2, max based on 99.9% cap
const speedUpCost = computed(() => {
  if (speedUpCount.value >= MAX_SPEED_UP) return Infinity
  return Math.floor(200 * Math.pow(1.2, speedUpCount.value))
})
const buySpeedUp = () => {
  if (speedUpCount.value >= MAX_SPEED_UP) return
  const cost = speedUpCost.value
  if (points.value >= cost) {
    points.value -= cost
    speedUpCount.value += 1
  }
}

// Momentum upgrade: base cost 2800, scaling x2 per level
const momentumCost = computed(() => Math.floor(2800 * Math.pow(2, momentumLevel.value)))
const buyMomentum = () => {
  const cost = momentumCost.value
  if (points.value >= cost) {
    points.value -= cost
    momentumLevel.value += 1
  }
}

// Auto Bonus upgrade: base cost 100, scaling 1.5x per purchase
const autoBonusCost = computed(() => Math.floor(100 * Math.pow(1.5, autoBonusCount.value)))
const buyAutoBonus = () => {
  const cost = autoBonusCost.value
  if (points.value >= cost) {
    points.value -= cost
    autoBonusCount.value += 1
  }
}

// Mejora 8: base 5,000,000, scaling menor (1.1x por compra)
const upgrade8Cost = computed(() => Math.floor(5000000 * Math.pow(1.1, upgrade8Count.value)))
const buyUpgrade8 = () => {
  const cost = upgrade8Cost.value
  if (points.value >= cost) {
    points.value -= cost
    upgrade8Count.value += 1
  }
}

// Click Formula Bump upgrade: base cost 200000, scaling 1.3x per purchase
// Each upgrade adds 0.01 to the clickValue multiplier (1.1 => 1.11, 1.12, etc.)
const clickFormulaBumpCost = computed(() => Math.floor(200000 * Math.pow(1.3, clickFormulaBump.value)))
const buyClickFormulaBump = () => {
  const cost = clickFormulaBumpCost.value
  if (points.value >= cost) {
    points.value -= cost
    clickFormulaBump.value += 1
    // Retroactive: apply bump immediately to current clickValue (increase by 1%)
    try {
      clickValue.value = Math.floor(clickValue.value * (1 + 0.01))
    } catch (e) {}
  }

}

// Auto CPS Bonus upgrade: base cost 1500000, scaling 1.5x per purchase
// Each upgrade adds +2 to base autoCps (1 => 3, 5, 7, etc.)
const autoCpsBonusCost = computed(() => Math.floor(1500000 * Math.pow(1.5, autoCpsBonus.value)))
const buyAutoCpsBonus = () => {
  const cost = autoCpsBonusCost.value
  if (points.value >= cost) {
    points.value -= cost
    autoCpsBonus.value += 1
  }
}

// Bulk purchase helpers
const buyAutoQty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < autoCost.value) break
    buyAuto()
  }
}
const buyAutoMax = () => {
  let safety = 10000
  while (points.value >= autoCost.value && safety-- > 0) buyAuto()
}

const buyClickUpgradeQty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < clickUpgradeCost.value) break
    buyClickUpgrade()
  }
}
const buyClickUpgradeMax = () => {
  let safety = 10000
  while (points.value >= clickUpgradeCost.value && safety-- > 0) buyClickUpgrade()
}

const buySpeedUpQty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < speedUpCost.value || speedUpCount.value >= MAX_SPEED_UP) break
    buySpeedUp()
  }
}
const buySpeedUpMax = () => {
  let safety = 10000
  while (points.value >= speedUpCost.value && speedUpCount.value < MAX_SPEED_UP && safety-- > 0) buySpeedUp()
}

const buyMomentumQty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < momentumCost.value) break
    buyMomentum()
  }
}
const buyMomentumMax = () => {
  let safety = 10000
  while (points.value >= momentumCost.value && safety-- > 0) buyMomentum()
}

const buyAutoBonusQty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < autoBonusCost.value) break
    buyAutoBonus()
  }
}
const buyAutoBonusMax = () => {
  let safety = 10000
  while (points.value >= autoBonusCost.value && safety-- > 0) buyAutoBonus()
}

const buyClickFormulaBumpQty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < clickFormulaBumpCost.value) break
    buyClickFormulaBump()
  }
}
const buyClickFormulaBumpMax = () => {
  let safety = 10000
  while (points.value >= clickFormulaBumpCost.value && safety-- > 0) buyClickFormulaBump()
}

const buyAutoCpsBonusQty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < autoCpsBonusCost.value) break
    buyAutoCpsBonus()
  }
}
const buyAutoCpsBonusMax = () => {
  let safety = 10000
  while (points.value >= autoCpsBonusCost.value && safety-- > 0) buyAutoCpsBonus()
}

const buyUpgrade8Qty = (qty = 1) => {
  for (let i = 0; i < qty; i++) {
    if (points.value < upgrade8Cost.value) break
    buyUpgrade8()
  }
}
const buyUpgrade8Max = () => {
  let safety = 10000
  while (points.value >= upgrade8Cost.value && safety-- > 0) buyUpgrade8()
}

let tickId = null
onMounted(() => {
  // tick every second and add cps (which already accounts for speedMultiplier)
  tickId = setInterval(() => {
    points.value += cps.value
  }, 1000)
})
onBeforeUnmount(() => {
  if (tickId) clearInterval(tickId)
})

watch([points, clickValue, clickLevel, autosCount, speedUpCount, momentumLevel, autoBonusCount, clickFormulaBump, autoCpsBonus, upgrade8Count], () => {
  try {
    localStorage.setItem('game_points', JSON.stringify(points.value))
    localStorage.setItem('game_clickValue', JSON.stringify(clickValue.value))
    localStorage.setItem('game_clickLevel', JSON.stringify(clickLevel.value))
    localStorage.setItem('game_autosCount', JSON.stringify(autosCount.value))
    localStorage.setItem('game_speedUpCount', JSON.stringify(speedUpCount.value))
    localStorage.setItem('game_momentumLevel', JSON.stringify(momentumLevel.value))
    localStorage.setItem('game_autoBonusCount', JSON.stringify(autoBonusCount.value))
    localStorage.setItem('game_clickFormulaBump', JSON.stringify(clickFormulaBump.value))
    localStorage.setItem('game_autoCpsBonus', JSON.stringify(autoCpsBonus.value))
    localStorage.setItem('game_upgrade8Count', JSON.stringify(upgrade8Count.value))
  } catch (e) {}
})

// Router helper (no export default) for the Settings button
const router = useRouter()
const goToSettings = () => {
  router.push('/settings')
}

</script>

<style scoped>
.game-root { max-width: 900px; margin: 0 auto; }
.points-display { text-align: left }
.card { border: 1px solid rgba(0,0,0,0.04) }
button:disabled { opacity: 0.5; cursor: not-allowed }
</style>
