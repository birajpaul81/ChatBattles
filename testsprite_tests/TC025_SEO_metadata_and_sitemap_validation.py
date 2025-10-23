import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Fetch sitemap.xml and check for correct URLs
        await page.goto('http://localhost:3000/sitemap.xml', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate to /robots.txt and verify its contents to ensure sensitive paths are disallowed
        await page.goto('http://localhost:3000/robots.txt', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Check another static informational page (e.g., /about) for presence of correct SEO metadata tags
        await page.goto('http://localhost:3000/about', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=ChatBattles.ai').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Home').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sign In').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sign Up').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=About ChatBattles.ai').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Empowering users to compare and choose the best AI for their needs').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=⚔️').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Our Mission').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=In a world with countless AI models, each with unique strengths and perspectives, we asked ourselves: Why choose just one?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ChatBattles.ai was born from the belief that comparing AI responses shouldn\'t be complicated. We make it simple, visual, and free for everyone to see multiple AI perspectives side-by-side in real-time.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🎯 What We Do').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=⚡ Instant Comparison').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Submit one prompt and watch three top AI models respond simultaneously').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🎨 Beautiful Interface').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Enjoy a sleek, futuristic design that makes AI comparison effortless').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=💎 Completely Free').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No subscriptions, no hidden fees—just pure AI power at your fingertips').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=📝 History Tracking').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Save and revisit your favorite AI battles anytime').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🤖 The Models We Battle').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=GPT-5-Nano').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=OpenAI\'s latest nano model, optimized for speed and efficiency without compromising on intelligence. Perfect for quick, accurate responses.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Grok-4').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=X.ai\'s conversational powerhouse with a unique personality. Known for its wit, real-world knowledge, and engaging responses.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DeepSeek v3.1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Advanced reasoning model excelling at complex problem-solving, technical analysis, and deep dives into challenging topics.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=💡 Why We Built This').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=As AI enthusiasts, we found ourselves constantly switching between different AI platforms to compare responses. It was time-consuming and frustrating.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We thought: "There has to be a better way."').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=So we built ChatBattles.ai—a platform that brings multiple AI models into one arena, letting them battle for the best response. The result? Better insights, faster decisions, and a more complete understanding of any topic.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🌟 Our Values').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🔓 Open Access').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AI power should be accessible to everyone, not just those who can afford premium subscriptions').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🎯 Transparency').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We show you exactly what each AI thinks, with no hidden algorithms or biased curation').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🚀 Innovation').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We\'re constantly evolving, adding new models and features based on your feedback').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=👨‍💻 Built with Passion').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ChatBattles.ai was created by Biraj, a developer passionate about making AI technology more accessible and useful for everyone.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Built with cutting-edge technologies including Next.js 15, TypeScript, Tailwind CSS, Clerk authentication, and Supabase database—all to provide you with the best AI comparison experience.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=🔮 What\'s Next?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=We\'re just getting started! Here\'s what\'s on our roadmap:').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=▸ More AI models to compare (Claude, Llama, Gemini, and more)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=▸ Custom model selection for personalized battles').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=▸ Shareable battle results for easy collaboration').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=▸ Advanced analytics and model comparison metrics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=▸ Community features and public battle archives').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ready to Battle?').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Join thousands of users comparing AI responses every day').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Start Your First Battle').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=About').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=FAQ').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Contact').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Terms').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Privacy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2025 ChatBattles.ai — Made with ⚡ by Biraj').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    