import os
import re
import json
import datetime

# --- CONFIGURATION ---
PATH_SCRIPT_FILE = "path.py"
OBS_MAPPING_FILE = "FINAL_obfuscation_mapping.json"
OUTPUT_MD_FILE = "BUILD_REFERENCE.md"

def extract_file_mapping_from_python(script_path):
    """
    Reads path.py as text and extracts the dictionary content using Regex.
    This avoids running the script and executing actual file moves.
    """
    if not os.path.exists(script_path):
        return {}

    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Regex to find the dictionary variable FILE_MAPPING = { ... }
        # This matches the content inside the curly braces
        match = re.search(r'FILE_MAPPING\s*=\s*\{([^}]+)\}', content, re.DOTALL)
        
        if not match:
            print(f"Warning: Could not find FILE_MAPPING in {script_path}")
            return {}

        dict_content = match.group(1)
        
        # Parse the text lines into a real dictionary
        mapping = {}
        for line in dict_content.splitlines():
            # Look for lines like: "old": "new",
            line = line.strip()
            # Regex to capture content in quotes
            entry_match = re.search(r'["\']([^"\']+)["\']\s*:\s*["\']([^"\']+)["\']', line)
            if entry_match:
                mapping[entry_match.group(1)] = entry_match.group(2)
        
        return mapping
    except Exception as e:
        print(f"Error parsing {script_path}: {e}")
        return {}

def load_json_mapping(json_path):
    if not os.path.exists(json_path):
        print(f"Warning: {json_path} not found. Run obs.py first.")
        return {}
    
    try:
        with open(json_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {json_path}: {e}")
        return {}

def generate_markdown(file_map, class_map):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    md_content = f"""# 🏗️ Production Build Reference
**Generated:** {timestamp}

This document serves as the "Rosetta Stone" for the production build. 
Use this to map obfuscated errors and file paths back to the original source code.

---

## 🤖 System Prompt for AI Agents
*(Copy-paste this block into Cursor/ChatGPT if you are debugging a production error)*

> "I am debugging a production build where files and CSS classes have been obfuscated. 
> Below is the mapping logic. If I reference a file like `styles/b1c...css`, it maps to `styles/index.css`. 
> If I reference a class `_b`, it maps to `row-section`. Use this context to explain errors."

---

## 1. 📂 File System Mapping (Cache Busting)
*Mapping source files to their production hash filenames.*

| Original Source File | Production Filename (Hashed) |
| :--- | :--- |
"""

    # Add File Rows
    # Sort by original name for readability
    for original in sorted(file_map.keys()):
        production = file_map[original]
        md_content += f"| `{original}` | `{production}` |\n"

    md_content += """
---

## 2. 🛡️ DOM Obfuscation Map (Classes & IDs)
*Mapping original readable IDs/Classes to minified production codes.*

| Minified Code | Original ID/Class | Type |
| :--- | :--- | :--- |
"""

    # Add Class Rows
    # Sort by the short code (Minified) so it's easy to look up "_a", "_b"
    # Swap key/value for the loop so we look up by Short Code
    reverse_class_map = {v: k for k, v in class_map.items()}
    
    for short_code in sorted(reverse_class_map.keys()):
        original_name = reverse_class_map[short_code]
        # Guess type based on name (heuristic)
        obj_type = "ID" if "wrapper" in original_name or "container" in original_name else "Class"
        
        md_content += f"| **`{short_code}`** | `{original_name}` | {obj_type} |\n"

    return md_content

if __name__ == "__main__":
    print("--- GENERATING BUILD DOCUMENTATION ---")
    
    # 1. Get File Renames
    files = extract_file_mapping_from_python(PATH_SCRIPT_FILE)
    print(f"Loaded {len(files)} file mappings from {PATH_SCRIPT_FILE}")
    
    # 2. Get Class Obfuscation
    classes = load_json_mapping(OBS_MAPPING_FILE)
    print(f"Loaded {len(classes)} class mappings from {OBS_MAPPING_FILE}")
    
    # 3. Create MD
    full_doc = generate_markdown(files, classes)
    
    with open(OUTPUT_MD_FILE, 'w', encoding='utf-8') as f:
        f.write(full_doc)
        
    print(f"\n✅ SUCCESS! Documentation saved to: {OUTPUT_MD_FILE}")
    print("You can now open this file to see exactly what '_a' or 'index.css' became.")