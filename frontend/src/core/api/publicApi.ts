// src/api/publicApi.ts
import axios from "axios"

const apiURL = import.meta.env.VITE_API_URL

  const publicApi = axios.create({
  baseURL: apiURL,
  withCredentials: true, // needed for refresh cookies
  headers: {
    "Content-Type": "application/json",
  },
})


export default publicApi