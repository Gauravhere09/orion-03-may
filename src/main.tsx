import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initEmailJS } from './utils/emailjs'

// Initialize EmailJS before rendering the app
initEmailJS();

createRoot(document.getElementById("root")!).render(<App />);
