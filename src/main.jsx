import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SnackbarProvider } from "notistack";
import { AppProvider } from './context/AppContext.jsx'
import { ReviewProvider } from './context/ReviewContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <ReviewProvider>
        <CartProvider>
          <NotificationProvider>
            <SnackbarProvider
              maxSnack={4}
              autoHideDuration={3000}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              preventDuplicate>
              <App />
            </SnackbarProvider>
          </NotificationProvider>
        </CartProvider>
      </ReviewProvider>
    </AppProvider>
  </BrowserRouter>,
)
