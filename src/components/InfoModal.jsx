import React from 'react'
import './InfoModal.css'

const InfoModal = ({
  isOpen = false,
  onClose,
  title,
  eyebrow = 'Reference',
  sections = [],
  asideTitle,
  asideBody,
}) => {
  if (!isOpen) return null

  return (
    <div className="info-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
      <div className="info-modal">
        <header className="info-modal__header">
          <div>
            <p className="info-modal__eyebrow">{eyebrow}</p>
            <h2 id="info-modal-title" className="info-modal__title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="info-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="info-modal__body">
          <div className="info-modal__sections">
            {sections.map((section) => (
              <section key={section.title} className="info-modal__section">
                <h3 className="info-modal__section-title">{section.title}</h3>
                {section.body && (
                  <p className="info-modal__section-text">{section.body}</p>
                )}
                {section.list && (
                  <ul className="info-modal__list">
                    {section.list.map((item) => (
                      <li key={item} className="info-modal__list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {asideBody && (
            <div className="info-modal__aside">
              {asideTitle && (
                <h4 className="info-modal__aside-title">{asideTitle}</h4>
              )}
              <p className="info-modal__section-text">{asideBody}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InfoModal
