import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Debug from './pages/debug'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Debug/>
  </StrictMode>,
)








// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import Main from './pages/Main'
// import Debug from './pages/debug'


// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Main/>
//     <Debug/>
//   </StrictMode>,
// )
