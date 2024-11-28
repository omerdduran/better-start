const CONFIG = {
  commandPathDelimiter: '/',
  commandSearchDelimiter: ' ',
  defaultSearchTemplate: 'https://duckduckgo.com/?q={}',
  openLinksInNewTab: true,
  suggestionLimit: 4,
  searchEngines: {
    duckduckgo: {
      name: 'DuckDuckGo',
      template: 'https://duckduckgo.com/?q={}',
      suggestionUrl: 'https://duckduckgo.com/ac/?type=list&q={}'
    },
    google: {
      name: 'Google',
      template: 'https://www.google.com/search?q={}',
      suggestionUrl: 'https://suggestqueries.google.com/complete/search?client=firefox&q={}'
    },
    bing: {
      name: 'Bing',
      template: 'https://www.bing.com/search?q={}',
      suggestionUrl: 'https://api.bing.com/qsonhs.aspx?type=cb&q={}'
    }
  },
  defaultSettings: {
    // Theme settings
    theme: 'system',
    layout: 'grid',
    
    // Search settings
    defaultSearch: 'duckduckgo',
    newTab: true,
    
    // Weather settings
    weatherEnabled: true,
    weatherLocation: '',
    weatherF: false,
    
    // Clock settings
    clockEnabled: true,
    clock24h: false,
    clockShowDate: true,
    
    // Notes settings
    notesEnabled: true,
    notesPosition: 'left', // 'left' or 'right'
    notesExpanded: true,
    
    // Commands settings
    commandsColumns: 'auto', // 'auto', '2', '3', '4', '6'
    commandsShowKeys: true,
    commandsShowNames: true,
    
    // Bookmarks settings
    bookmarksEnabled: true,
    bookmarksPosition: 'top', // 'top' or 'bottom'
    bookmarksLimit: 10,
    bookmarksShowFavicons: true,
    
    // Todo settings
    todoEnabled: true,
    todoPosition: 'right',
    todoExpanded: true,
    todoCategories: ['Personal', 'Work', 'Shopping'],
    
    // RSS settings
    rssEnabled: false,
    rssPosition: 'right',
    rssExpanded: true,
    rssRefreshInterval: 30,
    rssFeeds: [
      { name: 'Example Feed', url: 'https://example.com/feed.xml' }
    ],
    
    // Calendar settings
    calendarEnabled: false,
    calendarPosition: 'right',
    calendarView: 'month',
    calendarFirstDay: 1,
    calendarShowEvents: true,
    
    // Search history settings
    searchHistoryEnabled: true,
    searchHistoryLimit: 100,
    searchHistorySuggestions: true,
    
    // Shortcuts settings
    shortcutsEnabled: true,
    shortcuts: {
      'Ctrl+/': 'toggleSearch',
      'Ctrl+,': 'toggleSettings',
      'Ctrl+b': 'toggleBookmarks',
      'Esc': 'closeAll'
    }
  }
};

// prettier-ignore
const COMMANDS = new Map([
    ['a', { name: 'Chat', searchTemplate: '?q={}', url: 'https://chatgpt.com' }],
    ['c', { name: 'Cloud', url: 'https://dash.cloudflare.com' }],
    ['d', { name: 'Drive', url: 'https://drive.google.com/drive/u/0/my-drive' }],
]); 