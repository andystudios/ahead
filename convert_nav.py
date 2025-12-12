from bs4 import BeautifulSoup
import re

def convert_nav(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Find the nav containing "Home", "Health report", "Action plan"
    # We look for buttons with exact text match or close to it
    
    # We'll define the mapping of text to href
    nav_links = {
        'Home': '#',
        'Health report': 'index.html',
        'Action plan': '#'
    }
    
    # Update buttons
    # Note: There might be multiple instances (desktop sidebar, mobile header)
    # The snippet showed them in a <button role="tab"> context
    
    for btn in soup.find_all('button', role='tab'):
        text = btn.get_text(strip=True)
        if text in nav_links:
            # Change tag to 'a'
            btn.name = 'a'
            # Set href
            btn['href'] = nav_links[text]
            # Remove button-specific attributes if they interfere (like type="button" if present)
            # Add 'block' or similar if needed, but the existing classes looked fine for inline-block/flex
            # The original classes: shrink-0 rounded-full px-3 ... flex ...
            
            # Since anchors are inline by default but valid in flex containers, existing classes should work.
            # However, for buttons, they might have default styles.
            # We should probably ensure text-decoration is none.
            # But the classes likely handle it.
            
            # Also, for the '#' links, maybe let's add an onclick alert to mimic "functioning" but not implemented for offline.
            if nav_links[text] == '#':
               # We can add a class to handle this in JS or just leave it as is (no-op)
               pass
               
    # Save
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())

if __name__ == '__main__':
    convert_nav('index.html', 'index.html')
