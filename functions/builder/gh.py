import os
import re

# The directory to search (usually your source code)
SEARCH_DIR = './' 

# The pattern we know is near the error
# We are looking for any text ending in ": response" or ": response"
TARGET_STRING = "response"

def search_files():
    print(f"👻 Hunting for ghosts in {SEARCH_DIR}...\n")
    found_count = 0

    # Walk through all directories and files
    for root, dirs, files in os.walk(SEARCH_DIR):
        for file in files:
            if file.endswith(".js"):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                        for i, line in enumerate(lines):
                            # Check if the line contains our target variable usage
                            if f": {TARGET_STRING}" in line or f":{TARGET_STRING}" in line:
                                
                                # Clean up whitespace for display
                                clean_line = line.strip()
                                
                                # Heuristic: Check if the key before the colon has quotes
                                # This splits "key: response" -> ["key", " response"]
                                parts = clean_line.split(':')
                                key_part = parts[0].strip()
                                
                                # If the key does NOT start with a quote, it might be the culprit
                                warning = ""
                                if not (key_part.startswith('"') or key_part.startswith("'")):
                                    warning = "  <-- 🚨 POSSIBLE CULPRIT (No quotes on key)"
                                    if "{" in key_part: # Ignore simple object definitions
                                        warning = "" 

                                print(f"📄 File: {file_path}")
                                print(f"   Line {i+1}: {clean_line}{warning}")
                                print("-" * 40)
                                found_count += 1
                                
                except Exception as e:
                    print(f"Could not read {file_path}: {e}")

    if found_count == 0:
        print("❌ No matches found. Try changing the search term.")
    else:
        print(f"\n✅ Found {found_count} potential matches.")

if __name__ == "__main__":
    search_files()