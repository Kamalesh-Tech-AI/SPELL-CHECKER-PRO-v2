// Global variables
let trie;
let spellChecker;
let analytics;
let currentView = 'editor';
let debounceTimeout;
let settings = {
    maxSuggestions: 5,
    minWordLength: 2,
    editDistance: 2,
    caseSensitive: false,
    realTimeCheck: true,
    debounceDelay: 300
};

// DOM elements
let textEditor;
let suggestionsDropdown;
let liveSuggestions;
let spellErrors;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication for regular users
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role === 'admin') {
        // Redirect admin to admin dashboard, unauthenticated to login
        if (currentUser && currentUser.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Update header with user info
    updateUserHeader(currentUser);
    
    initializeComponents();
    initializeEventListeners();
    initializeSettings();
    loadData();
    updateUI();
});

function updateUserHeader(user) {
    // Add user info to header
    const headerContent = document.querySelector('.header-content');
    if (headerContent && !document.getElementById('userInfo')) {
        const userInfo = document.createElement('div');
        userInfo.id = 'userInfo';
        userInfo.style.cssText = 'display: flex; align-items: center; gap: 1rem; margin-left: auto;';
        userInfo.innerHTML = `
            <span style="color: #64748b; font-size: 0.875rem;">Welcome, ${user.name}</span>
            <button onclick="logout()" style="background: #fee2e2; color: #dc2626; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                Logout
            </button>
        `;
        headerContent.appendChild(userInfo);
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function initializeComponents() {
    // Initialize core components
    trie = new Trie();
    spellChecker = new SpellChecker(trie);
    analytics = new Analytics();
    
    // Get DOM elements
    textEditor = document.getElementById('text-editor');
    suggestionsDropdown = document.getElementById('suggestions-dropdown');
    liveSuggestions = document.getElementById('live-suggestions');
    spellErrors = document.getElementById('spell-errors');
}

function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
    
    // Text editor events
    textEditor.addEventListener('input', handleTextInput);
    textEditor.addEventListener('keydown', handleKeyDown);
    textEditor.addEventListener('blur', hideSuggestions);
    
    // Header buttons
    document.getElementById('clear-btn').addEventListener('click', clearText);
    document.getElementById('export-btn').addEventListener('click', exportReport);
    
    // Dictionary management
    document.getElementById('add-word-btn').addEventListener('click', addNewWord);
    document.getElementById('new-word').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewWord();
        }
    });
    document.getElementById('word-search').addEventListener('input', handleDictionarySearch);
    
    // Settings
    initializeSettingsListeners();
    
    // Window events
    window.addEventListener('beforeunload', saveData);
    
    // Auto-save every 30 seconds
    setInterval(saveData, 30000);
}

function initializeSettingsListeners() {
    // Sliders
    const sliders = ['max-suggestions', 'min-word-length', 'edit-distance', 'debounce-delay'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + '-value');
        
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
            updateSettings();
        });
    });
    
    // Checkboxes
    const checkboxes = ['case-sensitive', 'real-time-check'];
    checkboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', updateSettings);
    });
    
    // Settings buttons
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('reset-settings').addEventListener('click', resetSettings);
}

function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');
    
    // Update page title
    const titles = {
        editor: 'Text Editor',
        analytics: 'Analytics',
        dictionary: 'Dictionary',
        settings: 'Settings'
    };
    document.getElementById('page-title').textContent = titles[viewName] || 'SpellCheck Pro';
    
    currentView = viewName;
    
    // Update view-specific content
    if (viewName === 'analytics') {
        updateAnalyticsView();
    } else if (viewName === 'dictionary') {
        updateDictionaryView();
    }
}

function handleTextInput(e) {
    updateWordCount();
    
    if (settings.realTimeCheck) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            processTextInput();
        }, settings.debounceDelay);
    }
}

