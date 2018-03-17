# Gibberish AES Decrypter

A simple web app that shows how to decrypt text encrypted with **Gibberish AES** using _brute-force_.
  
The app runs locally inside the client's web-browser.

It iterates over the words extracted from the provided dictionaries without blocking the UI thread, i.e. in multiple
 **Web Workers**, one worker per dictionary.
    
Please check out the [sample_data](sample_data) directory, which contains an encrypted string(_key.txt_) and a few 
dictionaries, one of which contains the password for the encrypted string.

