from bs4 import BeautifulSoup
import copy

def distribute_content():
    input_file = 'index.html'
    
    # We want to create these files based on index.html
    targets = [
        {'filename': 'home.html', 'active_nav': 'Home'},
        {'filename': 'action_plan.html', 'active_nav': 'Action plan'},
        # index.html is already correct (Health report active), but we could regenerate it to be safe, 
        # though usually we treat it as source. Let's strictly generate the others.
    ]

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
        # data-precedence etc might be lost if we don't use html.parser
        source_soup = BeautifulSoup(f, 'html.parser')

    for target in targets:
        # Deep copy the source
        soup = copy.copy(source_soup)
        soup = BeautifulSoup(str(source_soup), 'html.parser')
        
        # Update Nav
        # We need to handle both desktop and mobile navs if they exist. source_soup should have them.
        
        for name, link in nav_links.items():
            # Find anchors with this text
            anchors = soup.find_all('a', string=lambda t: t and name in t.strip())
            
            for a in anchors:
                # Update href just in case, though index.html should have them right from previous step
                a['href'] = link
                
                # Update classes
                if name == target['active_nav']:
                    # Active
                    a['class'] = base_classes.split() + active_classes.split()
                    a['aria-selected'] = "true"
                    a['tabindex'] = "0"
                else:
                    # Inactive
                    a['class'] = base_classes.split() + inactive_classes.split()
                    a['aria-selected'] = "false"
                    a['tabindex'] = "-1"
        
        # Save
        with open(target['filename'], 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
            print(f"Generated {target['filename']}")

if __name__ == '__main__':
    distribute_content()
