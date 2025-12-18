/**
 * New Tab Focus Handler
 * 
 * Based on newtaboverride's technique for stealing focus from address bar.
 * Creates a new tab and removes the old one to get focus on page content.
 * This behavior can be toggled via the "Focus page instead of address bar" setting.
 */

'use strict';

const TARGET_PAGE = browser.runtime.getURL('index.html');
const NEWTAB_PAGE = browser.runtime.getURL('newtab.html');

// Helper to handle both Promise and callback style APIs
const callApi = (apiMethod, ...args) => {
  return new Promise((resolve, reject) => {
    try {
      const result = apiMethod(...args, (response) => {
        if (browser.runtime.lastError) {
          reject(browser.runtime.lastError);
        } else {
          resolve(response);
        }
      });
      
      // If it returns a Promise (Firefox), use that instead
      if (result && typeof result.then === 'function') {
        result.then(resolve).catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
};

// Load index.html in an iframe (keeps URL clean)
const loadInIframe = () => {
  const iframe = document.createElement('iframe');
  iframe.src = TARGET_PAGE;
  iframe.setAttribute('allowfullscreen', 'true');
  document.body.appendChild(iframe);
  
  // Pass focus to iframe content when it loads
  iframe.addEventListener('load', () => {
    iframe.contentWindow.focus();
  });
};

(async () => {
  try {
    // Check if focus stealing is enabled
    const { focusPage = true } = await browser.storage.sync.get({ focusPage: true });
    
    // If disabled, load in iframe to keep URL clean
    if (!focusPage) {
      loadInIframe();
      return;
    }

    // Focus stealing enabled - use tab create/remove technique
    const tab = await callApi(browser.tabs.getCurrent.bind(browser.tabs));

    if (!tab) {
      loadInIframe();
      return;
    }

    const tabId = tab.id;
    const createOptions = { url: TARGET_PAGE };

    // Key technique: Create a NEW tab (gives focus to page), then remove old tab
    await callApi(browser.tabs.create.bind(browser.tabs), createOptions);
    await callApi(browser.tabs.remove.bind(browser.tabs), tabId);

    // Clean up history
    if (browser.history && browser.history.deleteUrl) {
      callApi(browser.history.deleteUrl.bind(browser.history), { url: NEWTAB_PAGE }).catch(() => {});
    }
  } catch (e) {
    console.error('Better Start newtab error:', e);
    loadInIframe();
  }
})();