function handleKeyDown(e) {
    const dropdown = suggestionsDropdown;
    
    if (dropdown.style.display === 'block') {
        const items = dropdown.querySelectorAll('.suggestion-item');
        const activeItem = dropdown.querySelector('.suggestion-item.active');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextItem = activeItem 
                    ? activeItem.nextElementSibling 
                    : items[0];
                if (nextItem) {
                    items.forEach(item => item.classList.remove('active'));
                    nextItem.classList.add('active');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevItem = activeItem 
                    ? activeItem.previousElementSibling 
                    : items[items.length - 1];
                if (prevItem) {
                    items.forEach(item => item.classList.remove('active'));
                    prevItem.classList.add('active');
                }
                break;
                
            case 'Enter':
                if (activeItem) {
                    e.preventDefault();
                    applySuggestion(activeItem.textContent);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                hideSuggestions();
                break;
        }
    }
}

function processTextInput() {
    const text = textEditor.value;
    const cursorPosition = textEditor.selectionStart;
    
    // Get current word at cursor
    const currentWord = getCurrentWord(text, cursorPosition);
    
    if (currentWord && currentWord.word.length >= settings.minWordLength) {
        const startTime = performance.now();
        
        // Get auto-complete suggestions
        const suggestions = trie.getAllWordsWithPrefix(currentWord.word, settings.maxSuggestions);
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (suggestions.length > 0) {
            showSuggestions(suggestions, currentWord);
            analytics.recordSuggestion(currentWord.word, suggestions[0].word, responseTime);
        } else {
            hideSuggestions();
        }
        
        // Update live suggestions
        updateLiveSuggestions(suggestions);
        
        // Record word processing
        analytics.recordWordProcessed(currentWord.word);
    } else {
        hideSuggestions();
        updateLiveSuggestions([]);
    }
    
    // Spell check the entire text
    if (settings.realTimeCheck) {
        performSpellCheck(text);
    }
}

function getCurrentWord(text, position) {
    const beforeCursor = text.substring(0, position);
    const afterCursor = text.substring(position);
    
    const wordStart = beforeCursor.search(/\w+$/);
    const wordEndMatch = afterCursor.match(/^\w*/);
    const wordEnd = wordEndMatch ? wordEndMatch[0].length : 0;
    
    if (wordStart === -1) return null;
    
    const word = beforeCursor.substring(wordStart) + afterCursor.substring(0, wordEnd);
    
    return {
        word: word,
        start: wordStart,
        end: position + wordEnd
    };
}

function showSuggestions(suggestions, wordInfo) {
    if (!suggestions || suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsDropdown.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        if (index === 0) item.classList.add('active');
        item.textContent = suggestion.word;
        
        item.addEventListener('click', () => {
            applySuggestion(suggestion.word);
        });
        
        suggestionsDropdown.appendChild(item);
    });
    
    // Position the dropdown
    positionSuggestions();
    suggestionsDropdown.style.display = 'block';
}

function positionSuggestions() {
    const textareaRect = textEditor.getBoundingClientRect();
    const cursorPosition = textEditor.selectionStart;
    
    // Create a temporary element to measure text
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.font = window.getComputedStyle(textEditor).font;
    temp.style.whiteSpace = 'pre-wrap';
    temp.style.width = textEditor.clientWidth + 'px';
    temp.textContent = textEditor.value.substring(0, cursorPosition);
    
    document.body.appendChild(temp);
    
    const lines = temp.textContent.split('\n').length;
    const lineHeight = parseInt(window.getComputedStyle(textEditor).lineHeight) || 20;
    
    document.body.removeChild(temp);
    
    // Position dropdown
    suggestionsDropdown.style.left = '10px';
    suggestionsDropdown.style.top = (lines * lineHeight + 10) + 'px';
}

function hideSuggestions() {
    suggestionsDropdown.style.display = 'none';
}

function applySuggestion(suggestion) {
    const text = textEditor.value;
    const cursorPosition = textEditor.selectionStart;
    const currentWord = getCurrentWord(text, cursorPosition);
    
    if (currentWord) {
        const beforeWord = text.substring(0, currentWord.start);
        const afterWord = text.substring(currentWord.end);
        const newText = beforeWord + suggestion + afterWord;
        
        textEditor.value = newText;
        textEditor.focus();
        
        const newCursorPosition = currentWord.start + suggestion.length;
        textEditor.setSelectionRange(newCursorPosition, newCursorPosition);
        
        analytics.recordCorrection(currentWord.word, suggestion);
        updateWordCount();
    }
    
    hideSuggestions();
}

