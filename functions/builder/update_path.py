import os

# Configuration
target_folder = r"C:\Users\SCSM11\Downloads\Quran-lite.pages.dev"

def get_new_name(filename):
    """Generates the new name based on extension rules."""
    if filename.endswith(".css") and not filename.endswith("xa.css"):
        return filename[:-4] + "xa.css"
    elif filename.endswith(".js") and not filename.endswith("xjs.js"):
        return filename[:-3] + "xjs.js"
    return None

def main():
    if not os.path.exists(target_folder):
        print(f"Error: Folder not found: {target_folder}")
        return

    # 1. Collect all necessary renames first
    # We store them as a list of tuples: (full_path, old_filename, new_filename)
    rename_list = []
    
    print("Scanning for files to rename...")
    for root, dirs, files in os.walk(target_folder):
        for file in files:
            new_name = get_new_name(file)
            if new_name:
                full_path = os.path.join(root, file)
                rename_list.append({
                    'path': full_path,
                    'old_name': file,
                    'new_name': new_name
                })

    if not rename_list:
        print("No .css or .js files found to rename.")
        return

    # Sort by length of old_name (DESCENDING)
    # This is crucial! It prevents 'app.js' from replacing the end of 'myapp.js' prematurely.
    rename_list.sort(key=lambda x: len(x['old_name']), reverse=True)

    print(f"Found {len(rename_list)} files to rename. Updating references in code...")

    # 2. Update references in ALL files (HTML, JSON, etc.)
    # We walk the directory again to find files to *read*
    files_updated = 0
    
    for root, dirs, files in os.walk(target_folder):
        for file in files:
            file_path = os.path.join(root, file)
            
            try:
                # Try to open as text (UTF-8). Binary files (images, etc.) will fail and be skipped.
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Apply ALL replacements to this file
                for item in rename_list:
                    if item['old_name'] in content:
                        content = content.replace(item['old_name'], item['new_name'])
                
                # Only write back if something actually changed
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    files_updated += 1
                    print(f"Updated references in: {file}")
                    
            except UnicodeDecodeError:
                # Skip binary files (images, fonts, etc.)
                continue
            except Exception as e:
                print(f"Could not read {file}: {e}")

    print(f"Reference updates complete. Updated {files_updated} files.")
    print("Renaming actual files now...")

    # 3. Rename the actual files
    files_renamed = 0
    for item in rename_list:
        try:
            # We must reconstruct the 'new path' because the directory is the same
            dir_path = os.path.dirname(item['path'])
            new_file_path = os.path.join(dir_path, item['new_name'])
            
            os.rename(item['path'], new_file_path)
            files_renamed += 1
            print(f"Renamed: {item['old_name']} -> {item['new_name']}")
        except OSError as e:
            print(f"Error renaming {item['old_name']}: {e}")

    print("------------------------------------------------")
    print(f"Process Complete.")
    print(f"References updated in {files_updated} files.")
    print(f"Files renamed: {files_renamed}")

if __name__ == "__main__":
    main()