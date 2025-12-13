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
    },
    yahoo: {
      name: 'Yahoo',
      template: 'https://search.yahoo.com/search?p={}',
      suggestionUrl: null
    },
    brave: {
      name: 'Brave',
      template: 'https://search.brave.com/search?q={}',
      suggestionUrl: null
    },
    ecosia: {
      name: 'Ecosia',
      template: 'https://www.ecosia.org/search?q={}',
      suggestionUrl: null
    },
    startpage: {
      name: 'Startpage',
      template: 'https://www.startpage.com/do/search?q={}',
      suggestionUrl: null
    },
    yandex: {
      name: 'Yandex',
      template: 'https://yandex.com/search/?text={}',
      suggestionUrl: null
    }
  },
  defaultSettings: {
    theme: 'system',
    defaultSearch: 'duckduckgo',
    newTab: true,
    pageTitle: 'Better Start',
    weatherEnabled: true,
    weatherLocation: '',
    weatherF: false,
    weatherHumidity: true,
    weatherWind: true,
    weatherUV: true,
    clockEnabled: true,
    clock24h: false,
    clockShowDate: true,
    clockSecondaryTimezones: '',
    commandsColumns: 4
  }
};

// prettier-ignore
const COMMANDS = new Map([
  // Grid visible commands
  ['a', { name: 'Chat', searchTemplate: '?q={}', url: 'https://chatgpt.com' }],
  ['c', { name: 'Cloud', url: 'https://dash.cloudflare.com' }],
  ['d', { name: 'Drive', url: 'https://drive.google.com/drive/u/0/my-drive' }],
  ['g', { name: 'GitHub', url: 'https://github.com' }],
  ['f', { name: 'Figma', url: 'https://figma.com' }],
  ['u', { name: 'Udemy', url: 'https://www.udemy.com/home/my-courses/learning/' }],
  ['t', { name: 'Translate', url: 'https://www.deepl.com/translator', searchTemplate: '#en/tr/{}', suggestions: ['t-de', 't-fr', 't-es'] }],
  ['r', { name: 'Reddit', url: 'https://reddit.com', searchTemplate: '/search/?q={}' }],

  // Hidden commands (no name = not shown in grid)
  ['google', { url: 'https://www.google.com', searchTemplate: '/search?q={}' }],
  ['0', { url: 'http://localhost:', searchTemplate: ':{}' }],

  // Translate suggestions
  ['t-de', { url: 'https://www.deepl.com/translator', searchTemplate: '#en/de/{}' }],
  ['t-fr', { url: 'https://www.deepl.com/translator', searchTemplate: '#en/fr/{}' }],
  ['t-es', { url: 'https://www.deepl.com/translator', searchTemplate: '#en/es/{}' }],
]);