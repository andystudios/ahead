import re

def clean_html(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic script removal (both inline and src)
    # Using DOTALL flag so . matches newlines
    content = re.sub(r'<script\b[^>]*>([\s\S]*?)</script>', '', content, flags=re.IGNORECASE)
    
    # Remove link preload as script
    content = re.sub(r'<link[^>]+as="script"[^>]*>', '', content, flags=re.IGNORECASE)
    
    # Remove sentry meta tags
    content = re.sub(r'<meta[^>]+name="sentry-[^"]+"[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta[^>]+name="baggage"[^>]*>', '', content, flags=re.IGNORECASE)

    # Remove the hidden next-route-announcer
    content = re.sub(r'<next-route-announcer[^>]*>[\s\S]*?</next-route-announcer>', '', content, flags=re.IGNORECASE)
    
    # Remove the hidden div that sometimes appears at the top of Next.js apps
    content = re.sub(r'<div hidden="">[\s\S]*?</div>', '', content, flags=re.IGNORECASE)

    # Optional: Fix any double newlines or mess left behind (simple cleanup)
    # content = re.sub(r'\n\s*\n', '\n', content)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    clean_html('reference.html', 'index.html')
