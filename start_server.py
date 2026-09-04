"""
Bhunetra Single Unified Server Launcher
Runs the complete full-stack application (Frontend + Backend APIs) on port 8000.
"""
import os
import sys
import subprocess
import webbrowser
import time

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
FRONTEND_DIST = os.path.join(FRONTEND_DIR, "dist")
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

def build_frontend():
    print("[1/2] Checking Frontend Production Build...")
    if not os.path.exists(FRONTEND_DIST):
        npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
        subprocess.run([npm_cmd, "run", "build"], cwd=FRONTEND_DIR, shell=True, check=True)
        print(" -> [SUCCESS] Frontend bundle built cleanly!")
    else:
        print(" -> [OK] Frontend dist bundle ready.")

def start_unified_server():
    print("\n[2/2] Starting Bhunetra Single Unified Server on http://localhost:8000 ...")
    print(" -> Citizen Portal UI: http://localhost:8000/citizen")
    print(" -> Officer Dashboard: http://localhost:8000/dashboard")
    print(" -> OpenAPI Docs:      http://localhost:8000/docs\n")
    
    # Auto-open browser after 1.5 seconds
    def open_browser():
        time.sleep(1.5)
        webbrowser.open("http://localhost:8000/citizen")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    os.chdir(BACKEND_DIR)
    sys.path.insert(0, BACKEND_DIR)
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    build_frontend()
    start_unified_server()
