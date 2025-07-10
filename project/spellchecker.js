class SpellChecker {
    constructor(trie) {
        this.trie = trie;
        this.customWords = new Set();
        this.settings = {
            maxEditDistance: 2,
            caseSensitive: false
        };
        
        // Initialize with common English words
        this.initializeDefaultDictionary();
    }

    initializeDefaultDictionary() {
        const commonWords = [
            // Common English words
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
            'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
            'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
            'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
            'because', 'any', 'these', 'give', 'day', 'most', 'us',
            
            // Programming and tech words
            'algorithm', 'function', 'variable', 'array', 'object', 'string', 'number', 'boolean', 'null', 'undefined', 'class', 'method', 'property',
            'parameter', 'argument', 'return', 'loop', 'condition', 'statement', 'expression', 'operator', 'assignment', 'comparison', 'logical',
            'arithmetic', 'increment', 'decrement', 'concatenation', 'interpolation', 'template', 'literal', 'constant', 'scope', 'closure',
            'callback', 'promise', 'async', 'await', 'synchronous', 'asynchronous', 'event', 'listener', 'handler', 'trigger', 'dispatch',
            'component', 'element', 'attribute', 'property', 'state', 'props', 'render', 'mount', 'unmount', 'lifecycle', 'hook', 'effect',
            'dependency', 'injection', 'module', 'import', 'export', 'default', 'namespace', 'package', 'library', 'framework', 'api',
            'endpoint', 'request', 'response', 'http', 'https', 'get', 'post', 'put', 'delete', 'patch', 'header', 'body', 'json', 'xml',
            'database', 'query', 'select', 'insert', 'update', 'delete', 'join', 'where', 'order', 'group', 'having', 'index', 'primary',
            'foreign', 'key', 'constraint', 'table', 'column', 'row', 'record', 'field', 'schema', 'migration', 'transaction', 'commit',
            'rollback', 'backup', 'restore', 'optimize', 'performance', 'cache', 'memory', 'storage', 'disk', 'network', 'bandwidth',
            'latency', 'throughput', 'scalability', 'availability', 'reliability', 'security', 'authentication', 'authorization', 'encryption',
            'decryption', 'hash', 'salt', 'token', 'session', 'cookie', 'cors', 'csrf', 'xss', 'sql', 'injection', 'vulnerability',
            'firewall', 'proxy', 'load', 'balancer', 'server', 'client', 'frontend', 'backend', 'fullstack', 'devops', 'deployment',
            'production', 'development', 'testing', 'staging', 'environment', 'configuration', 'settings', 'options', 'preferences',
            'interface', 'implementation', 'abstraction', 'encapsulation', 'inheritance', 'polymorphism', 'composition', 'aggregation',
            'association', 'dependency', 'coupling', 'cohesion', 'separation', 'concerns', 'single', 'responsibility', 'open', 'closed',
            'liskov', 'substitution', 'interface', 'segregation', 'inversion', 'solid', 'principles', 'design', 'pattern', 'singleton',
            'factory', 'builder', 'prototype', 'adapter', 'bridge', 'composite', 'decorator', 'facade', 'flyweight', 'proxy', 'observer',
            'strategy', 'command', 'state', 'template', 'visitor', 'mediator', 'memento', 'iterator', 'chain', 'interpreter',
            
            // Common misspellings and their corrections
            'receive', 'separate', 'occurred', 'definitely', 'beginning', 'necessary', 'embarrass', 'accommodate', 'recommend', 'committee',
            'occasion', 'possession', 'professional', 'business', 'calendar', 'category', 'cemetery', 'changeable', 'collectible', 'column',
            'committed', 'conscience', 'conscious', 'consensus', 'convenient', 'correspondence', 'courtesy', 'criticism', 'curiosity',
            'definitely', 'dependent', 'desperate', 'development', 'difference', 'disappear', 'disappoint', 'discipline', 'embarrass',
            'environment', 'equipment', 'especially', 'exaggerate', 'excellent', 'existence', 'experience', 'explanation', 'familiar',
            'february', 'foreign', 'forty', 'friend', 'government', 'grammar', 'guarantee', 'guard', 'guidance', 'happened', 'harass',
            'height', 'hierarchy', 'humorous', 'immediately', 'independent', 'intelligence', 'interesting', 'interrupt', 'knowledge',
            'laboratory', 'leisure', 'length', 'library', 'license', 'maintenance', 'maneuver', 'marriage', 'mathematics', 'medicine',
            'millennium', 'miniature', 'minute', 'mischievous', 'misspell', 'mortgage', 'necessary', 'neighbor', 'neither', 'noticeable',
            'occasionally', 'occurrence', 'opinion', 'opportunity', 'parallel', 'particular', 'personnel', 'piece', 'playwright', 'possession',
            'potato', 'preferred', 'prejudice', 'privilege', 'probably', 'pronunciation', 'publicly', 'questionnaire', 'receive', 'recognize',
            'recommend', 'referred', 'relevant', 'restaurant', 'rhythm', 'schedule', 'scissors', 'separate', 'sergeant', 'similar',
            'since', 'strength', 'successful', 'sufficient', 'surprise', 'temperature', 'thorough', 'thought', 'through', 'tomorrow',
            'tongue', 'truly', 'twelfth', 'tyranny', 'until', 'unusual', 'vacuum', 'vegetable', 'vehicle', 'weird', 'whether', 'which',
            'writing', 'written'
        ];

        commonWords.forEach(word => {
            this.trie.insert(word);
        });
    }

    addWord(word) {
        if (!word || typeof word !== 'string') return false;
        
        word = word.toLowerCase().trim();
        if (word.length === 0) return false;
        
        // Check if word contains only valid characters
        if (!/^[a-zA-Z]+$/.test(word)) return false;
        
        this.trie.insert(word);
        this.customWords.add(word);
        return true;
    }

    removeWord(word) {
        if (!word || typeof word !== 'string') return false;
        
        word = word.toLowerCase().trim();
        if (!this.customWords.has(word)) return false;
        
        this.customWords.delete(word);
        return this.trie.remove(word);
    }

    isCorrect(word) {
        if (!word || typeof word !== 'string') return false;
        
        word = this.settings.caseSensitive ? word.trim() : word.toLowerCase().trim();
        return this.trie.search(word);
    }

    getSuggestions(word, maxSuggestions = 5) {
        if (!word || typeof word !== 'string') return [];
        
        word = this.settings.caseSensitive ? word.trim() : word.toLowerCase().trim();
        
        const suggestions = [];
        const allWords = this.trie.getAllWords();
        
        // First, try to find words with the same prefix
        const prefixMatches = this.trie.getAllWordsWithPrefix(word, maxSuggestions);
        suggestions.push(...prefixMatches.map(item => item.word));
        
        // If we don't have enough suggestions, use edit distance
        if (suggestions.length < maxSuggestions) {
            const editDistanceSuggestions = allWords
                .filter(dictWord => {
                    if (suggestions.includes(dictWord)) return false;
                    return this.calculateEditDistance(word, dictWord) <= this.settings.maxEditDistance;
                })
                .sort((a, b) => {
                    const distA = this.calculateEditDistance(word, a);
                    const distB = this.calculateEditDistance(word, b);
                    if (distA === distB) {
                        return a.localeCompare(b);
                    }
                    return distA - distB;
                })
                .slice(0, maxSuggestions - suggestions.length);
            
            suggestions.push(...editDistanceSuggestions);
        }
        
        return suggestions.slice(0, maxSuggestions);
    }

    calculateEditDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        
        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }
        
        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,     // deletion
                    matrix[j - 1][i] + 1,     // insertion
                    matrix[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    checkText(text) {
        if (!text || typeof text !== 'string') return [];
        
        const words = text.match(/\b[a-zA-Z]+\b/g) || [];
        const errors = [];
        const checkedWords = new Set();
        
        words.forEach(word => {
            const cleanWord = this.settings.caseSensitive ? word : word.toLowerCase();
            
            // Skip if we've already checked this word
            if (checkedWords.has(cleanWord)) return;
            checkedWords.add(cleanWord);
            
            if (!this.isCorrect(cleanWord)) {
                const suggestions = this.getSuggestions(cleanWord, 3);
                errors.push({
                    word: word,
                    suggestions: suggestions
                });
            }
        });
        
        return errors;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    getDictionaryStats() {
        const stats = this.trie.getStatistics();
        return {
            totalWords: stats.totalWords,
            customWords: this.customWords.size,
            systemWords: stats.totalWords - this.customWords.size
        };
    }

    exportDictionary() {
        return {
            customWords: Array.from(this.customWords),
            settings: this.settings,
            trieData: this.trie.export()
        };
    }

    importDictionary(data) {
        if (data.customWords) {
            this.customWords = new Set(data.customWords);
        }
        
        if (data.settings) {
            this.settings = { ...this.settings, ...data.settings };
        }
        
        if (data.trieData) {
            this.trie.import(data.trieData);
        }
    }

    // Advanced spell checking with context
    checkTextWithContext(text) {
        const errors = this.checkText(text);
        const words = text.match(/\b[a-zA-Z]+\b/g) || [];
        
        // Add context-aware suggestions
        return errors.map(error => {
            const wordIndex = words.findIndex(w => 
                (this.settings.caseSensitive ? w : w.toLowerCase()) === 
                (this.settings.caseSensitive ? error.word : error.word.toLowerCase())
            );
            
            const context = {
                before: words.slice(Math.max(0, wordIndex - 2), wordIndex),
                after: words.slice(wordIndex + 1, Math.min(words.length, wordIndex + 3))
            };
            
            return {
                ...error,
                context: context,
                position: wordIndex
            };
        });
    }

    // Get word frequency statistics
    getWordFrequency(text) {
        if (!text || typeof text !== 'string') return {};
        
        const words = text.match(/\b[a-zA-Z]+\b/g) || [];
        const frequency = {};
        
        words.forEach(word => {
            const cleanWord = this.settings.caseSensitive ? word : word.toLowerCase();
            frequency[cleanWord] = (frequency[cleanWord] || 0) + 1;
        });
        
        return frequency;
    }

    // Suggest corrections for entire text
    correctText(text, autoCorrect = false) {
        if (!text || typeof text !== 'string') return text;
        
        const errors = this.checkText(text);
        let correctedText = text;
        
        // Sort errors by position (descending) to avoid index shifting
        const sortedErrors = errors.sort((a, b) => {
            const posA = text.lastIndexOf(a.word);
            const posB = text.lastIndexOf(b.word);
            return posB - posA;
        });
        
        sortedErrors.forEach(error => {
            if (error.suggestions.length > 0) {
                const suggestion = error.suggestions[0];
                if (autoCorrect) {
                    // Replace all occurrences of the error word
                    const regex = new RegExp(`\\b${error.word}\\b`, 'gi');
                    correctedText = correctedText.replace(regex, suggestion);
                }
            }
        });
        
        return {
            originalText: text,
            correctedText: correctedText,
            corrections: errors.map(error => ({
                original: error.word,
                suggestion: error.suggestions[0] || null,
                allSuggestions: error.suggestions
            }))
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpellChecker;
}