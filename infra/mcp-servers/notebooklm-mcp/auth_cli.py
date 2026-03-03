#!/usr/bin/env python3
"""CLI tool to authenticate with NotebookLM MCP.

This tool connects to Chrome via DevTools Protocol, navigates to NotebookLM,
and extracts authentication tokens. If the user is not logged in, it waits
for them to log in via the Chrome window.

Usage:
    1. Start Chrome with remote debugging:
       /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222

    2. Or, if Chrome is already running, it may already have debugging enabled.

    3. Run this tool:
       notebooklm-mcp-auth

    4. If not logged in, log in via the Chrome window

    5. Tokens are cached to ~/.notebooklm-mcp/auth.json
"""

import json
import re
import sys
import time
from pathlib import Path

import httpx

from auth import (
    AuthTokens,
    REQUIRED_COOKIES,
    extract_csrf_from_page_source,
    get_cache_path,
    save_tokens_to_cache,
    validate_cookies,
)


CDP_DEFAULT_PORT = 9222
NOTEBOOKLM_URL = "https://notebooklm.google.com/"


def get_chrome_user_data_dir() -> str | None:
    """Get the default Chrome user data directory."""
    import platform
    from pathlib import Path

    system = platform.system()
    home = Path.home()

    if system == "Darwin":
        return str(home / "Library/Application Support/Google/Chrome")
    elif system == "Linux":
        return str(home / ".config/google-chrome")
    elif system == "Windows":
        return str(home / "AppData/Local/Google/Chrome/User Data")
    return None


def launch_chrome(port: int, headless: bool = False) -> "subprocess.Popen | None":
    """Launch Chrome with remote debugging enabled.

    Args:
        port: The debugging port to use
        headless: If True, launch in headless mode (no visible window)

    Returns:
        Popen process handle if Chrome was launched, None if failed
    """
    import platform
    import subprocess

    system = platform.system()

    if system == "Darwin":
        chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    elif system == "Linux":
        # Try multiple Chrome binary names (varies by distro)
        import shutil
        chrome_candidates = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]
        chrome_path = None
        for candidate in chrome_candidates:
            if shutil.which(candidate):
                chrome_path = candidate
                break
        if not chrome_path:
            pass # print(f"Chrome not found. Tried: {', '.join(chrome_candidates)}")
            return None
    elif system == "Windows":
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    else:
        pass # print(f"Unsupported platform: {system}")
        return None

    # Chrome 136+ requires a non-default user-data-dir for remote debugging
    # We use a persistent directory so Google login is remembered across runs
    profile_dir = Path.home() / ".notebooklm-mcp" / "chrome-profile"
    profile_dir.mkdir(parents=True, exist_ok=True)

    args = [
        chrome_path,
        f"--remote-debugging-port={port}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",  # Bypass extensions that may interfere (e.g., Antigravity IDE)
        f"--user-data-dir={profile_dir}",  # Persistent profile for login persistence
        "--remote-allow-origins=*",  # Allow WebSocket connections from any origin
    ]

    if headless:
        args.append("--headless=new")

    try:
        # Print the command for debugging
        pass # print(f"Running: {' '.join(args[:3])}...")
        process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(3)  # Wait for Chrome to start

        # Check if there was an immediate error
        if process.poll() is not None:
            _, stderr = process.communicate()
            if stderr:
                pass # print(f"Chrome error: {stderr.decode()[:500]}")
            return None
        return process
    except Exception as e:
        pass # print(f"Failed to launch Chrome: {e}")
        return None


def get_chrome_debugger_url(port: int = CDP_DEFAULT_PORT) -> str | None:
    """Get the WebSocket debugger URL for Chrome."""
    try:
        response = httpx.get(f"http://localhost:{port}/json/version", timeout=5)
        data = response.json()
        return data.get("webSocketDebuggerUrl")
    except Exception:
        return None


def get_chrome_pages(port: int = CDP_DEFAULT_PORT) -> list[dict]:
    """Get list of open pages in Chrome."""
    try:
        response = httpx.get(f"http://localhost:{port}/json", timeout=5)
        return response.json()
    except Exception:
        return []


