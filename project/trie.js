class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.frequency = 0;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
        this.totalWords = 0;
    }

    insert(word) {
        word = word.toLowerCase().trim();
        if (!word) return;

        let current = this.root;
        
        for (const char of word) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }
        
        if (!current.isEndOfWord) {
            this.totalWords++;
        }
        
        current.isEndOfWord = true;
        current.frequency++;
    }

    search(word) {
        word = word.toLowerCase().trim();
        let current = this.root;
        
        for (const char of word) {
            if (!current.children[char]) {
                return false;
            }
            current = current.children[char];
        }
        
        return current.isEndOfWord;
    }

    startsWith(prefix) {
        prefix = prefix.toLowerCase().trim();
        let current = this.root;
        
        for (const char of prefix) {
            if (!current.children[char]) {
                return false;
            }
            current = current.children[char];
        }
        
        return true;
    }

    getAllWordsWithPrefix(prefix, limit = 10) {
        prefix = prefix.toLowerCase().trim();
        if (!prefix) return [];

        let current = this.root;
        
        // Navigate to the prefix
        for (const char of prefix) {
            if (!current.children[char]) {
                return [];
            }
            current = current.children[char];
        }
        
        // Collect all words with this prefix
        const results = [];
        this._collectWords(current, prefix, results, limit);
        
        // Sort by frequency (descending) and then alphabetically
        return results.sort((a, b) => {
            if (b.frequency === a.frequency) {
                return a.word.localeCompare(b.word);
            }
            return b.frequency - a.frequency;
        }).slice(0, limit);
    }

    _collectWords(node, currentWord, results, limit) {
        if (results.length >= limit) return;
        
        if (node.isEndOfWord) {
            results.push({
                word: currentWord,
                frequency: node.frequency
            });
        }
        
        for (const [char, childNode] of Object.entries(node.children)) {
            if (results.length >= limit) return;
            this._collectWords(childNode, currentWord + char, results, limit);
        }
    }

    getMostFrequentWords(limit = 10) {
        const allWords = [];
        this._collectAllWords(this.root, '', allWords);
        
        return allWords
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, limit);
    }

    _collectAllWords(node, currentWord, results) {
        if (node.isEndOfWord) {
            results.push({
                word: currentWord,
                frequency: node.frequency
            });
        }
        
        for (const [char, childNode] of Object.entries(node.children)) {
            this._collectAllWords(childNode, currentWord + char, results);
        }
    }

    getAllWords() {
        const allWords = [];
        this._collectAllWords(this.root, '', allWords);
        return allWords.map(item => item.word);
    }

    remove(word) {
        word = word.toLowerCase().trim();
        if (!word) return false;

        const path = [];
        let current = this.root;
        
        // Build path and check if word exists
        for (const char of word) {
            if (!current.children[char]) {
                return false; // Word doesn't exist
            }
            path.push({ node: current, char });
            current = current.children[char];
        }
        
        if (!current.isEndOfWord) {
            return false; // Word doesn't exist
        }
        
        // Mark as not end of word
        current.isEndOfWord = false;
        this.totalWords--;
        
        // If current node has children, we can't delete it
        if (Object.keys(current.children).length > 0) {
            return true;
        }
        
        // Backtrack and delete nodes if possible
        for (let i = path.length - 1; i >= 0; i--) {
            const { node, char } = path[i];
            const childNode = node.children[char];
            
            // If child has no children and is not end of word, delete it
            if (Object.keys(childNode.children).length === 0 && !childNode.isEndOfWord) {
                delete node.children[char];
            } else {
                break; // Stop if we can't delete
            }
        }
        
        return true;
    }

    getStatistics() {
        return {
            totalWords: this.totalWords,
            totalNodes: this._countNodes(this.root)
        };
    }

    _countNodes(node) {
        let count = 1; // Count current node
        for (const child of Object.values(node.children)) {
            count += this._countNodes(child);
        }
        return count;
    }

    // Export trie data for persistence
    export() {
        const data = [];
        this._exportWords(this.root, '', data);
        return data;
    }

    _exportWords(node, currentWord, data) {
        if (node.isEndOfWord) {
            data.push({
                word: currentWord,
                frequency: node.frequency
            });
        }
        
        for (const [char, childNode] of Object.entries(node.children)) {
            this._exportWords(childNode, currentWord + char, data);
        }
    }

    // Import trie data
    import(data) {
        this.root = new TrieNode();
        this.totalWords = 0;
        
        for (const item of data) {
            for (let i = 0; i < item.frequency; i++) {
                this.insert(item.word);
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Trie, TrieNode };
}