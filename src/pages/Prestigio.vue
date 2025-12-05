<template>
  <div class="game-root px-6 py-8">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Prestigio</h1>
      <div class="flex items-center gap-3">
        <router-link
          to="/"
          class="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
        >
          ← Volver al Juego
        </router-link>
        <ThemeToggle />
      </div>
    </div>

    <div class="mb-4">
      <div
        class="points-display p-4 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm"
      >
        <div class="text-sm text-gray-500">Puntos Totales</div>
        <div class="text-4xl font-bold">{{ format(totalPoints) }}</div>
        <div class="text-sm text-gray-600">
          Prestige Tokens: <strong>{{ prestigeTokens }}</strong>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Sistema de Prestigio</h2>
        <div class="text-sm text-gray-600 mb-3">
          Reinicia tu progreso y obtén bonificadores permanentes.
        </div>

        <div class="space-y-3">
          <div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Fórmula: ⌊√(puntos totales) / 100⌋
            </div>
            <div class="text-lg font-medium mt-1">
              Ganarías: +{{ prestigeTokens }} tokens
            </div>
          </div>
          <button
            v-if="totalPoints >= 1000000000"
            class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            @click="resetPrestige"
          >
            Ascender (Reset)
          </button>
          <div v-else class="text-sm text-red-600">
            Requiere 1,000,000,000 puntos
          </div>
        </div>
      </div>

      <div class="card p-4 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm">
        <h2 class="font-semibold mb-2">Tokens Acumulados: {{ prestige }}</h2>
        <div class="text-sm text-gray-600 mb-3">
        </div>
        <div class="space-y-3">
          <div>
          </div>
          <div class="mt-2">
            <h3 class="font-medium mb-2">Mejoras de Prestigio</h3>
            <div class="space-y-2">
              <div
                v-for="u in upgrades"
                :key="u.id"
                class="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800/60 border"
              >
                <div>
                  <div class="font-medium">
                    {{ u.name }}
                    <span class="text-xs text-gray-500"
                      >(Nivel {{ u.level
                      }}<span v-if="u.maxLevel">/{{ u.maxLevel }}</span
                      >)</span
                    >
                  </div>
                  <div class="text-xs text-gray-600">{{ u.desc }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-sm text-gray-700">
                    Costo: {{ currentUpgradeCost(u) }}
                  </div>
                  <button
                    class="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                    :disabled="
                      prestige < currentUpgradeCost(u) ||
                      (u.maxLevel && u.level >= u.maxLevel)
                    "
                    @click="buyUpgrade(u)"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 text-sm text-gray-500">
      <div>
        Tu progreso en el juego será reseteado, pero mantendrás los
        bonificadores de prestigio.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const stored = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

// Cargar datos de prestigio
const prestige = ref(Number(stored("game_prestige", 0)) || 0);

// Cargar puntos totales acumulados (incluyendo resets anteriores)
const totalPointsFromPrestige = ref(
  Number(stored("game_totalPointsFromPrestige", 0)) || 0
);

// Puntos actuales del juego
const currentGamePoints = ref(Number(stored("game_points", 0)) || 0);

const totalPoints = computed(
  () => totalPointsFromPrestige.value + currentGamePoints.value
);

// Reducir bastante la ganancia base de tokens: antes /100, ahora /1000
const prestigeTokens = computed(() =>
  Math.floor(Math.sqrt(totalPoints.value) / 1000)
);

const format = (v) => {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(2) + "k";
  return Math.floor(v);
};

// --- Mejoras de Prestigio (compradas con tokens) ---
const savedUpgrades = stored("prestige_upgrades", {}) || {};

const upgrades = ref([
  {
    id: "u1",
    name: "Maestría de Autos",
    desc: "+5% CPS por nivel",
    baseCost: 1,
    level: Number(savedUpgrades.u1 || 0),
    effectType: "cps",
    effect: 0.05,
  },
  {
    id: "u2",
    name: "Conocimiento del Click",
    desc: "+4% Click Value por nivel",
    baseCost: 1,
    level: Number(savedUpgrades.u2 || 0),
    effectType: "click",
    effect: 0.04,
  },
  {
    id: "u3",
    name: "Eficiencia de Prestigio",
    desc: "Reduce levemente la cantidad requerida para ascender",
    baseCost: 10,
    level: Number(savedUpgrades.u3 || 0),
    maxLevel: 5,
    effectType: "reduceReq",
    effect: 0.03,
  },
  // Mejoras que desbloquean efecto por token (deben comprarse)
  {
    id: "t1",
    name: "Bonificación por Token (CPS)",
    desc: "Desbloquea +2% CPS por token por nivel",
    baseCost: 1,
    level: Number(savedUpgrades.t1 || 0),
    effectType: "tokenCps",
    effect: 0.02,
  },
  {
    id: "t2",
    name: "Bonificación por Token (Click)",
    desc: "Desbloquea +1.5% Click Value por token por nivel",
    baseCost: 1,
    level: Number(savedUpgrades.t2 || 0),
    effectType: "tokenClick",
    effect: 0.015,
  },
]);

const saveUpgrades = () => {
  const obj = {};
  upgrades.value.forEach((u) => {
    obj[u.id] = u.level;
  });
  try {
    localStorage.setItem("prestige_upgrades", JSON.stringify(obj));
  } catch (e) {}
};

const upgradesCpsMultiplier = computed(() => {
  let add = 0;
  upgrades.value.forEach((u) => {
    if (u.effectType === "cps") add += u.level * u.effect;
  });
  return 1 + add;
});

const upgradesClickMultiplier = computed(() => {
  let add = 0;
  upgrades.value.forEach((u) => {
    if (u.effectType === "click") add += u.level * u.effect;
  });
  return 1 + add;
});

// Efecto por token desbloqueable
const tokenCpsPerToken = computed(() => {
  let add = 0;
  upgrades.value.forEach((u) => {
    if (u.effectType === "tokenCps") add += u.level * u.effect;
  });
  return add;
});

const tokenClickPerToken = computed(() => {
  let add = 0;
  upgrades.value.forEach((u) => {
    if (u.effectType === "tokenClick") add += u.level * u.effect;
  });
  return add;
});

const prestigeCpsMultiplier = computed(
  () => 1 + prestige.value * tokenCpsPerToken.value
);
const prestigeClickMultiplier = computed(
  () => 1 + prestige.value * tokenClickPerToken.value
);

const effectiveCpsMultiplier = computed(
  () => prestigeCpsMultiplier.value * upgradesCpsMultiplier.value
);
const effectiveClickMultiplier = computed(
  () => prestigeClickMultiplier.value * upgradesClickMultiplier.value
);

const currentUpgradeCost = (u) => {
  const level = u.level || 0;
  const base = u.baseCost || 1;
  return Math.ceil(base * Math.pow(1.1, level));
};

const buyUpgrade = (u) => {
  if (u.maxLevel && u.level >= u.maxLevel) return;
  const cost = currentUpgradeCost(u);
  if (prestige.value < cost) return;
  prestige.value -= cost;
  u.level += 1;
  try {
    localStorage.setItem("game_prestige", JSON.stringify(prestige.value));
  } catch (e) {}
  saveUpgrades();
};

const resetPrestige = () => {
  // Requisito de ascenso base
  const baseRequirement = 1000000000;
  // Si se han comprado mejoras que reducen el requisito, aplicarlas
  const reduceFactor = upgrades.value.reduce(
    (acc, u) => (u.effectType === "reduceReq" ? acc + u.level * u.effect : acc),
    0
  );
  const effectiveRequirement = Math.max(
    1000000,
    Math.floor(baseRequirement * (1 - reduceFactor))
  );

  if (totalPoints.value < effectiveRequirement) return;

  // Sumar puntos actuales a totalPointsFromPrestige
  const newTotal = totalPointsFromPrestige.value + currentGamePoints.value;

  // Calcular y añadir nuevos tokens usando la misma fórmula reducida
  const newTokens = Math.floor(Math.sqrt(totalPoints.value) / 1000);
  const updatedPrestige = prestige.value + newTokens;

  // Guardar datos de prestigio
  try {
    localStorage.setItem("game_prestige", JSON.stringify(updatedPrestige));
    localStorage.setItem(
      "game_totalPointsFromPrestige",
      JSON.stringify(newTotal)
    );
    // Resetear puntos del juego (pero mantener otros datos si es necesario)
    localStorage.setItem("game_points", "0");
  } catch (e) {}

  // Volver al juego
  router.push("/");
  window.location.reload(); // Recargar para aplicar los cambios
};
</script>

<style scoped>
.game-root {
  max-width: 900px;
  margin: 0 auto;
}
.points-display {
  text-align: left;
}
.card {
  border: 1px solid rgba(0, 0, 0, 0.04);
}
</style>
