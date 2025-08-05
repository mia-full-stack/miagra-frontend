import axios from "axios"

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Интерцептор для добавления токена к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error("❌ Request error:", error)
    return Promise.reject(error)
  },
)

// Интерцептор для обработки ответов
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data)

    // Если токен недействителен, перенаправляем на логин
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

export default apiClient
