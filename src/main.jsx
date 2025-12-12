import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LoadingReport from './components/LoadingReport.jsx'
import Loading from "./components/Loading.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingReport />
    <Loading />
  </StrictMode>,
)
