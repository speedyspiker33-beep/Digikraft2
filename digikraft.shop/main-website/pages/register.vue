<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <form class="form" @submit.prevent="handleRegister">
      <p class="title">Register</p>
      <p class="message">Signup now and get full access to our app.</p>
      
      <div class="flex">
        <label>
          <input v-model="formData.firstName" class="input" type="text" placeholder="" required>
          <span>Firstname</span>
        </label>
        <label>
          <input v-model="formData.lastName" class="input" type="text" placeholder="" required>
          <span>Lastname</span>
        </label>
      </div>
      
      <label>
        <input v-model="formData.email" class="input" type="email" placeholder="" required>
        <span>Email</span>
      </label>
      
      <label>
        <input v-model="formData.password" class="input" type="password" placeholder="" required>
        <span>Password</span>
      </label>
      
      <label>
        <input v-model="formData.confirmPassword" class="input" type="password" placeholder="" required>
        <span>Confirm password</span>
      </label>
      
      <button class="submit" type="submit">Submit</button>
      
      <p class="signin">Already have an account? <NuxtLink to="/login">Signin</NuxtLink></p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const router = useRouter()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('Passwords do not match!')
    return
  }

  try {
    await authStore.register(
      `${formData.value.firstName} ${formData.value.lastName}`,
      formData.value.email,
      formData.value.password
    )
    router.push('/')
  } catch (error) {
    console.error('Registration failed:', error)
    alert('Registration failed. Please try again.')
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  background-color: #fff;
  padding: 20px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 28px;
  color: royalblue;
  font-weight: 600;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 30px;
}

.title::before,
.title::after {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  border-radius: 50%;
  left: 0px;
  background-color: royalblue;
}

.title::before {
  width: 18px;
  height: 18px;
  background-color: royalblue;
}

.title::after {
  width: 18px;
  height: 18px;
  animation: pulse 1s linear infinite;
}

.message,
.signin {
  color: rgba(88, 87, 87, 0.822);
  font-size: 14px;
}

.signin {
  text-align: center;
}

.signin a {
  color: royalblue;
  text-decoration: none;
}

.signin a:hover {
  text-decoration: underline royalblue;
}

.flex {
  display: flex;
  width: 100%;
  gap: 6px;
}

.form label {
  position: relative;
}

.form label .input {
  width: 100%;
  padding: 10px 10px 20px 10px;
  outline: 0;
  border: 1px solid rgba(105, 105, 105, 0.397);
  border-radius: 10px;
}

.form label .input + span {
  position: absolute;
  left: 10px;
  top: 15px;
  color: grey;
  font-size: 0.9em;
  cursor: text;
  transition: 0.3s ease;
}

.form label .input:placeholder-shown + span {
  top: 15px;
  font-size: 0.9em;
}

.form label .input:focus + span,
.form label .input:valid + span {
  top: 0px;
  font-size: 0.7em;
  font-weight: 600;
}

.form label .input:valid + span {
  color: green;
}

.submit {
  border: none;
  outline: none;
  background-color: royalblue;
  padding: 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  transition: 0.3s ease;
}

.submit:hover {
  background-color: rgb(56, 90, 194);
  cursor: pointer;
}

@keyframes pulse {
  from {
    transform: scale(0.9);
    opacity: 1;
  }
  to {
    transform: scale(1.8);
    opacity: 0;
  }
}
</style>
