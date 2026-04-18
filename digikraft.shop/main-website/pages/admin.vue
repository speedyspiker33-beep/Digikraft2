<template>
  <div class="container mx-auto px-6 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p class="text-gray-600 mb-8">Manage your DigiKraft store</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink to="/admin/products" class="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary transition-colors">
          <span class="material-symbols-outlined text-3xl text-primary">inventory_2</span>
          <p class="font-medium mt-2">Products</p>
        </NuxtLink>
        <NuxtLink to="/admin/orders" class="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary transition-colors">
          <span class="material-symbols-outlined text-3xl text-primary">receipt_long</span>
          <p class="font-medium mt-2">Orders</p>
        </NuxtLink>
        <NuxtLink to="/admin/users" class="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary transition-colors">
          <span class="material-symbols-outlined text-3xl text-primary">people</span>
          <p class="font-medium mt-2">Users</p>
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary transition-colors">
          <span class="material-symbols-outlined text-3xl text-primary">settings</span>
          <p class="font-medium mt-2">Settings</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Admin - DigiKraft'
})
</script>
