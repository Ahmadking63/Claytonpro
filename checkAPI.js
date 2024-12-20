const axios = require("axios");
const { log } = require("./utils"); // Adjust the path as necessary
const settings = require("./config/config");

const baseUrl = settings.BASE_URL;
const urlChecking = "https://raw.githubusercontent.com/Hunga9k50doker/APIs-checking/refs/heads/main/endpoints.json";
async function getMainJsFormat(baseUrl) {
  try {
    const response = await axios.get(baseUrl);
    const content = response.data;
    const matches = content.match(/src="(\/assets\/index-[^"]+\.js)"/g);

    if (matches) {
      const uniqueMatches = Array.from(new Set(matches.map((m) => m.slice(5, -1)))); // Remove 'src="' and '"'
      return uniqueMatches.sort((a, b) => b.length - a.length); // Sort by length descending
    } else {
      return null;
    }
  } catch (error) {
    log(`Error fetching the base URL: ${error.message}`, "warning");
    return null;
  }
}

async function checkBaseUrl() {
  const base_url = "https://tonclayton.fun/";
  const mainJsFormats = await getMainJsFormat(base_url);
  if (settings.ADVANCED_ANTI_DETECTION) {
    if (mainJsFormats) {
      for (const format of mainJsFormats) {
        log(`Trying format: ${format}`);
        // const fullUrl = `https://tonclayton.fun${format}`;
        const result = await getBaseApi(urlChecking);
        if (result && result?.endpoint?.includes(baseUrl)) {
          log("No change in api!", "success");
          return result;
        }
      }
      return false;
    } else {
      log("Could not find any main.js format. Dumping page content for inspection:");
      try {
        const response = await axios.get(base_url);
        console.log(response.data.slice(0, 1000)); // Print first 1000 characters of the page
        return false;
      } catch (error) {
        log(`Error fetching the base URL for content dump: ${error.message}`, "warning");
        return false;
      }
    }
  } else {
    if (settings.API_ID) {
      return `https://tonclayton.fun/api/${settings.API_ID}`;
    } else {
      log(`Cần cung cấp API_ID trong file .env`, "error");
      return false;
    }
  }
}

async function getBaseApi(url) {
  try {
    const response = await axios.get(url);
    const content = response.data;
    if (content?.clayton) {
      return { endpoint: content.clayton, message: content.copyright };
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

module.exports = { checkBaseUrl };
