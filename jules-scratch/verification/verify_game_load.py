import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console messages and print them
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        # Navigate to the local server, pointing to the game's subdirectory
        page.goto('http://localhost:8000/RunaDefenders/')

        # Wait for the loading screen to disappear
        loading_screen = page.locator('#loading-screen')
        expect(loading_screen).to_be_hidden(timeout=15000)

        # Wait for the start button to be visible, which indicates the game has loaded
        start_button = page.get_by_role('button', name='Empezar')
        expect(start_button).to_be_visible(timeout=10000)

        # Take a screenshot of the start screen
        page.screenshot(path='jules-scratch/verification/game_loaded.png')

        browser.close()

if __name__ == "__main__":
    run_verification()
