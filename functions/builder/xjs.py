import os

# Configuration
TARGET_DIR = r'C:\Users\SCSM11\Downloads\Quran-lite.pages.dev'

# Mapping of search terms to replacements
# Order matters: longer strings (with .js) are replaced first to avoid partial hits
replacements = {
    "config.js": "config.js",
    "media-token.js": "media-token.js",
    "login-google.js": "login-google.js",
    "login-client.js": "login-client.js",
    "login.js": "login.js",
    "search.js": "search.js",
    "media-token": "media-token",
    "login-google": "login-google",
    "login-client": "login-client",
    "login": "login",
    "search": "search"
}

def process_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            
            try:
                # Open file and read content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Perform replacements
                original_content = content
                for old, new in replacements.items():
                    content = content.replace(old, new)
                
                # Only write back if changes were made
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated: {file_path}")
                    
            except (UnicodeDecodeError, PermissionError):
                # This skips binary files (like images) or locked files
                continue

if __name__ == "__main__":
    if os.path.exists(TARGET_DIR):
        process_files(TARGET_DIR)
        print("Done!")
    else:
        print(f"Error: Path {TARGET_DIR} not found.")