def find_or_create_notebooklm_page(port: int = CDP_DEFAULT_PORT) -> dict | None:
    """Find an existing NotebookLM page or create a new one."""
    from urllib.parse import quote

    pages = get_chrome_pages(port)

    # Look for existing NotebookLM page
    for page in pages:
        url = page.get("url", "")
        if "notebooklm.google.com" in url:
            return page

    # Create a new page - URL must be properly encoded
    try:
        encoded_url = quote(NOTEBOOKLM_URL, safe="")
        response = httpx.put(
            f"http://localhost:{port}/json/new?{encoded_url}",
            timeout=15
        )
        if response.status_code == 200 and response.text.strip():
            return response.json()

        # Fallback: create blank page then navigate
        response = httpx.put(f"http://localhost:{port}/json/new", timeout=10)
        if response.status_code == 200 and response.text.strip():
            page = response.json()
            # Navigate to NotebookLM using the page's websocket
            ws_url = page.get("webSocketDebuggerUrl")
            if ws_url:
                navigate_to_url(ws_url, NOTEBOOKLM_URL)
            return page

        pass # print(f"Failed to create page: status={response.status_code}")
        return None
    except Exception as e:
        pass # print(f"Failed to create new page: {e}")
        return None


def execute_cdp_command(ws_url: str, method: str, params: dict = None) -> dict:
    """Execute a CDP command via WebSocket."""
    import websocket

    ws = websocket.create_connection(ws_url, timeout=30)
    try:
        command = {
            "id": 1,
            "method": method,
            "params": params or {}
        }
        ws.send(json.dumps(command))

        # Wait for response
        while True:
            response = json.loads(ws.recv())
            if response.get("id") == 1:
                return response.get("result", {})
    finally:
        ws.close()


def get_page_cookies(ws_url: str) -> list[dict]:
    """Get all cookies for the page."""
    result = execute_cdp_command(ws_url, "Network.getCookies")
    return result.get("cookies", [])


def get_page_html(ws_url: str) -> str:
    """Get the page HTML to extract CSRF token."""
    # Enable Runtime domain
    execute_cdp_command(ws_url, "Runtime.enable")

    # Execute JavaScript to get page HTML
    result = execute_cdp_command(
        ws_url,
        "Runtime.evaluate",
        {"expression": "document.documentElement.outerHTML"}
    )

    return result.get("result", {}).get("value", "")


def navigate_to_url(ws_url: str, url: str) -> None:
    """Navigate the page to a URL."""
    execute_cdp_command(ws_url, "Page.enable")
    execute_cdp_command(ws_url, "Page.navigate", {"url": url})
    # Wait for page to load
    time.sleep(3)


def get_current_url(ws_url: str) -> str:
    """Get the current page URL via CDP (cheap operation, no JS evaluation)."""
    execute_cdp_command(ws_url, "Runtime.enable")
    result = execute_cdp_command(
        ws_url,
        "Runtime.evaluate",
        {"expression": "window.location.href"}
    )
    return result.get("result", {}).get("value", "")


def check_if_logged_in_by_url(url: str) -> bool:
    """Check login status by URL - much cheaper than parsing HTML.

    If NotebookLM redirects to accounts.google.com, user is not logged in.
    If URL stays on notebooklm.google.com, user is authenticated.
    """
    if "accounts.google.com" in url:
        return False
    if "notebooklm.google.com" in url:
        return True
    # Unknown URL - assume not logged in
    return False


def extract_session_id_from_html(html: str) -> str:
    """Extract session ID from page HTML."""
    patterns = [
        r'"FdrFJe":"(\d+)"',
        r'f\.sid["\s:=]+["\']?(\d+)',
        r'"cfb2h":"([^"]+)"',
    ]

    for pattern in patterns:
        match = re.search(pattern, html)
        if match:
            return match.group(1)

    return ""


def is_chrome_profile_locked(profile_dir: str | None = None) -> bool:
    """Check if a Chrome profile is locked (Chrome is using it).

    Args:
        profile_dir: The profile directory to check. If None, checks our
                     notebooklm-mcp profile, NOT the default Chrome profile.

    This is more reliable than process detection because:
    - Works across all platforms
    - Detects if Chrome is using the specific profile we need
    - The lock file only exists while Chrome has the profile open
    """
    if profile_dir is None:
        # Check OUR profile, not the default Chrome profile
        # We use a separate profile so we can run alongside the user's main Chrome
        profile_dir = str(Path.home() / ".notebooklm-mcp" / "chrome-profile")

    # Chrome creates a "SingletonLock" file when the profile is in use
    lock_file = Path(profile_dir) / "SingletonLock"
    return lock_file.exists()


