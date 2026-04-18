<template>
  <div class="applications-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Reseller Applications</h1>
        <p class="view-subtitle">Review and manage reseller applications</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="refresh">
          <i class="fas fa-sync"></i> Refresh
        </button>
        <button class="btn btn-primary" @click="exportData">
          <i class="fas fa-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <StatCard 
        title="Pending Review"
        :value="stats.pending"
        icon="fa-clock"
        color="warning"
      />
      <StatCard 
        title="Approved Today"
        :value="stats.approvedToday"
        icon="fa-check-circle"
        color="success"
      />
      <StatCard 
        title="Total Applications"
        :value="stats.total"
        icon="fa-inbox"
        color="info"
      />
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.status" @change="applyFilters">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="under_review">Under Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <input 
        v-model="filters.search" 
        placeholder="Search by name or email..."
        @input="applyFilters"
      />
    </div>

    <!-- Applications Table -->
    <DataTable 
      :columns="columns"
      :data="filteredApplications"
      :loading="loading"
      @row-click="openDetails"
      @bulk-action="handleBulkAction"
    >
      <template #actions="{ row }">
        <div class="row-actions">
          <button 
            v-if="row.status === 'pending'" 
            class="btn btn-success btn-sm"
            @click.stop="approve(row.id)"
          >
            Approve
          </button>
          <button 
            v-if="row.status === 'pending'"
            class="btn btn-danger btn-sm"
            @click.stop="reject(row.id)"
          >
            Reject
          </button>
          <button class="btn btn-secondary btn-sm" @click.stop="viewDetails(row)">
            View
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Details Modal -->
    <Modal
      v-if="selectedApplication"
      :title="'Application Details'"
      @close="selectedApplication = null"
    >
      <ApplicationDetails
        :application="selectedApplication"
        @approve="approve"
        @reject="reject"
        @request-more-info="requestMoreInfo"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useResellerStore } from '../stores/resellerStore.js';
import StatCard from '../../../shared/components/StatCard.vue';
import DataTable from '../../../shared/components/DataTable.vue';
import Modal from '../../../shared/components/Modal.vue';
import ApplicationDetails from './ApplicationDetails.vue';

const store = useResellerStore();

const loading = ref(true);
const selectedApplication = ref(null);
const filters = ref({
  status: '',
  search: ''
});

// Define columns for DataTable
const columns = [
  { key: 'applicant_name', label: 'Applicant', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'instagram_handle', label: 'Instagram', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'apply_date', label: 'Applied', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' }
];

// Computed properties
const filteredApplications = computed(() => {
  return store.applications.filter(app => {
    const matchesStatus = !filters.value.status || app.status === filters.value.status;
    const matchesSearch = !filters.value.search || 
      app.applicant_name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      app.email.toLowerCase().includes(filters.value.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
});

const stats = computed(() => ({
  pending: store.applications.filter(a => a.status === 'pending').length,
  approvedToday: store.applications.filter(a => 
    a.status === 'approved' && 
    new Date(a.reviewed_at).toDateString() === new Date().toDateString()
  ).length,
  total: store.applications.length
}));

// Actions
async function fetchApplications() {
  loading.value = true;
  try {
    await store.fetchApplications();
  } catch (error) {
    console.error('Failed to fetch applications:', error);
  } finally {
    loading.value = false;
  }
}

function openDetails(application) {
  selectedApplication.value = application;
}

async function approve(id) {
  if (confirm('Approve this reseller application?')) {
    try {
      await store.approveApplication(id);
      store.toast.success('Application approved successfully!');
    } catch (error) {
      store.toast.error('Failed to approve application');
    }
  }
}

async function reject(id) {
  const reason = prompt('Enter rejection reason:');
  if (reason) {
    try {
      await store.rejectApplication(id, reason);
      store.toast.success('Application rejected');
    } catch (error) {
      store.toast.error('Failed to reject application');
    }
  }
}

function applyFilters() {
  // Already handled by computed property
}

function refresh() {
  fetchApplications();
}

function exportData() {
  store.exportApplications();
}

// Lifecycle
onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.applications-view {
  padding: 24px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.filters select,
.filters input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.row-actions {
  display: flex;
  gap: 8px;
}

.row-actions button {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
