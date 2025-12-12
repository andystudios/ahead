from bs4 import BeautifulSoup

def finalize_home():
    input_file = 'home.html'
    
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

    # Update Nav
    for btn in soup.find_all(['button', 'a'], role='tab'):
        text = btn.get_text(strip=True)
        if text in nav_links:
            # Change tag to 'a' if it's a button
            btn.name = 'a'
            btn['href'] = nav_links[text]
            
            # Update classes for Active state 'Home'
            if text == 'Home':
                btn['class'] = base_classes.split() + active_classes.split()
                btn['aria-selected'] = "true"
                btn['tabindex'] = "0"
            else:
                btn['class'] = base_classes.split() + inactive_classes.split()
                btn['aria-selected'] = "false"
                btn['tabindex'] = "-1"

    # Clean spinners if any (standard procedure for these pages)
    for spinner in soup.find_all(class_='animate-spin'):
        placeholder = soup.new_tag('div')
        placeholder['class'] = 'flex items-center justify-center h-full w-full bg-gray-200 text-gray-500 text-xs'
        placeholder.string = "Image N/A"
        spinner.replace_with(placeholder)

    with open(input_file, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())

if __name__ == '__main__':
    finalize_home()
