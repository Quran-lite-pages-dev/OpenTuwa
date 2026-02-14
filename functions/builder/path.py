import os
import shutil

# --- CONFIGURATION ---
TARGET_DIR = r"C:\Users\SCSM11\Downloads\Quran-lite.pages.dev"

# Mapping from SEC_NAME.MD
# Format: "Old_Relative_Path": "New_Relative_Path"
FILE_MAPPING = {
    "styles/index1.css": "styles/a1b2c3d4e5fxa.css",
    "styles/index.css": "styles/b1c2d3e4f5axa.css",
    "styles/custom-select.css": "styles/c1d2e3f4a5bxa.css",
    "styles/arabic-modal.css": "styles/d1e2f3a4b5cxa.css",
    "styles/user-select.css": "styles/e1f2a3b4c5dxa.css",
    "styles/inline-styles.css": "styles/f1a2b3c4d5exa.css",
    "styles/0/index.css": "styles/0/g1h2i3j4k5lxa.css",
    "styles/0/index2.css": "styles/0/h1i2j3k4l5mxa.css",
    "styles/1/index.css": "styles/1/i1j2k3l4m5nxa.css",
    "styles/1/index1.css": "styles/1/j1k2l3m4n5oxa.css",
    "src/ui/error-handling-img.js": "src/ui/eh_7a8b9cxjs.js",
    "src/utils/i18n-loader.js": "src/utils/i18n_3f2a1bxjs.js",
    "src/utils/analytics.js": "src/utils/ga_9c8b7axjs.js",
    "src/utils/github-redirect.js": "src/utils/gh_6b5a4cxjs.js",
    "src/utils/resolution.js": "src/utils/res_2a3b4cxjs.js",
    "src/components/recommendations.js": "src/components/rec_1a2b3cxjs.js",
    "src/components/offline-status.js": "src/components/off_4d5e6fxjs.js",
    "src/utils/service-worker-registration.js": "src/utils/swreg_8e7f6axjs.js",
    "src/core/app.js": "src/core/app_5f6e7dxjs.js",
    "src/core/ai-override.js": "src/core/ai_0a1b2cxjs.js",
    "src/components/navigation.js": "src/components/nav_7c6b5axjs.js",
    "src/utils/content-protection.js": "src/utils/cp_3c4d5exjs.js",
    "src/ui/artifact.js": "src/ui/art_2b3c4dxjs.js",
    "src/ui/all-text-fade.js": "src/ui/fade_1c2d3exjs.js"
}

def is_binary(file_path):
    """
    Checks if a file is binary by reading a small chunk.
    Returns True if binary, False if text.
    """
    try:
        with open(file_path, 'tr') as check_file:
            check_file.read(1024)
            return False
    except:
        return True

def step_1_rename_disk_files():
    """
    Renames the physical files on the hard drive.
    """
    print("\n--- STEP 1: RENAMING FILES ON DISK ---")
    count = 0
    for old_path, new_path in FILE_MAPPING.items():
        # Convert forward slashes to Windows backslashes
        old_full = os.path.join(TARGET_DIR, os.path.normpath(old_path))
        new_full = os.path.join(TARGET_DIR, os.path.normpath(new_path))

        if os.path.exists(old_full):
            try:
                # Ensure the directory for the new file exists
                os.makedirs(os.path.dirname(new_full), exist_ok=True)
                
                # Rename the file
                os.rename(old_full, new_full)
                print(f"[RENAMED] {old_path} -> {new_path}")
                count += 1
            except Exception as e:
                print(f"[ERROR] Could not rename {old_path}: {e}")
        elif os.path.exists(new_full):
            print(f"[SKIP] New file already exists: {new_path}")
        else:
            print(f"[MISSING] Original file not found: {old_path}")
    print(f"Step 1 Complete: {count} files renamed.")

def step_2_update_code_references():
    """
    Scans EVERY text file in the folder and updates the text content.
    """
    print("\n--- STEP 2: UPDATING CODE REFERENCES ---")
    files_processed = 0
    files_changed = 0

    # Walk through every single file in the directory
    for root, dirs, files in os.walk(TARGET_DIR):
        for filename in files:
            file_path = os.path.join(root, filename)
            
            # Skip binary files (images, audio, etc.)
            if is_binary(file_path):
                continue
            
            files_processed += 1
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                original_content = content
                
                # Perform replace for ALL items in our mapping
                for old_str, new_str in FILE_MAPPING.items():
                    # We check for the string. 
                    if old_str in content:
                        content = content.replace(old_str, new_str)

                # Only write back to disk if changes were made
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"[UPDATED] References fixed in: {filename}")
                    files_changed += 1
            
            except Exception as e:
                print(f"[ERROR] Reading/Writing {filename}: {e}")

    print(f"Step 2 Complete: Scanned {files_processed} text files. Updated {files_changed} files.")

if __name__ == "__main__":
    if os.path.exists(TARGET_DIR):
        # Sort mapping by length (longest first) to prevent partial replacement errors
        # (e.g. preventing 'style.css' replace from breaking 'style.css.map')
        sorted_keys = sorted(FILE_MAPPING.keys(), key=len, reverse=True)
        SORTED_MAPPING = {k: FILE_MAPPING[k] for k in sorted_keys}
        
        # Run the rename on disk
        step_1_rename_disk_files()
        
        # Run the text replacement
        step_2_update_code_references()
        
        print("\nAll Done! Please clear your browser cache/service workers before testing.")
    else:
        print(f"CRITICAL ERROR: Directory not found: {TARGET_DIR}")