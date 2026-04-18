<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: iconBg, color: iconColor }">
      <i :class="'fas ' + icon"></i>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ formattedValue }}</div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="change !== null" :class="['stat-change', changeType]">
        <i :class="'fas ' + changeIcon"></i>
        {{ formattedChange }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: '#4F46E5'
  },
  iconBg: {
    type: String,
    default: 'rgba(79, 70, 229, 0.1)'
  },
  change: {
    type: [String, Number],
    default: null
  },
  valueType: {
    type: String,
    default: 'text', // text, currency, number, percent
  }
});

const formattedValue = computed(() => {
  switch (props.valueType) {
    case 'currency':
      return '₹' + Number(props.value).toLocaleString();
    case 'number':
      return Number(props.value).toLocaleString();
    case 'percent':
      return props.value + '%';
    default:
      return props.value;
  }
});

const changeType = computed(() => {
  if (props.change == null) return '';
  return Number(props.change) >= 0 ? 'positive' : 'negative';
});

const changeIcon = computed(() => {
  return Number(props.change) >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
});

const formattedChange = computed(() => {
  if (props.change == null) return '';
  const abs = Math.abs(Number(props.change));
  return abs + '% vs last month';
});
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 16px;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.stat-change.positive {
  color: var(--success);
  background: var(--success-bg);
}

.stat-change.negative {
  color: var(--danger);
  background: var(--danger-bg);
}

@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
    margin-right: 12px;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .stat-change {
    font-size: 11px;
  }
}
</style>
