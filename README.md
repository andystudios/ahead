## INTENTON:
* Give the user a slow introduction to the report page and its features.
* Designed as a plug-in, so it can be easily integrated into the main app. Resilient to missing elements.
* Configurable features to enable / disable them as needed.
* Reduce the inicial overwhelm of the user when seeing the report page for the first time.
  * Help the user navigate what's new, important and already seen.
  * Create space to add explanations to the user if needed (on load or on navigation).
  
## ORIGINAL SET UP:

* Mock the full report page.

## FEATURES:

* The features can be configured on `src/libs/config.js`.

* Loading screen for the home page:
  * Explains the page only once (using cookies to track if seen).
  * Tailored to the user "Andres", a more personalized "feeling".
  * Targets dom elements but skips messages if not found.
    * Tracks the error if elements are not found to be fixed.
  * Different properties allow to customize the messages.
    * Simple configuration to add / remove steps.
  * Can be skipped by the user.
    * We track how many users skip it.
  * Serves as a tutorial to have an easier onboarding.
  
* Loading screen for the report page:
  * Shows only once (using cookies to track if seen).
  * Shows important navigation elements slowly.
  * Can be skipped by the user.
    * We track how many users skip it.
  * Serves as a tutorial to have an easier onboarding.

* Buttons to display content on the report page:
  * Tracked with cookies, each button is pressed only once.
  * We button previews if there's out of range elements.
  * We track how many users click on them.
  * The button shows an explanation based on the content.
  
* Scroll feature:
  * Based on the scroll position, we highlight the menu items.
  * This was a mistake of me, my mock didn't have this feature and I added it before realizing it's like this in prod.

## TODO:

* React integration.
* Mobile version.
* Error tracking integration.
* User tracking integration.

* User could press a button to skip each step of the tutorial.
* User could see the tutorial again.

* Same modal windows.

## Different:

* Different types of users (new, returning, power users) could have different set of messages.
* I skipped the mobile version because the nature of the mock (hardcoded HTML).
* I would have like to interact more with the team on development, sadly Nico being sick made it impossible.
* I would have evaluated with the team to use Intercom for onboarding instead of building a custom solution:
https://www.intercom.com/drlp/onboarding?utm_source=google&utm_medium=sem&utm_campaign=21007877402&utm_term=intercom%20onboarding%20guide&utm_ad_collection=159473369715&utm_ad=727007436939&utm_geo=9189080&gad_source=1&gad_campaignid=21007877402&gbraid=0AAAAAoKeDyLuTkzhUp-a4nQ4OLAlh2oXG&gclid=Cj0KCQiAuvTJBhCwARIsAL6DemixrzhT260fXnWkP7XZh2UrXSgw9_bX7ZyQYWrmwrvGNqAjGaz99wMaAopREALw_wcB
 * We already have an Intercom integration and the onboarding could be enough.
* All the solutions are playing directly with the DOM this is obviously not the React way.
  * I tried to do it resilient, so if the dom is not there, it just skips the step / button.

## AI:

* Used Google Antigravity to generate the initial mock.
* User copilot CLI (gpt-5.1-codex-max) for the development.


