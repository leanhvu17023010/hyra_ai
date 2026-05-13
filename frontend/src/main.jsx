import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './routes'
import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
)
