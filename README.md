# OSINT Box
Comprehensive Country-Based OSINT Toolbox

**OSINT Box** is an open-source, country-focused collection of OSINT (Open Source Intelligence) tools and resources. The goal of this project is to provide researchers, journalists, security analysts, and enthusiasts with structured and easy access to OSINT tools specific to each country, with additional information about tool pricing and registration requirements.

---

## Project Goals
- Collect, categorize, and maintain OSINT tools for different countries.
- Display detailed tool information including:
  - Name
  - Short description
  - Link
  - Pricing (Free or Paid)
  - Signup requirement (True or flase)
- Provide a user-friendly interface with categorized tabs and clear tool indicators.
- Encourage open collaboration to expand and improve the toolbox.

---

## Project Structure
- `/countries/`: Each country has its own folder containing an `index.html` and a JSON file with tools data.
  - Example: `countries/iran/iran.json`
- `/tools/`: General OSINT tools categorized by type (e.g., Web Scraping, Social Media Analysis, Public Records, etc.) – **coming soon!**
- `/assets/`: Contains CSS, JS, images, and other frontend assets.

**JSON Tool Structure Example:**

```json
{
  "country": "Iran",
  "last_update": "2025-06-11",
  "tools": {
    "social_media": [
      {
        "name": "Lifeweb",
        "description": "Monitoring, observation and analysis of social media",
        "link": "https://lifewebco.com",
        "pricing": "paid",
        "signup_required": true
      }
    ],
    "government": [
      {
        "name": "RRK",
        "description": "Official Gazette of the Islamic Republic of Iran",
        "link": "https://rrk.ir",
        "pricing": "free",
        "signup_required": false
      }
    ]
  }
}