function updateLiveSuggestions(suggestions) {
    liveSuggestions.innerHTML = '';
    
    if (suggestions && suggestions.length > 0) {
        suggestions.slice(0, 8).forEach(suggestion => {
            const chip = document.createElement('span');
            chip.className = 'suggestion-chip';
            chip.textContent = suggestion.word;
            
            chip.addEventListener('click', () => {
                applySuggestion(suggestion.word);
            });
            
            liveSuggestions.appendChild(chip);
        });
    }
}

function performSpellCheck(text) {
    const errors = spellChecker.checkText(text);
    updateSpellErrors(errors);
    
    // Update error count
    document.getElementById('error-count').textContent = errors.length;
    
    // Record errors in analytics
    errors.forEach(error => {
        analytics.recordSpellError(error.word, error.suggestions);
    });
}

function updateSpellErrors(errors) {
    spellErrors.innerHTML = '';
    
    if (errors.length === 0) {
        spellErrors.innerHTML = '<p style="color: #10B981; font-weight: 500;">No spelling errors found!</p>';
        return;
    }
    
    errors.forEach(error => {
        const errorItem = document.createElement('div');
        errorItem.className = 'error-item';
        
        const errorWord = document.createElement('div');
        errorWord.className = 'error-word';
        errorWord.textContent = `"${error.word}"`;
        
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'error-suggestions';
        
        error.suggestions.forEach(suggestion => {
            const suggestionChip = document.createElement('span');
            suggestionChip.className = 'error-suggestion';
            suggestionChip.textContent = suggestion;
            
            suggestionChip.addEventListener('click', () => {
                replaceWordInText(error.word, suggestion);
            });
            
            suggestionsContainer.appendChild(suggestionChip);
        });
        
        errorItem.appendChild(errorWord);
        if (error.suggestions.length > 0) {
            errorItem.appendChild(suggestionsContainer);
        }
        
        spellErrors.appendChild(errorItem);
    });
}

function replaceWordInText(originalWord, replacement) {
    const text = textEditor.value;
    const regex = new RegExp(`\\b${originalWord}\\b`, 'gi');
    const newText = text.replace(regex, replacement);
    
    textEditor.value = newText;
    textEditor.focus();
    
    analytics.recordCorrection(originalWord, replacement);
    updateWordCount();
    processTextInput();
}

function updateWordCount() {
    const text = textEditor.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    
    document.getElementById('word-count').textContent = words;
    document.getElementById('char-count').textContent = characters;
}

function clearText() {
    if (textEditor.value && !confirm('Are you sure you want to clear all text?')) {
        return;
    }
    
    textEditor.value = '';
    textEditor.focus();
    updateWordCount();
    updateLiveSuggestions([]);
    updateSpellErrors([]);
    hideSuggestions();
}

function exportReport() {
    const report = analytics.generateReport();
    const timestamp = new Date().toISOString().split('T')[0];
    
    const content = `# SpellCheck Pro Report - ${timestamp}

## Session Summary
- Session Duration: ${report.summary.sessionDuration}
- Words Processed: ${report.summary.totalWordsProcessed}
- Suggestions Generated: ${report.summary.totalSuggestions}
- Spelling Errors Found: ${report.summary.totalErrors}
- Error Rate: ${report.summary.errorRate}
- Average Response Time: ${report.summary.averageResponseTime}

## Performance Metrics
- Average Response Time: ${report.performance.averageResponseTime}
- Median Response Time: ${report.performance.medianResponseTime}
- Fastest Response: ${report.performance.fastestResponse}
- Slowest Response: ${report.performance.slowestResponse}
- 95th Percentile: ${report.performance.p95ResponseTime}

## Most Frequent Words
${report.topWords.map(item => `- ${item.word}: ${item.frequency} times`).join('\n')}

## Most Frequent Errors
${report.topErrors.map(item => `- ${item.word}: ${item.frequency} times`).join('\n')}

## Recent Activity
${report.recentActivity.map(item => `- [${item.timeAgo}] ${item.description}`).join('\n')}

---
Generated by SpellCheck Pro on ${new Date().toISOString()}
`;

    // Create and download the file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spellcheck-report-${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updateAnalyticsView() {
    const stats = analytics.getStats();
    
    // Update stat cards
    document.getElementById('total-words').textContent = stats.totalWordsProcessed.toLocaleString();
    document.getElementById('total-suggestions').textContent = stats.totalSuggestions.toLocaleString();
    document.getElementById('total-errors').textContent = stats.totalErrors.toLocaleString();
    document.getElementById('avg-response').textContent = `${stats.averageResponseTime}ms`;
    
    // Update frequency charts
    updateFrequencyChart('word-frequency', analytics.getMostFrequentWords(10));
    updateFrequencyChart('error-frequency', analytics.getMostFrequentErrors(10));
    
    // Update activity log
    updateActivityLog();
}

