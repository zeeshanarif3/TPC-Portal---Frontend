import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import ThemeProvider from './theme/ThemeContext'
import Debug from './pages/debug'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Debug />
    </ThemeProvider>
  </StrictMode>,
)








// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'

// import ThemeProvider from './theme/ThemeContext'
// import Main from './pages/Main'


// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <ThemeProvider>
//       <Main />
//     </ThemeProvider>
//   </StrictMode>,
// )
