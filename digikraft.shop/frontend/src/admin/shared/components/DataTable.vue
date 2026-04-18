<template>
  <div class="data-table">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading data...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data || data.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <h3>No data found</h3>
      <p>{{ emptyMessage }}</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table :class="['table', bordered ? 'table-bordered' : '', striped ? 'table-striped' : '']">
        <thead>
          <tr>
            <th v-if="selectable" class="checkbox-col">
              <input 
                type="checkbox" 
                :checked="allSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th 
              v-for="col in columns" 
              :key="col.key"
              :class="[
                'sortable-' + col.sortable,
                'align-' + col.align,
                { 'sorting': sortKey === col.key }
              ]"
              @click="col.sortable ? sortBy(col.key) : null"
            >
              {{ col.label }}
              <i v-if="col.sortable" class="fas fa-sort"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, index) in paginatedData" 
            :key="rowKey(row, index)"
            :class="{ 'selected': isRowSelected(row) }"
            @click="$emit('row-click', row)"
          >
            <td v-if="selectable" class="checkbox-col" @click.stop>
              <input 
                type="checkbox" 
                :checked="isRowSelected(row)"
                @change="toggleRowSelection(row)"
              />
            </td>
            <td 
              v-for="col in columns" 
              :key="col.key"
              :class="['align-' + col.align]"
            >
              <!-- Custom slot or default rendering -->
              <slot 
                v-if="$slots[col.key]" 
                :name="col.key" 
                :row="row" 
                :value="row[col.key]"
              ></slot>
              <span v-else>{{ formatCell(row[col.key], col) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="paginated" class="table-footer">
      <div class="pagination-info">
        Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} items
      </div>
      <div class="pagination">
        <button 
          :disabled="currentPage <= 1" 
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button 
          v-for="page in displayedPages" 
          :key="page"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <button 
          :disabled="currentPage >= totalPages" 
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    default: () => []
  },
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No data to display'
  },
  selectable: {
    type: Boolean,
    default: false
  },
  paginated: {
    type: Boolean,
    default: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  bordered: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: true
  },
  rowKey: {
    type: Function,
    default: (row, index) => index
  },
  initialSort: {
    type: Object,
    default: () => ({ key: null, direction: 'asc' })
  }
});

const emit = defineEmits([
  'row-click',
  'sort',
  'select',
  'bulk-action',
  'page-change'
]);

// Selection
const selectedRows = ref([]);
const allSelected = ref(false);

// Pagination
const currentPage = ref(1);

// Sorting
const sortKey = ref(props.initialSort.key);
const sortDirection = ref(props.initialSort.direction);

// Computed
const sortedData = computed(() => {
  if (!sortKey.value) return [...props.data];
  
  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
});

const paginatedData = computed(() => {
  if (!props.paginated) return sortedData.value;
  
  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return sortedData.value.slice(start, end);
});

const totalItems = computed(() => props.data.length);
const totalPages = computed(() => Math.ceil(totalItems.value / props.pageSize));
const startItem = computed(() => (currentPage.value - 1) * props.pageSize + 1);
const endItem = computed(() => Math.min(currentPage.value * props.pageSize, totalItems.value));

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let end = Math.min(totalPages.value, start + maxPages - 1);
  
  start = Math.max(1, end - maxPages + 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Methods
function isRowSelected(row) {
  return selectedRows.value.includes(props.rowKey(row));
}

function toggleRowSelection(row) {
  const key = props.rowKey(row);
  const index = selectedRows.value.indexOf(key);
  
  if (index > -1) {
    selectedRows.value.splice(index, 1);
  } else {
    selectedRows.value.push(key);
  }
  
  emit('select', selectedRows.value);
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedRows.value = [];
  } else {
    selectedRows.value = props.data.map(props.rowKey);
  }
  
  emit('select', selectedRows.value);
}

function sortBy(key) {
  if (key === sortKey.value) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'asc';
  }
  
  emit('sort', { key: sortKey.value, direction: sortDirection.value });
}

function changePage(page) {
  currentPage.value = page;
  emit('page-change', page);
}

function formatCell(value, column) {
  if (value == null) return '-';
  
  const type = column.type || 'text';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'currency':
      return '₹' + Number(value).toLocaleString();
    case 'status':
      return `<span class="status-badge status-${value}">${value}</span>`;
    case 'boolean':
      return value ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-times-circle text-danger"></i>';
    default:
      return value;
  }
}

watch(() => props.data, () => {
  selectedRows.value = [];
  currentPage.value = 1;
});

// Expose methods for parent component
defineExpose({
  selectedRows,
  refresh: () => {
    selectedRows.value = [];
    currentPage.value = 1;
  }
});
</script>

<style scoped>
.data-table {
  width: 100%;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.loading-state i, .empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--primary);
}

.empty-state h3 {
  margin-bottom: 8px;
  color: var(--text-primary);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
}

.table th {
  background: var(--bg-secondary);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.table th.sortable-true {
  cursor: pointer;
  user-select: none;
}

.table th.sortable-true:hover {
  background: var(--hover-bg);
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.table-striped tbody tr:nth-child(even) {
  background: var(--bg-secondary);
}

.table-bordered th,
.table-bordered td {
  border: 1px solid var(--border-color);
}

.table tr:hover {
  background: var(--hover-bg);
}

.table tr.selected {
  background: var(--selected-bg);
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination {
  display: flex;
  gap: 4px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  background: var(--hover-bg);
}

.pagination button.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: var(--warning-bg);
  color: var(--warning);
}

.status-approved,
.status-success {
  background: var(--success-bg);
  color: var(--success);
}

.status-rejected,
.status-error {
  background: var(--danger-bg);
  color: var(--danger);
}

@media (max-width: 768px) {
  .table {
    font-size: 14px;
  }
  
  .table th,
  .table td {
    padding: 8px 12px;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
