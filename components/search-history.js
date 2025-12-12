class SearchHistory {
  static async add(query) {
    const { searchHistory = [] } = await browser.storage.sync.get('searchHistory');
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 100);
    await browser.storage.sync.set({ searchHistory: newHistory });
  }

  static async getSuggestions(query) {
    const { searchHistory = [] } = await browser.storage.sync.get('searchHistory');
    return searchHistory
      .filter(q => q.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }
} 