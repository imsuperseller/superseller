
import os

TIMESTAMP = "20240101"

REPLACEMENTS = {
    "from '@/lib/firebase'": "from '@/lib/firebase-admin'",
    'from "@/lib/firebase"': 'from "@/lib/firebase-admin"'
}

TARGET_DIR = "/Users/shaifriedman/New Rensto/rensto/apps/web/rensto-site/src"

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        modified = False
        
        for old, new in REPLACEMENTS.items():
            if old in new_content:
                new_content = new_content.replace(old, new)
                modified = True
        
        if modified:
            print(f"Updating {filepath}")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    print(f"Starting refactor in {TARGET_DIR}")
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))
    print("Refactor complete.")

if __name__ == "__main__":
    main()
