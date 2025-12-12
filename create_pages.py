from bs4 import BeautifulSoup
import copy

def create_pages():
    input_file = 'index.html'
    files_config = [
        {
            'filename': 'home.html', 
            'nav_name': 'Home', 
            'content_title': 'Home', 
            'content_body': 'Welcome to your standard Health dashboard.'
        },
        {
            'filename': 'index.html', 
            'nav_name': 'Health report', 
            'content_title': None, # Keep original content
            'content_body': None
        },
        {
            'filename': 'action_plan.html', 
            'nav_name': 'Action plan', 
            'content_title': 'Action Plan', 
            'content_body': 'Here are your recommended actions based on the report findings.'
        }
    ]

    # Pre-calculate common nav links
    nav_links = {
        'Home': 'home.html',
        'Health report': 'index.html',
        'Action plan': 'action_plan.html'
    }

    # Helper styles
    active_classes = "bg-selected font-medium"
    inactive_classes = "hover:text-foreground cursor-pointer"
    
    # Base common class part (simplified for replacement logic, but better to just swap the differing parts)
    # Actually, we can just replace the class list completely based on what we observed.
    base_classes = "shrink-0 rounded-full px-3 pt-[6px] pb-[7px] text-xs whitespace-nowrap transition-colors md:text-sm"

    with open(input_file, 'r', encoding='utf-8') as f:
        base_soup = BeautifulSoup(f, 'html.parser')

    # We need to process each file target
    for config in files_config:
        # If it's index.html, we use the base_soup but we still need to update links if they aren't correct yet
        # If it's a new file, we copy base_soup
        
        soup = copy.copy(base_soup) # Shallow copy might be enough since we are modifying tree
        soup = BeautifulSoup(str(base_soup), 'html.parser') # Deep copy via serialization is safer for BS4

        # 1. Update Navigation Links & States
        # There are desktop and mobile navs. We should find all links that match our nav names.
        
        for name, link in nav_links.items():
            # Find all anchors with this text
            # Note: We converted them to <a> tags in the previous step
            anchors = soup.find_all('a', string=lambda t: t and name in t)
            
            for a in anchors:
                a['href'] = link
                
                # Update visual state
                # Check if this anchor corresponds to the current page config
                if name == config['nav_name']:
                    # Set Active
                    a['class'] = base_classes.split() + active_classes.split()
                    a['aria-selected'] = "true"
                    a['tabindex'] = "0"
                else:
                    # Set Inactive
                    a['class'] = base_classes.split() + inactive_classes.split()
                    a['aria-selected'] = "false"
                    a['tabindex'] = "-1"

        # 2. Update Content (if it's not the original report page)
        if config['filename'] != 'index.html':
            # We need to find the main content area and replace it.
            # In index.html, it's <main ...> -> <div ... aria-label="Health Report Content">
            
            main_content_div = soup.find('div', {'aria-label': 'Health Report Content'})
            if main_content_div:
                # Clear existing content
                main_content_div.clear()
                
                # Add placeholder content
                wrapper = soup.new_tag('div', class_="p-10 flex flex-col gap-5")
                
                h1 = soup.new_tag('h1', class_="text-2xl font-bold")
                h1.string = config['content_title']
                wrapper.append(h1)
                
                p = soup.new_tag('div', class_="text-base")
                p.string = config['content_body']
                wrapper.append(p)
                
                main_content_div.append(wrapper)
        
        # 3. Save
        with open(config['filename'], 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
            print(f"Created/Updated {config['filename']}")

if __name__ == '__main__':
    create_pages()
