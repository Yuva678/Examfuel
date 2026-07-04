import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ui/ThemeProvider.tsx'
import { supabase } from './lib/supabase.ts'

// Verify Supabase connection on app start
supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.error('❌ Supabase connection failed:', error.message)
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="examfuel-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
