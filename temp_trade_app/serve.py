#!/usr/bin/env python3
"""
Simple script to start the Vite dev server.
Run with: python3 serve.py or just use: npm run dev
"""

import subprocess
import sys
import webbrowser
import time
import threading

def open_browser():
    time.sleep(2)  # Wait for server to start
    webbrowser.open('http://localhost:5173')

if __name__ == "__main__":
    print("Starting Vite dev server...")
    print("This will serve the app at http://localhost:5173")
    print("Press Ctrl+C to stop the server")
    
    # Open browser in background
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    try:
        subprocess.run(["npm", "run", "dev"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting dev server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped.")
