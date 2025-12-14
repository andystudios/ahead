import React from 'react'
import InfoModal from './InfoModal'

const sections = [
  {
    title: 'Image-derived parameters (statistical values)',
    body: 'Image-derived measurements from diagnostic imaging are evaluated based on their statistical position within reference population distributions. Statistical parameters from imaging studies are compared to reference databases matched for age, sex, and relevant anatomical factors such as BMI. Since many biological measurements don\'t follow perfect normal distributions, sometimes percentiles provide a more accurate representation of your position within the population range.',
  },
  {
    title: 'Statistical Position',
    body: 'Your measurement\'s position can be expressed in the following ways:',
    list: [
      'Normal: Within the statistical normal range for your reference group, typically encompasses the 10th to 90th percentile which represents approximately 1.28 standard deviations above and below the average mean. The large majority of 80% of the reference group will fall into this category.',
      'Out of range: Further categorized as either above (elevated) or below (decreased) the normal reference range, indicating a position on the outer tail of the distribution that may warrant lifestyle changes.',
      'Optimal: Represents the tail of the distribution that is associated with highly favorable health outcomes. Depending on the specific measurement, optimal may be at either the higher or lower end of the normal range (e.g., higher muscle mass or lower visceral fat), reflecting values that correlate with the best long-term health markers in population studies.',
    ],
  },
]

const asideBody =
  'Image-derived measurements can be influenced by technical factors such as image quality, measurement accuracy, and equipment calibration, as well as biological variations including time of day, hydration status, and recent physical activity. Understanding these influences helps determine whether deviations from expected values represent normal variation or clinically significant findings.'

const InfoModalImage = ({ isOpen, onClose }) => (
  <InfoModal
    isOpen={isOpen}
    onClose={onClose}
    title="Image-derived parameters"
    sections={sections}
    asideTitle="What Can Influence Image-Derived Parameters?"
    asideBody={asideBody}
  />
)

export default InfoModalImage
