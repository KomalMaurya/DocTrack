import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Make sure this points to your main App file
import './index.css'        // This line imports your global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

