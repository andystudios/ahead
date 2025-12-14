import React from 'react'
import { createRoot } from 'react-dom/client'
import { DISABLE_COOKIES } from './config'
import { setInfoModalSeen } from './cookies'
import { trackModalOpened } from './tracking'
import InfoModalBlood from '../components/InfoModalBlood'
import InfoModalImage from '../components/InfoModalImage'
import InfoModalRadiology from '../components/InfoModalRadiology'

const sanitizeKey = (value = 'default') =>
  String(value).replace(/[^a-z0-9]/gi, '')

export const prepareInfoModal = (options = {}) => {
  const {
    ModalComponent: ModalContent,
    modalId,
    hostSelector,
    hostClass = 'info-host',
    triggerClass = 'info-trigger',
    triggerText = 'i',
    triggerLabel = 'Open info modal',
    shouldAttach = () => true,
  } = options

  let modalRoot = null
  let modalContainer = null
  let isOpen = false

  const modalKey = sanitizeKey(modalId || triggerClass || 'default')
  const attachedKey = `infoTriggerAttached${modalKey}`
  const styleId = `info-trigger-styles-${modalKey}`

  const ensureModalRoot = () => {
    if (modalRoot) return
    modalContainer = document.createElement('div')
    modalContainer.setAttribute('data-modal', modalId || 'info')
    document.body.appendChild(modalContainer)
    modalRoot = createRoot(modalContainer)
  }

  const renderModal = () => {
    if (!modalRoot) return
    if (!ModalContent) return
    modalRoot.render(
      <ModalContent isOpen={isOpen} onClose={() => closeModal()} />,
    )
  }

  const openModal = () => {
    ensureModalRoot()
    isOpen = true
    renderModal()
    trackModalOpened({ modalId: modalKey, source: modalId })
    if (!DISABLE_COOKIES) {
      setInfoModalSeen(modalKey)
    }
  }

  const closeModal = () => {
    isOpen = false
    renderModal()
  }

  const attachTriggerStyles = () => {
    if (document.getElementById(styleId)) return
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .${hostClass} {
        position: relative;
      }
      .${triggerClass} {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        border: 1px solid #d7d7d7;
        background: #ffffff;
        color: #3b3b3b;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 120ms ease, color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        padding: 0;
      }
      .${triggerClass}:hover {
        background: #f3f3f3;
        border-color: #cfcfcf;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
      }
      .${triggerClass}:focus-visible {
        outline: 2px solid #6c5ce7;
        outline-offset: 2px;
      }
    `
    document.head.appendChild(style)
  }

  const attachTriggers = () => {
    if (typeof document === 'undefined') return
    if (!shouldAttach()) return
    if (!hostSelector) return

    attachTriggerStyles()

    const targets = Array.from(document.querySelectorAll(hostSelector))
    targets.forEach((el) => {
      if (el.dataset[attachedKey]) return
      el.dataset[attachedKey] = 'true'
      el.classList.add(hostClass)

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = triggerClass
      btn.textContent = triggerText
      btn.setAttribute('aria-label', triggerLabel)
      btn.addEventListener('click', () => openModal())

      el.appendChild(btn)
    })
  }

  return {
    attachTriggers,
    openModal,
    closeModal,
  }
}

export const createBloodInfoModal = (options = {}) =>
  prepareInfoModal({
    ModalComponent: InfoModalBlood,
    modalId: 'blood-info',
    hostSelector:
      'div[aria-label="Blood biomarkers"] [role="status"], div[aria-label="Blood"] [role="status"]',
    ...options,
  })

export const createImageInfoModal = (options = {}) =>
  prepareInfoModal({
    ModalComponent: InfoModalImage,
    modalId: 'image-info',
    hostSelector: 'div[aria-label="Imaging markers"] [role="status"]',
    ...options,
  })

export const createRadiologyInfoModal = (options = {}) =>
  prepareInfoModal({
    ModalComponent: InfoModalRadiology,
    modalId: 'radiology-info',
    ...options,
  })

export const {
  attachTriggers: attachBloodInfoTriggers,
  openModal: openBloodInfoModal,
  closeModal: closeBloodInfoModal,
} = createBloodInfoModal({
  hostSelector:
    'div[aria-label="Blood biomarkers"] [role="status"], section[aria-label="Blood"] [role="status"]',
  hostClass: 'blood-info-host',
  triggerClass: 'blood-info-trigger',
  triggerText: 'i',
  triggerLabel: 'Learn more about blood biomarkers',
  shouldAttach: () =>
    typeof window !== 'undefined' &&
    window.location.pathname.endsWith('report.html'),
})

export const {
  attachTriggers: attachImageInfoTriggers,
  openModal: openImageInfoModal,
  closeModal: closeImageInfoModal,
} = createImageInfoModal({
  hostSelector: 'div[aria-label="Imaging markers"] [role="status"]',
  hostClass: 'image-info-host',
  triggerClass: 'image-info-trigger',
  triggerText: 'i',
  triggerLabel: 'Learn more about image-derived parameters',
  shouldAttach: () =>
    typeof window !== 'undefined' &&
    window.location.pathname.endsWith('report.html'),
})

export const {
  attachTriggers: attachRadiologyInfoTriggers,
  openModal: openRadiologyInfoModal,
  closeModal: closeRadiologyInfoModal,
} = createRadiologyInfoModal({
  hostSelector: 'div[aria-label="Radiology Findings"] [role="status"]',
  hostClass: 'status-info-host',
  triggerClass: 'status-info-trigger',
  triggerText: 'i',
  triggerLabel: 'Learn more about finding classification',
  shouldAttach: () =>
    typeof window !== 'undefined' &&
    window.location.pathname.endsWith('report.html'),
})
