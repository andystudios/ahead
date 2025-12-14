import React from 'react'
import InfoModal from './InfoModal'

const sections = [
  {
    title: 'Observation (Category 1: Normal)',
    body: 'Findings that represent normal variations that require no active medical follow-up. These are documented for completeness but do not impact your health or require any action from you or your physician.',
  },
  {
    title: 'Minor Finding (Category 2: Benign)',
    body: 'Findings with minimal clinical significance that typically resolve on their own or remain stable over time. Examples include minor disc protrusions, small simple cysts, mild degenerative changes, or benign calcifications. While no immediate medical action is recommended, your physician may choose to monitor these during routine check-ups or future imaging studies.',
  },
  {
    title: 'Intermediate Finding (Category 3: Probably Benign)',
    body: 'Findings that require active medical attention and scheduled follow-up to monitor progression or confirm benign nature. This category includes likely benign findings that need short-interval follow-up (typically 6 months), as well as reversible or pre-disease conditions where timely intervention through lifestyle modifications, preventive measures, or medical management can prevent progression to established disease.',
  },
  {
    title: 'Major Finding (Category 4: Suspicious)',
    body: 'Clinically significant findings that require prompt medical evaluation and treatment within weeks. These findings need coordinated care with your physician to establish a treatment plan and often require specialist referral, biopsy, or additional diagnostic testing.',
  },
  {
    title: 'Serious Finding (Category 5: Highly Suggestive/Known Serious Disease)',
    body: 'Critical findings requiring immediate medical attention within hours to days to prevent serious health consequences. These findings trigger urgent notification to your treating physician and may require emergency evaluation or hospitalization.',
  },
]

const asideBody =
  'Radiology findings can be influenced by imaging technique, anatomical variations (normal variants, prior surgeries), temporary conditions (inflammation, positioning), chronic conditions (degenerative changes, scarring), and comparison to prior imaging. Understanding these factors helps distinguish between normal findings, stable chronic changes, and new clinically significant findings.'

const InfoModalRadiology = ({ isOpen, onClose }) => (
  <InfoModal
    isOpen={isOpen}
    onClose={onClose}
    title="Finding Classification"
    sections={sections}
    asideTitle="What Can Influence Radiology Findings?"
    asideBody={asideBody}
  />
)

export default InfoModalRadiology
