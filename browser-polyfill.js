/**
 * Browser API Polyfill
 * Provides unified API access for Chrome and Firefox extensions
 * Uses 'browser' namespace (Firefox standard) with Chrome fallback
 */

// Detect browser type early
const isFirefoxBrowser = typeof browser !== 'undefined' && navigator.userAgent.includes('Firefox');
const isChromeBrowser = typeof chrome !== 'undefined' && !isFirefoxBrowser;

// For Firefox: Override storage.sync to use storage.local (sync doesn't work with temp addons)
if (isFirefoxBrowser) {
    // Firefox already has browser namespace, but we need to redirect sync to local
    const originalSync = browser.storage.sync;

    // Create wrapper that uses local storage but maintains sync API
    browser.storage.sync = {
        get: async (keys) => {
            try {
                return await originalSync.get(keys);
            } catch (e) {
                // Fallback to local storage if sync fails (temp addon issue)
                console.warn('[Better Startpage] Using local storage (sync not available for temp addon)');
                return await browser.storage.local.get(keys);
            }
        },
        set: async (items) => {
            try {
                return await originalSync.set(items);
            } catch (e) {
                // Fallback to local storage
                return await browser.storage.local.set(items);
            }
        },
        remove: async (keys) => {
            try {
                return await originalSync.remove(keys);
            } catch (e) {
                return await browser.storage.local.remove(keys);
            }
        },
        clear: async () => {
            try {
                return await originalSync.clear();
            } catch (e) {
                return await browser.storage.local.clear();
            }
        }
    };
}

// Create unified browser namespace for Chrome
if (typeof browser === 'undefined') {
    // We're in Chrome - create browser namespace that wraps chrome
    window.browser = {
        storage: {
            sync: {
                get: (keys) => new Promise((resolve, reject) => {
                    chrome.storage.sync.get(keys, (result) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(result);
                        }
                    });
                }),
                set: (items) => new Promise((resolve, reject) => {
                    chrome.storage.sync.set(items, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                }),
                remove: (keys) => new Promise((resolve, reject) => {
                    chrome.storage.sync.remove(keys, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                }),
                clear: () => new Promise((resolve, reject) => {
                    chrome.storage.sync.clear(() => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                })
            },
            local: {
                get: (keys) => new Promise((resolve, reject) => {
                    chrome.storage.local.get(keys, (result) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(result);
                        }
                    });
                }),
                set: (items) => new Promise((resolve, reject) => {
                    chrome.storage.local.set(items, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                }),
                remove: (keys) => new Promise((resolve, reject) => {
                    chrome.storage.local.remove(keys, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                }),
                clear: () => new Promise((resolve, reject) => {
                    chrome.storage.local.clear(() => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                })
            },
            onChanged: {
                addListener: (callback) => chrome.storage.onChanged.addListener(callback),
                removeListener: (callback) => chrome.storage.onChanged.removeListener(callback)
            }
        },
        bookmarks: {
            getRecent: (numberOfItems) => new Promise((resolve, reject) => {
                if (chrome.bookmarks) {
                    chrome.bookmarks.getRecent(numberOfItems, (bookmarks) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(bookmarks);
                        }
                    });
                } else {
                    resolve([]);
                }
            }),
            getTree: () => new Promise((resolve, reject) => {
                if (chrome.bookmarks) {
                    chrome.bookmarks.getTree((tree) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(tree);
                        }
                    });
                } else {
                    resolve([]);
                }
            })
        },
        runtime: {
            sendMessage: (message) => new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                });
            }),
            onMessage: {
                addListener: (callback) => chrome.runtime.onMessage.addListener(callback),
                removeListener: (callback) => chrome.runtime.onMessage.removeListener(callback)
            },
            getURL: (path) => chrome.runtime.getURL(path),
            lastError: chrome.runtime.lastError
        }
    };
}

// Utility function to check which browser we're running in
window.BrowserInfo = {
    isFirefox: isFirefoxBrowser,
    isChrome: isChromeBrowser,

    // Get favicon URL (different methods for each browser)
    getFaviconUrl: (pageUrl) => {
        if (isFirefoxBrowser) {
            // Firefox doesn't support chrome://favicon, use Google's service
            try {
                const url = new URL(pageUrl);
                return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
            } catch {
                return '';
            }
        } else {
            // Chrome supports chrome://favicon
            return `chrome://favicon/${pageUrl}`;
        }
    }
};

// Log which browser is detected
console.log(`[Better Startpage] Running in ${isFirefoxBrowser ? 'Firefox' : 'Chrome'}`);
