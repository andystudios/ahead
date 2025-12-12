from bs4 import BeautifulSoup
import re

def finalize_html(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # 1. Handle "Read more" buttons
    # We will add a class to them to identifying them easily in our JS
    for btn in soup.find_all('button'):
        if btn.get_text(strip=True) == 'Read more':
            btn['class'] = btn.get('class', []) + ['read-more-action']

    # 2. Handle "Show details" - remove the "Show details" text/pill but keep the value
    # The structure: <div>Value</div> <span ...>Show details <svg></span>
    # We want to remove the span.
    for span in soup.find_all('span'):
        if 'Show details' in span.get_text():
            span.decompose()
            
    # 3. Handle Medical Images (Spinners)
    # Find divs with animate-spin and replace with a static placeholder
    for spinner in soup.find_all(class_='animate-spin'):
        # Create a placeholder element
        placeholder = soup.new_tag('div')
        placeholder['class'] = 'flex items-center justify-center h-full w-full bg-gray-200 text-gray-500 text-xs'
        placeholder.string = "Image N/A"
        
        # Replace the spinner with the placeholder
        spinner.replace_with(placeholder)

    # 4. Inject CSS for hidden gradient and JS for interactivity
    style_tag = soup.new_tag('style')
    style_tag.string = """
        .expanded-content {
            max-height: none !important;
        }
        .hidden-gradient {
            display: none !important;
        }
        .hidden-btn {
            display: none !important;
        }
    """
    if soup.head:
        soup.head.append(style_tag)
    else:
        soup.body.insert(0, style_tag)

    script_tag = soup.new_tag('script')
    script_tag.string = """
        document.addEventListener('DOMContentLoaded', function() {
            const readMoreBtns = document.querySelectorAll('.read-more-action');
            readMoreBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Start from the button and find the previous sibling container
                    // The structure is: <div wrapper>...</div> <button>Read more</button>
                    // The wrapper contains: <div text-container>...</div> <div gradient></div>
                    
                    const wrapper = btn.previousElementSibling;
                    if (wrapper) {
                        // The text container is likely the first child or the one with max-height style
                        // We look for the one with max-height style inline usually, or we just try valid children
                        const textDiv = wrapper.querySelector('[style*="max-height"]');
                        const gradientDiv = wrapper.querySelector('.bg-gradient-to-t');
                        
                        if (textDiv) textDiv.classList.add('expanded-content');
                        if (gradientDiv) gradientDiv.classList.add('hidden-gradient');
                        
                        btn.classList.add('hidden-btn');
                    }
                });
            });
        });
    """
    soup.body.append(script_tag)

    # 5. Prettify
    pretty_html = soup.prettify()

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(pretty_html)

if __name__ == '__main__':
    finalize_html('index.html', 'index.html')