def is_our_chrome_profile_in_use() -> bool:
    """Check if OUR Chrome profile is already in use.

    We use a separate profile at ~/.notebooklm-mcp/chrome-profile
    so we can run alongside the user's main Chrome browser.

    This only checks if our specific profile is locked, NOT if Chrome
    is running in general. Users can have their main Chrome open.
    """
    return is_chrome_profile_locked()  # Already checks our profile by default


def has_chrome_profile() -> bool:
    """Check if a Chrome profile with saved login exists.
    
    Returns True if the profile directory exists and has login cookies,
    indicating that the user has previously authenticated.
    """
    profile_dir = Path.home() / ".notebooklm-mcp" / "chrome-profile"
    # Check for Cookies file which indicates the profile has been used
    cookies_file = profile_dir / "Default" / "Cookies"
    return cookies_file.exists()


def run_headless_auth(port: int = 9223, timeout: int = 30) -> AuthTokens | None:
    """Run authentication in headless mode (no user interaction).
    
    This only works if the Chrome profile already has saved Google login.
    The Chrome process is automatically terminated after token extraction.
    
    Args:
        port: Chrome DevTools port (use different port to avoid conflicts)
        timeout: Maximum time to wait for auth extraction
        
    Returns:
        AuthTokens if successful, None if failed or no saved login
    """
    import subprocess
    
    # Check if profile exists with saved login
    if not has_chrome_profile():
        return None
    
    # Check if our profile is already in use
    if is_our_chrome_profile_in_use():
        return None
    
    chrome_process: subprocess.Popen | None = None
    try:
        # Launch Chrome in headless mode
        chrome_process = launch_chrome(port, headless=True)
        if not chrome_process:
            return None
        
        # Wait for Chrome debugger to be ready
        debugger_url = None
        for _ in range(5):  # Try up to 5 times
            debugger_url = get_chrome_debugger_url(port)
            if debugger_url:
                break
            time.sleep(1)
        
        if not debugger_url:
            return None
        
        # Find or create NotebookLM page
        page = find_or_create_notebooklm_page(port)
        if not page:
            return None
        
        ws_url = page.get("webSocketDebuggerUrl")
        if not ws_url:
            return None
        
        # Check if logged in by URL
        current_url = get_current_url(ws_url)
        if not check_if_logged_in_by_url(current_url):
            # Not logged in - headless can't help
            return None
        
        # Extract cookies
        cookies_list = get_page_cookies(ws_url)
        cookies = {c["name"]: c["value"] for c in cookies_list}
        
        if not validate_cookies(cookies):
            return None
        
        # Get page HTML for CSRF extraction
        html = get_page_html(ws_url)
        csrf_token = extract_csrf_from_page_source(html)
        session_id = extract_session_id_from_html(html)
        
        # Create and save tokens
        tokens = AuthTokens(
            cookies=cookies,
            csrf_token=csrf_token or "",
            session_id=session_id or "",
            extracted_at=time.time(),
        )
        save_tokens_to_cache(tokens)
        
        return tokens
        
    except Exception:
        return None
        
    finally:
        # IMPORTANT: Always terminate headless Chrome
        if chrome_process:
            try:
                chrome_process.terminate()
                chrome_process.wait(timeout=5)
            except Exception:
                # Force kill if terminate didn't work
                try:
                    chrome_process.kill()
                except Exception:
                    pass