function updateFrequencyChart(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (data.length === 0) {
        container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No data available</p>';
        return;
    }
    
    data.forEach(item => {
        const frequencyItem = document.createElement('div');
        frequencyItem.className = 'frequency-item';
        
        const word = document.createElement('span');
        word.className = 'frequency-word';
        word.textContent = item.word;
        
        const count = document.createElement('span');
        count.className = 'frequency-count';
        count.textContent = item.frequency;
        
        frequencyItem.appendChild(word);
        frequencyItem.appendChild(count);
        container.appendChild(frequencyItem);
    });
}

function updateActivityLog() {
    const activityList = document.getElementById('activity-log');
    const activities = analytics.getRecentActivity(20);
    
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No recent activity</p>';
        return;
    }
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const icon = document.createElement('div');
        icon.className = `activity-icon ${activity.type}`;
        icon.textContent = activity.type === 'suggestion' ? '💡' : '❌';
        
        const content = document.createElement('div');
        content.className = 'activity-content';
        
        const text = document.createElement('div');
        text.className = 'activity-text';
        text.textContent = activity.description;
        
        const time = document.createElement('div');
        time.className = 'activity-time';
        time.textContent = activity.timeAgo;
        
        content.appendChild(text);
        content.appendChild(time);
        
        activityItem.appendChild(icon);
        activityItem.appendChild(content);
        
        activityList.appendChild(activityItem);
    });
}

function updateDictionaryView() {
    const stats = spellChecker.getDictionaryStats();
    
    document.getElementById('dict-total').textContent = stats.totalWords.toLocaleString();
    document.getElementById('dict-custom').textContent = stats.customWords.toLocaleString();
    
    displayDictionaryWords();
}

function displayDictionaryWords() {
    const container = document.getElementById('dictionary-list');
    const searchTerm = document.getElementById('word-search').value.toLowerCase();
    
    const allWords = trie.getAllWords();
    const filteredWords = searchTerm 
        ? allWords.filter(word => word.toLowerCase().includes(searchTerm))
        : allWords;
    
    container.innerHTML = '';
    
    if (filteredWords.length === 0) {
        container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No words found</p>';
        return;
    }
    
    // Sort and limit results
    const sortedWords = filteredWords.sort().slice(0, 100);
    
    sortedWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        
        const wordText = document.createElement('span');
        wordText.className = 'word-text';
        wordText.textContent = word;
        
        const actions = document.createElement('div');
        actions.className = 'word-actions';
        
        if (spellChecker.customWords.has(word)) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => removeWord(word));
            actions.appendChild(removeBtn);
        }
        
        wordItem.appendChild(wordText);
        wordItem.appendChild(actions);
        container.appendChild(wordItem);
    });
    
    if (filteredWords.length > 100) {
        const moreInfo = document.createElement('p');
        moreInfo.style.color = '#64748b';
        moreInfo.style.textAlign = 'center';
        moreInfo.style.padding = '1rem';
        moreInfo.textContent = `Showing first 100 of ${filteredWords.length} words`;
        container.appendChild(moreInfo);
    }
}

function addNewWord() {
    const input = document.getElementById('new-word');
    const word = input.value.trim();
    
    if (!word) return;
    
    if (spellChecker.addWord(word)) {
        input.value = '';
        updateDictionaryView();
        analytics.addActivity('dictionary', `Added word "${word}" to dictionary`);
    } else {
        alert('Invalid word or word already exists');
    }
}

function removeWord(word) {
    if (confirm(`Are you sure you want to remove "${word}" from the dictionary?`)) {
        if (spellChecker.removeWord(word)) {
            updateDictionaryView();
            analytics.addActivity('dictionary', `Removed word "${word}" from dictionary`);
        }
    }
}

