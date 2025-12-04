<template>
  <div class="px-6 py-8">
    <h1 class="text-2xl font-semibold mb-4">Configuración</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Guardar / Cargar partida</h2>
        <div class="text-sm text-gray-600 mb-3">Exporta tu partida a un archivo JSON, o importa una partida guardada.</div>
        <div class="space-y-2">
          <button class="px-4 py-2 bg-green-600 text-white rounded" @click="exportSave">Exportar (.json)</button>
          <div>
            <input ref="fileInput" type="file" accept="application/json" @change="onFileChange" />
          </div>
          <div>
            <button class="px-4 py-2 bg-blue-600 text-white rounded" @click="importSave" :disabled="!importData">Importar selección</button>
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Borrar datos</h2>
        <div class="text-sm text-gray-600 mb-3">Elimina todos los datos guardados relacionados con el juego.</div>
        <div class="space-y-2">
          <button class="px-4 py-2 bg-red-600 text-white rounded" @click="clearSave">Borrar datos guardados</button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <router-link to="/" class="text-sm underline">← Volver al juego</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fileInput = ref(null)
const importData = ref(null)

const keys = [
  'game_points','game_clickValue','game_clickLevel','game_autosCount','game_speedUpCount','game_momentumLevel','game_autoBonusCount','game_clickFormulaBump','game_autoCpsBonus','game_prestige','game_totalPointsFromPrestige'
]

function exportSave() {
  const obj = {}
  keys.forEach(k => {
    try { obj[k] = JSON.parse(localStorage.getItem(k)) } catch { obj[k] = localStorage.getItem(k) }
  })
  const dataStr = JSON.stringify(obj, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'save.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function onFileChange(e) {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      importData.value = JSON.parse(reader.result)
      alert('Archivo cargado correctamente. Pulsa "Importar" para aplicar.')
    } catch (err) {
      alert('Archivo inválido')
      importData.value = null
    }
  }
  reader.readAsText(f)
}

function importSave() {
  if (!importData.value) return
  // Validate basic structure
  try {
    Object.keys(importData.value).forEach(k => {
      if (keys.includes(k)) {
        localStorage.setItem(k, JSON.stringify(importData.value[k]))
      }
    })
    alert('Partida importada. Se recargará la página para aplicar los cambios.')
    window.location.reload()
  } catch (e) {
    alert('Error al importar')
  }
}

function clearSave() {
  if (!confirm('¿Seguro que quieres borrar los datos guardados? Esta acción no se puede deshacer.')) return
  keys.forEach(k => localStorage.removeItem(k))
  alert('Datos borrados. Recargando...')
  window.location.reload()
}
</script>

<style scoped>
.card { border: 1px solid rgba(0,0,0,0.04) }
</style>