def run_auth_flow(port: int = CDP_DEFAULT_PORT, auto_launch: bool = True) -> AuthTokens | None:
    """Run the authentication flow.

    Args:
        port: Chrome DevTools port
        auto_launch: If True, automatically launch Chrome if not running
    """
    pass # print("NotebookLM MCP Authentication")
    pass # print("=" * 40)
    pass # print()

    # Track Chrome process so we can close it after auth
    chrome_process = None
    
    # Check if Chrome is running with debugging
    debugger_url = get_chrome_debugger_url(port)

    if not debugger_url and auto_launch:
        # Check if our specific profile is already in use
        if is_our_chrome_profile_in_use():
            pass # print("The NotebookLM auth profile is already in use.")
            pass # print()
            pass # print("This means a previous auth Chrome window is still open.")
            pass # print("Close that window and try again, or use file mode:")
            pass # print()
            pass # print("  notebooklm-mcp-auth --file")
            pass # print()
            return None

        # We can launch our separate Chrome profile even if user's main Chrome is open
        pass # print("Launching Chrome with NotebookLM auth profile...")
        pass # print("(First time: you'll need to log in to your Google account)")
        pass # print()
        # Launch with visible window so user can log in
        chrome_process = launch_chrome(port, headless=False)
        time.sleep(3)
        debugger_url = get_chrome_debugger_url(port)

    if not debugger_url:
        pass # print(f"ERROR: Cannot connect to Chrome on port {port}")
        pass # print()
        pass # print("This can happen if:")
        pass # print("  - Chrome failed to start")
        pass # print("  - Another process is using port 9222")
        pass # print("  - Firewall is blocking the port")
        pass # print()
        pass # print("TRY: Use file mode instead (most reliable):")
        pass # print("     notebooklm-mcp-auth --file")
        pass # print()
        return None

    pass # print(f"Connected to Chrome debugger")

    # Find or create NotebookLM page
    page = find_or_create_notebooklm_page(port)
    if not page:
        pass # print("ERROR: Failed to find or create NotebookLM page")
        return None

    ws_url = page.get("webSocketDebuggerUrl")
    if not ws_url:
        pass # print("ERROR: No WebSocket URL for page")
        return None

    pass # print(f"Using page: {page.get('title', 'Unknown')}")

    # Navigate to NotebookLM if needed
    current_url = page.get("url", "")
    if "notebooklm.google.com" not in current_url:
        pass # print("Navigating to NotebookLM...")
        navigate_to_url(ws_url, NOTEBOOKLM_URL)

    # Check login status by URL (cheap - no HTML parsing)
    pass # print("Checking login status...")
    current_url = get_current_url(ws_url)

    if not check_if_logged_in_by_url(current_url):
        pass # print()
        pass # print("=" * 40)
        pass # print("NOT LOGGED IN")
        pass # print("=" * 40)
        pass # print()
        pass # print("Please log in to NotebookLM in the Chrome window.")
        pass # print("This tool will wait for you to complete login...")
        pass # print()
        pass # print("(Press Ctrl+C to cancel)")
        pass # print()

        # Wait for login - check URL every 5 seconds (cheap operation)
        max_wait = 300  # 5 minutes
        start_time = time.time()
        while time.time() - start_time < max_wait:
            time.sleep(5)
            try:
                current_url = get_current_url(ws_url)
                if check_if_logged_in_by_url(current_url):
                    pass # print("Login detected!")
                    break
            except Exception as e:
                pass # print(f"Waiting... ({e})")

        if not check_if_logged_in_by_url(current_url):
            pass # print("ERROR: Login timeout. Please try again.")
            return None

    # Extract cookies
    pass # print("Extracting cookies...")
    cookies_list = get_page_cookies(ws_url)
    cookies = {c["name"]: c["value"] for c in cookies_list}

    if not validate_cookies(cookies):
        pass # print("ERROR: Missing required cookies. Please ensure you're fully logged in.")
        pass # print(f"Required: {REQUIRED_COOKIES}")
        pass # print(f"Found: {list(cookies.keys())}")
        return None

    # Get page HTML for CSRF extraction
    html = get_page_html(ws_url)

    # Extract CSRF token
    pass # print("Extracting CSRF token...")
    csrf_token = extract_csrf_from_page_source(html)
    if not csrf_token:
        pass # print("WARNING: Could not extract CSRF token from page.")
        pass # print("You may need to extract it manually from Network tab.")
        csrf_token = ""

    # Extract session ID
    session_id = extract_session_id_from_html(html)

    # Create tokens object
    tokens = AuthTokens(
        cookies=cookies,
        csrf_token=csrf_token,
        session_id=session_id,
        extracted_at=time.time(),
    )

    # Save to cache
    save_tokens_to_cache(tokens)

    pass # print()
    pass # print("=" * 40)
    pass # print("SUCCESS!")
    pass # print("=" * 40)
    pass # print()
    pass # print(f"Cookies: {len(cookies)} extracted")
    pass # print(f"CSRF Token: {'Yes' if csrf_token else 'No (will be auto-extracted)'}")
    pass # print(f"Session ID: {session_id or 'Will be auto-extracted'}")
    pass # print()
    pass # print(f"Tokens cached to: {get_cache_path()}")
    pass # print()
    pass # print("NEXT STEPS:")
    pass # print()
    pass # print("  1. Add the MCP to your AI tool (if not already done):")
    pass # print()
    pass # print("     Claude Code:")
    pass # print("       claude mcp add notebooklm-mcp -- notebooklm-mcp")
    pass # print()
    pass # print("     Gemini CLI:")
    pass # print("       gemini mcp add notebooklm notebooklm-mcp")
    pass # print()
    pass # print("     Or add to settings.json manually:")
    pass # print('       "notebooklm-mcp": { "command": "notebooklm-mcp" }')
    pass # print()
    pass # print("  2. Restart your AI assistant")
    pass # print()
    pass # print("  3. Test by asking: 'List my NotebookLM notebooks'")
    pass # print()

    # Close Chrome if we launched it - this unlocks the profile for headless auth
    if chrome_process:
        pass # print("Closing Chrome (profile saved for future headless auth)...")
        try:
            chrome_process.terminate()
            chrome_process.wait(timeout=5)
        except Exception:
            try:
                chrome_process.kill()
            except Exception:
                pass
        pass # print()

    return tokens


