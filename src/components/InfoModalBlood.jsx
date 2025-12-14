import React from 'react'
import InfoModal from './InfoModal'

const sections = [
  {
    title: 'Blood test / lab parameters',
    body: 'Laboratory results are typically categorized as:',
    list: [
      'Optimal: Values that are defined as optimal for long term health',
      'Normal: Within the reference range for your demographic or risk group',
      'Out of range: Often further categorized by above (elevated) or below (decreased) than the reference limits',
      'Intermediate/Mild risk: Just outside normal limits but not clinically concerning',
    ],
  },
  {
    title: 'Reference ranges',
    body: 'Reference ranges for laboratory values are provided by our certified partner laboratories. These ranges are based on demographic data from healthy populations and may vary depending on the specific analytical methods and equipment used by each laboratory. For certain tests, ranges may need adjustment based on individual factors such as menstrual cycle phase, pregnancy status, or specific risk profiles based on your medical history.',
  },
  {
    title: 'Optimal ranges',
    body: 'Our medical team defines optimal ranges for your results based on the latest scientific evidence. These optimal ranges often represent a narrower band within the normal reference range associated with the best long-term health outcomes and disease prevention, rather than just absence of disease.',
  },
]

const asideBody =
  'Many factors can affect your laboratory results and cause variations, including time of day (circadian rhythms), recent meals or fasting status, hydration status, physical activity, pregnancy, current or recent infections, chronic diseases, and medications. Even factors like altitude, seasonal changes, and stress levels can influence certain parameters.'

const InfoModalBlood = ({ isOpen, onClose }) => (
  <InfoModal
    isOpen={isOpen}
    onClose={onClose}
    title="Blood test / lab parameters"
    sections={sections}
    asideTitle="What Can Influence Laboratory Results?"
    asideBody={asideBody}
  />
)

export default InfoModalBlood
