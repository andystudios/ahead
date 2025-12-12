from bs4 import BeautifulSoup

def fix_index_final():
    input_file = 'index.html'
    
    nav_links = {
        'Home': 'home.html',
        'Health report': 'index.html',
        'Action plan': 'action_plan.html'
    }

    # Styles
    active_classes = "bg-selected font-medium"
    inactive_classes = "hover:text-foreground cursor-pointer"
    base_classes = "shrink-0 rounded-full px-3 pt-[6px] pb-[7px] text-xs whitespace-nowrap transition-colors md:text-sm"

    with open(input_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Find buttons OR anchors with the specific text
    # We'll stick to a broader search
    for name, link in nav_links.items():
        # Find elements containing the text. 
        # Using string=... might miss it if it's nested or has whitespace.
        # Let's iterate all potential candidates.
        candidates = soup.find_all(['button', 'a'], role='tab')
        
        for elem in candidates:
            if name in elem.get_text(strip=True):
                # Found it. Convert to anchor
                elem.name = 'a'
                elem['href'] = link
                
                # Active state
                if name == 'Health report':
                    elem['class'] = base_classes.split() + active_classes.split()
                    elem['aria-selected'] = "true"
                    elem['tabindex'] = "0"
                else:
                    elem['class'] = base_classes.split() + inactive_classes.split()
                    elem['aria-selected'] = "false"
                    elem['tabindex'] = "-1"

    with open(input_file, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())

if __name__ == '__main__':
    fix_index_final()
