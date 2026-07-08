// ============================================
// api/axios.js — Configured Axios Instance
// Uses environment variable for base URL
// Works both in development and production
// ============================================

import axios from 'axios'

// In development → Vite proxy handles /api → localhost:5000
// In production  → VITE_API_URL points to Render backend
const baseURL = import.meta.env.VITE_API_URL || '/api'

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor — attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API