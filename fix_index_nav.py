from bs4 import BeautifulSoup

def fix_index_nav():
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

    # Find and update nav links
    for name, link in nav_links.items():
        # Find anchors with this text (strip whitespace)
        anchors = soup.find_all('a', string=lambda t: t and name in t.strip())
        
        for a in anchors:
            a['href'] = link
            
            # Ensure "Health report" is active for index.html
            if name == 'Health report':
                a['class'] = base_classes.split() + active_classes.split()
                a['aria-selected'] = "true"
                a['tabindex'] = "0"
            else:
                a['class'] = base_classes.split() + inactive_classes.split()
                a['aria-selected'] = "false"
                a['tabindex'] = "-1"

    with open(input_file, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
        print("Updated index.html navigation links.")

if __name__ == '__main__':
    fix_index_nav()
