import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './lib/tanstack/client.js'
import './index.css'
import App from './App.jsx'
import { runPageTransition } from './utils/pageTransition.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '3px solid black',
            boxShadow: '4px 4px 0px black',
            borderRadius: '0',
            fontWeight: 'bold',
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
)

window.addEventListener('load', () => {
  setTimeout(() => {
    runPageTransition();
  }, 100);
});