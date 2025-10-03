// Rensto Homepage Content Script
// Add this script to your Webflow Designer in the page settings > custom code > head code

document.addEventListener("DOMContentLoaded", function() {
    // Only run on homepage
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
        // Remove any existing embedded content
        const existingEmbed = document.querySelector('.w-embed.w-script');
        if (existingEmbed) {
            existingEmbed.remove();
        }
        
        // Create the proper homepage content with Rensto logo
        const homepageContent = `
            <div style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #110d28 0%, #1a162f 100%); color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif;">
                <img src="https://cdn.prod.website-files.com/66c7e551a317e0e9c9f906d8/687aaf598fc070ae333b111c_Rensto%20Logo.png" alt="Rensto Logo" style="width: 300px; height: auto; margin-bottom: 40px; max-width: 100%;">
                <h1 style="color: #fe3d51; font-size: 3.5rem; margin-bottom: 20px; font-weight: 700; text-align: center; line-height: 1.2;">
                    AI-Powered Virtual Workers<br>That Actually Work
                </h1>
                <p style="color: #5ffbfd; font-size: 1.3rem; margin-bottom: 30px; text-align: center; max-width: 800px; line-height: 1.6;">
                    Transform your business with AI-powered virtual workers. No more endless meetings, no more manual tasks. Just results.
                </p>
                <div style="display: flex; gap: 1.5rem; margin-top: 2rem; flex-wrap: wrap; justify-content: center;">
                    <a href="/categories" style="background: #fe3d51; color: white; padding: 1.2rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(254, 61, 81, 0.3);">
                        Explore Virtual Workers
                    </a>
                    <a href="/contact" style="background: transparent; color: #1eaef7; border: 2px solid #1eaef7; padding: 1.2rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: all 0.3s ease;">
                        Get Started
                    </a>
                </div>
                <div style="margin-top: 4rem; text-align: center;">
                    <p style="color: #b0bec5; font-size: 1rem; margin-bottom: 1rem;">Trusted by businesses worldwide</p>
                    <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; align-items: center;">
                        <div style="color: #5ffbfd; font-size: 1.1rem; font-weight: 600;">⚡ 10x Faster</div>
                        <div style="color: #5ffbfd; font-size: 1.1rem; font-weight: 600;">💰 80% Cost Savings</div>
                        <div style="color: #5ffbfd; font-size: 1.1rem; font-weight: 600;">🔄 24/7 Available</div>
                    </div>
                </div>
            </div>
        `;
        
        // Replace the body content
        document.body.innerHTML = homepageContent;
    }
});
