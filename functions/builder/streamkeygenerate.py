import base64

def generate_stream_key(chapter, verse, reciter, translation, audio):
    # 1. Format the raw string separated by pipes
    raw_string = f"{chapter}|{verse}|{reciter}|{translation}|{audio}"
    
    # 2. Convert the string to bytes (required for base64 encoding in Python)
    raw_bytes = raw_string.encode('utf-8')
    
    # 3. Encode using URL-safe Base64 (+ becomes -, / becomes _)
    encoded_bytes = base64.urlsafe_b64encode(raw_bytes)
    
    # 4. Convert back to string and remove trailing '=' padding
    stream_key = encoded_bytes.decode('utf-8').rstrip('=')
    
    return stream_key

def main():
    print("--- OpenTuwa Stream Key Generator ---\n")
    print("Press [Enter] to use the default values shown in brackets.")
    
    # Ask the user for inputs, providing the app's standard defaults if left blank
    chapter = input("Enter Chapter [2]: ").strip() or "2"
    verse = input("Enter Verse [282]: ").strip() or "282"
    reciter = input("Enter Reciter [alafasy]: ").strip() or "alafasy"
    translation = input("Enter Translation [en]: ").strip() or "en"
    audio = input("Enter Audio Translation [none]: ").strip() or "none"
    
    # Generate the key
    key = generate_stream_key(chapter, verse, reciter, translation, audio)
    
    # Output the result
    print("\n-----------------------------------")
    print(f"Raw String : {chapter}|{verse}|{reciter}|{translation}|{audio}")
    print(f"Stream Key : {key}")
    print("-----------------------------------")

if __name__ == "__main__":
    main()