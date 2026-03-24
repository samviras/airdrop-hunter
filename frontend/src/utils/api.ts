import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const scanWallet = async (addresses: string[], chains: string[] = ['ethereum']) => {
  const { data } = await api.post('/scan', { addresses, chains })
  return data
}

export const getAirdrops = async (status?: string) => {
  const { data } = await api.get('/airdrops', { params: status ? { status } : undefined })
  return data
}

export const getAirdrop = async (id: string) => {
  const { data } = await api.get(`/airdrops/${id}`)
  return data
}

export const login = async (email: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)
  const { data } = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return data
}

export const register = async (email: string, password: string) => {
  const { data } = await api.post('/auth/register', null, {
    params: { email, password }
  })
  return data
}

export const getWallets = async () => {
  const { data } = await api.get('/wallets')
  return data
}

export const addWallet = async (address: string, chain: string = 'ethereum', label?: string) => {
  const { data } = await api.post('/wallets', { address, chain, label })
  return data
}

export const deleteWallet = async (id: string) => {
  const { data } = await api.delete(`/wallets/${id}`)
  return data
}

export default api