function handleDictionarySearch() {
    displayDictionaryWords();
}

function initializeSettings() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('spellcheck-settings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    
    // Apply settings to UI
    document.getElementById('max-suggestions').value = settings.maxSuggestions;
    document.getElementById('max-suggestions-value').textContent = settings.maxSuggestions;
    
    document.getElementById('min-word-length').value = settings.minWordLength;
    document.getElementById('min-word-length-value').textContent = settings.minWordLength;
    
    document.getElementById('edit-distance').value = settings.editDistance;
    document.getElementById('edit-distance-value').textContent = settings.editDistance;
    
    document.getElementById('debounce-delay').value = settings.debounceDelay;
    document.getElementById('debounce-delay-value').textContent = settings.debounceDelay;
    
    document.getElementById('case-sensitive').checked = settings.caseSensitive;
    document.getElementById('real-time-check').checked = settings.realTimeCheck;
    
    // Apply settings to components
    spellChecker.updateSettings({
        maxEditDistance: settings.editDistance,
        caseSensitive: settings.caseSensitive
    });
}

function updateSettings() {
    settings.maxSuggestions = parseInt(document.getElementById('max-suggestions').value);
    settings.minWordLength = parseInt(document.getElementById('min-word-length').value);
    settings.editDistance = parseInt(document.getElementById('edit-distance').value);
    settings.debounceDelay = parseInt(document.getElementById('debounce-delay').value);
    settings.caseSensitive = document.getElementById('case-sensitive').checked;
    settings.realTimeCheck = document.getElementById('real-time-check').checked;
    
    // Apply to spell checker
    spellChecker.updateSettings({
        maxEditDistance: settings.editDistance,
        caseSensitive: settings.caseSensitive
    });
}

function saveSettings() {
    updateSettings();
    localStorage.setItem('spellcheck-settings', JSON.stringify(settings));
    analytics.addActivity('settings', 'Settings saved successfully');
    
    // Show feedback
    const btn = document.getElementById('save-settings');
    const originalText = btn.textContent;
    btn.textContent = 'Saved!';
    btn.style.background = '#10B981';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        settings = {
            maxSuggestions: 5,
            minWordLength: 2,
            editDistance: 2,
            caseSensitive: false,
            realTimeCheck: true,
            debounceDelay: 300
        };
        
        initializeSettings();
        analytics.addActivity('settings', 'Settings reset to defaults');
    }
}

function saveData() {
    try {
        // Save dictionary data
        const dictData = spellChecker.exportDictionary();
        localStorage.setItem('spellcheck-dictionary', JSON.stringify(dictData));
        
        // Save analytics data
        const analyticsData = analytics.exportData();
        localStorage.setItem('spellcheck-analytics', JSON.stringify(analyticsData));
        
        // Save current text
        localStorage.setItem('spellcheck-text', textEditor.value);
        
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}

function loadData() {
    try {
        // Load dictionary data
        const dictData = localStorage.getItem('spellcheck-dictionary');
        if (dictData) {
            spellChecker.importDictionary(JSON.parse(dictData));
        }
        
        // Load analytics data
        const analyticsData = localStorage.getItem('spellcheck-analytics');
        if (analyticsData) {
            analytics.importData(JSON.parse(analyticsData));
        }
        
        // Load current text
        const savedText = localStorage.getItem('spellcheck-text');
        if (savedText) {
            textEditor.value = savedText;
            updateWordCount();
        }
        
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

function updateUI() {
    updateWordCount();
    if (currentView === 'analytics') {
        updateAnalyticsView();
    } else if (currentView === 'dictionary') {
        updateDictionaryView();
    }
}

// Add some sample text for demonstration
function addSampleText() {
    const sampleText = `This is a demonstration of the real-time auto-complete and spell checker. Try typing some words and see the suggestions appear. The system uses a Trie data structure for efficient auto-complete and the Levenshtein distance algorithm for spell checking.

Some words with intentional errors: recieve (receive), seperate (separate), occured (occurred), definately (definitely).

Start typing to see the system in action!`;
    
    textEditor.value = sampleText;
    updateWordCount();
    processTextInput();
}

// Initialize sample text if editor is empty
setTimeout(() => {
    if (!textEditor.value.trim()) {
        addSampleText();
    }
}, 100);