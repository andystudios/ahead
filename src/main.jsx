import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LoadingReport from './components/LoadingReport.jsx'
import Loading from './components/Loading.jsx'
import { DISABLE_LOADING_MESSAGES } from './libs/config'
import { attachRevealElementButton } from './libs/revealElementButton'
import {
  getMissingTargetEvents,
  getRevealClickEvents,
  getSkipEvents,
} from './libs/tracking'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {!DISABLE_LOADING_MESSAGES && (
      <>
        <LoadingReport />
        <Loading />
      </>
    )}
  </StrictMode>,
)

const initRevealButtons = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!window.location.pathname.endsWith('report.html')) return

  const revealTargets = [
    { targetId: 'brain-volumetry', buttonText: 'Reveal your brain volumetry data' },
    { targetId: 'lipid-blood', buttonText: 'Reveal lipid blood panel' },
    { targetId: 'abdominal-body', buttonText: 'Reveal abdominal body composition MRI' },
    { targetId: 'sugar-control', buttonText: 'Reveal sugar control blood' },
    { targetId: 'quantitative-liver', buttonText: 'Reveal quantitative liver measurement MRI' },
    { targetId: 'electrolytes', buttonText: 'Reveal electrolytes & minerals' },
    { targetId: 'filtration', buttonText: 'Reveal filtration function' },
    { targetId: 'white-blood', buttonText: 'Reveal white blood cells' },
    { targetId: 'red-blood', buttonText: 'Reveal red blood cells' },
    { targetId: 'iron-status', buttonText: 'Reveal iron status' },
    { targetId: 'liver-blood', buttonText: 'Reveal liver blood panel' },
    { targetId: 'spine-muscles', buttonText: 'Reveal spine muscles MRI' },
    { targetId: 'inflamation', buttonText: 'Reveal inflammation' },
    { targetId: 'endocrine', buttonText: 'Reveal endocrine health' },
  ]

  revealTargets.forEach(attachRevealElementButton)
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealButtons, {
      once: true,
    })
  } else {
    initRevealButtons()
  }
}

if (typeof window !== 'undefined') {
  window.showLog = () => {
    const reveal = getRevealClickEvents()
    const missing = getMissingTargetEvents()
    const skips = getSkipEvents()

    const openGroup =
      console.groupCollapsed || console.group || console.log.bind(console)
    const closeGroup = console.groupEnd || (() => {})
    const logTable = console.table || console.log.bind(console)

    openGroup('[Tracking] reveal clicks')
    logTable(reveal)
    closeGroup()

    openGroup('[Tracking] missing targets')
    logTable(missing)
    closeGroup()

    openGroup('[Tracking] skip events')
    logTable(skips)
    closeGroup()

    return { reveal, missing, skips }
  }
}
