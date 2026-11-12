import { createContext } from 'react'

// Guarda o usuário logado para qualquer componente usar, sem passar props por vários níveis
export const AuthContext = createContext(null)
