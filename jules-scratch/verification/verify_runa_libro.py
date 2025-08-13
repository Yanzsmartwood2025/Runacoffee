import os
import argparse
from playwright.sync_api import sync_playwright, expect

def run_verification(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console errors
        errors = []
        page.on("console", lambda msg: "error" in msg.type and errors.append(msg.text))

        # Listen for failed requests
        failed_requests = []
        def handle_failed_request(request):
            if request.failure != 'net::ERR_ABORTED':
                failed_requests.append(f"{request.url} - {request.failure}")

        page.on("requestfailed", handle_failed_request)

        # Navigate to the local server
        page.goto(url)

        # Wait for the main video background to be visible
        video_background = page.locator('#video-background')
        expect(video_background).to_be_visible(timeout=10000)

        # Check for console errors
        if errors:
            print("Console errors found:")
            for error in errors:
                print(error)

        # Check for failed requests
        if failed_requests:
            print("Failed requests found:")
            for url in failed_requests:
                print(url)

        if errors or failed_requests:
            raise Exception("Errors found during page load.")

        # Take a screenshot of the loaded book
        page.screenshot(path='jules-scratch/verification/runa_libro_loaded.png')

        browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Verify the Runa Libro page.')
    parser.add_argument('--url', type=str, required=True, help='The URL of the page to verify.')
    args = parser.parse_args()
    run_verification(args.url)