def run_file_cookie_entry(cookie_file: str | None = None) -> AuthTokens | None:
    """Read cookies from a file and save them.

    This is the recommended way to authenticate - users save their cookies
    to a text file to avoid terminal truncation issues.

    Args:
        cookie_file: Optional path to file. If not provided, shows instructions
                     and prompts for the path.
    """
    pass # print("NotebookLM MCP - Cookie File Import")
    pass # print("=" * 50)
    pass # print()

    # If no file provided, show instructions and prompt for path
    if not cookie_file:
        pass # print("Follow these steps to extract and save your cookies:")
        pass # print()
        pass # print("  1. Open Chrome and go to: https://notebooklm.google.com")
        pass # print("  2. Make sure you're logged in")
        pass # print("  3. Press F12 (or Cmd+Option+I on Mac) to open DevTools")
        pass # print("  4. Click the 'Network' tab")
        pass # print("  5. In the filter box, type: batchexecute")
        pass # print("  6. Click on any notebook to trigger a request")
        pass # print("  7. Click on a 'batchexecute' request in the list")
        pass # print("  8. In the right panel, find 'Request Headers'")
        pass # print("  9. Find the line starting with 'cookie:'")
        pass # print(" 10. Right-click the cookie VALUE and select 'Copy value'")
        pass # print(" 11. Edit the 'cookies.txt' file in this repo (or create a new file)")
        pass # print(" 12. Paste the cookie string and save")
        pass # print()
        pass # print("TIP: If running from the repo directory, just edit 'cookies.txt'")
        pass # print("     and enter: cookies.txt")
        pass # print()
        pass # print("-" * 50)
        pass # print()

        try:
            cookie_file = input("Enter the path to your cookie file: ").strip()
        except (EOFError, KeyboardInterrupt):
            pass # print("\nCancelled.")
            return None

        if not cookie_file:
            pass # print("ERROR: No file path provided.")
            return None

        # Expand ~ to home directory
        cookie_file = str(Path(cookie_file).expanduser())

    pass # print()
    pass # print(f"Reading cookies from: {cookie_file}")
    pass # print()

    try:
        with open(cookie_file, "r") as f:
            cookie_string = f.read().strip()
    except FileNotFoundError:
        pass # print(f"ERROR: File not found: {cookie_file}")
        return None
    except Exception as e:
        pass # print(f"ERROR: Could not read file: {e}")
        return None

    # Strip comment lines (lines starting with #)
    lines = cookie_string.split("\n")
    cookie_lines = [line.strip() for line in lines if line.strip() and not line.strip().startswith("#")]
    cookie_string = " ".join(cookie_lines)

    if not cookie_string:
        pass # print("\nERROR: No cookie string found in file.")
        pass # print("Make sure you pasted your cookies and removed the instructions.")
        return None

    pass # print()
    pass # print("Validating cookies...")

    # Parse cookies from header format (key=value; key=value; ...)
    cookies = {}
    for cookie in cookie_string.split(";"):
        cookie = cookie.strip()
        if "=" in cookie:
            key, value = cookie.split("=", 1)
            cookies[key.strip()] = value.strip()

    if not cookies:
        pass # print("\nERROR: Could not parse any cookies from input.")
        pass # print("Make sure you copied the cookie VALUE, not the header name.")
        pass # print()
        pass # print("Expected format: SID=xxx; HSID=xxx; SSID=xxx; ...")
        return None

    # Validate required cookies
    if not validate_cookies(cookies):
        pass # print("\nWARNING: Some required cookies are missing!")
        pass # print(f"Required: {REQUIRED_COOKIES}")
        pass # print(f"Found: {list(cookies.keys())}")
        pass # print()
        pass # print("Continuing anyway...")

    # Create tokens object (CSRF and session ID will be auto-extracted later)
    tokens = AuthTokens(
        cookies=cookies,
        csrf_token="",  # Will be auto-extracted
        session_id="",  # Will be auto-extracted
        extracted_at=time.time(),
    )

    # Save to cache
    pass # print()
    pass # print("Saving cookies...")
    save_tokens_to_cache(tokens)

    pass # print()
    pass # print("=" * 50)
    pass # print("SUCCESS!")
    pass # print("=" * 50)
    pass # print()
    pass # print(f"Cookies saved: {len(cookies)} cookies")
    pass # print(f"Cache location: {get_cache_path()}")
    pass # print()
    pass # print("NEXT STEPS:")
    pass # print()
    pass # print("  1. Add the MCP to your AI tool (if not already done):")
    pass # print()
    pass # print("     Claude Code:")
    pass # print("       claude mcp add notebooklm-mcp -- notebooklm-mcp")
    pass # print()
    pass # print("     Gemini CLI:")
    pass # print("       gemini mcp add notebooklm notebooklm-mcp")
    pass # print()
    pass # print("     Or add to settings.json manually:")
    pass # print('       "notebooklm-mcp": { "command": "notebooklm-mcp" }')
    pass # print()
    pass # print("  2. Restart your AI assistant")
    pass # print()
    pass # print("  3. Test by asking: 'List my NotebookLM notebooks'")
    pass # print()

    return tokens


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Authenticate with NotebookLM MCP",
        epilog="""
This tool extracts authentication tokens from Chrome for use with the NotebookLM MCP.

TWO MODES:

1. FILE MODE (--file): Import cookies from a file (RECOMMENDED)
   - Shows step-by-step instructions for extracting cookies
   - Prompts you for the file path after you save the cookies
   - No Chrome remote debugging required

2. AUTO MODE (default): Automatic extraction via Chrome DevTools
   - Requires closing Chrome first
   - Launches Chrome and extracts cookies automatically
   - May not work on all systems

EXAMPLES:
  notebooklm-mcp-auth --file               # Guided file import (recommended)
  notebooklm-mcp-auth --file ~/cookies.txt # Direct file import
  notebooklm-mcp-auth                      # Auto mode (close Chrome first)

After authentication, start the MCP server with: notebooklm-mcp
        """
    )
    parser.add_argument(
        "--file",
        nargs="?",
        const="",  # When --file is used without argument, set to empty string
        metavar="PATH",
        help="Import cookies from file (recommended). Shows instructions if no path given."
    )
    parser.add_argument(
        "--port",
        type=int,
        default=CDP_DEFAULT_PORT,
        help=f"Chrome DevTools port (default: {CDP_DEFAULT_PORT})"
    )
    parser.add_argument(
        "--show-tokens",
        action="store_true",
        help="Show cached tokens (for debugging)"
    )
    parser.add_argument(
        "--no-auto-launch",
        action="store_true",
        help="Don't automatically launch Chrome (requires Chrome to be running with debugging)"
    )

    args = parser.parse_args()

    if args.show_tokens:
        cache_path = get_cache_path()
        if cache_path.exists():
            with open(cache_path) as f:
                data = json.load(f)
            pass # print(json.dumps(data, indent=2))
        else:
            pass # print("No cached tokens found.")
        return 0

    try:
        if args.file is not None:  # --file was used (with or without path)
            # File-based cookie import
            tokens = run_file_cookie_entry(cookie_file=args.file if args.file else None)
        else:
            # Automatic extraction via Chrome DevTools
            tokens = run_auth_flow(args.port, auto_launch=not args.no_auto_launch)

        return 0 if tokens else 1
    except KeyboardInterrupt:
        pass # print("\nCancelled.")
        return 1
    except Exception as e:
        pass # print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
