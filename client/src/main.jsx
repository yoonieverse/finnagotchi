import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Budget } from './pages/Budget.jsx'

import { Log } from './pages/Log.jsx'
import { Plaid } from './pages/Plaid.jsx'
import { Portfolio } from './pages/Portfolio.jsx'

import { Home } from './pages/Home.jsx'
import { SignUp } from './pages/Signup.jsx'
import { Settings } from './pages/Settings.jsx'

const router = createBrowserRouter([
  {
    path:"/",
    element: <App/>,
    children:[
      {
        path:"/budget",
        element: <Budget/>
      },
      {
        path:"/home",
        element: <Home/>
      },
      {
        path:"/log",
        element: <Log/>
      },
      {
        path:"/plaid",
        element: <Plaid/>
      },
      {
        path:"/portfolio",
        element: <Portfolio/>
      },
      {
        path:"/signup",
        element: <SignUp/>
      },
      {
        path:"/settings",
        element: <Settings/>
      }

    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>

    <RouterProvider router={router}/>
  </StrictMode>
)
