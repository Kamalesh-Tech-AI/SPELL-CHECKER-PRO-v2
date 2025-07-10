class Analytics {
    constructor() {
        this.sessionStart = Date.now();
        this.totalWordsProcessed = 0;
        this.totalSuggestions = 0;
        this.totalErrors = 0;
        this.responseTimes = [];
        this.wordFrequency = new Map();
        this.errorFrequency = new Map();
        this.activityLog = [];
        this.maxActivityLog = 100;
        this.maxFrequencyItems = 20;
    }

    recordWordProcessed(word) {
        if (!word || typeof word !== 'string') return;
        
        word = word.toLowerCase().trim();
        if (word.length === 0) return;
        
        this.totalWordsProcessed++;
        
        // Update word frequency
        const currentCount = this.wordFrequency.get(word) || 0;
        this.wordFrequency.set(word, currentCount + 1);
        
        // Keep only top words to prevent memory issues
        if (this.wordFrequency.size > this.maxFrequencyItems * 2) {
            this.trimFrequencyMap(this.wordFrequency);
        }
    }

    recordSuggestion(originalWord, suggestion, responseTime = 0) {
        this.totalSuggestions++;
        
        if (responseTime > 0) {
            this.responseTimes.push(responseTime);
            // Keep only recent response times
            if (this.responseTimes.length > 1000) {
                this.responseTimes = this.responseTimes.slice(-500);
            }
        }
        
        this.addActivity('suggestion', `Suggested "${suggestion}" for "${originalWord}"`);
    }

    recordSpellError(errorWord, suggestions = []) {
        this.totalErrors++;
        
        // Update error frequency
        const currentCount = this.errorFrequency.get(errorWord) || 0;
        this.errorFrequency.set(errorWord, currentCount + 1);
        
        // Keep only top errors to prevent memory issues
        if (this.errorFrequency.size > this.maxFrequencyItems * 2) {
            this.trimFrequencyMap(this.errorFrequency);
        }
        
        const suggestionText = suggestions.length > 0 
            ? ` (suggested: ${suggestions.slice(0, 3).join(', ')})`
            : '';
        
        this.addActivity('error', `Spelling error: "${errorWord}"${suggestionText}`);
    }

    recordCorrection(originalWord, correctedWord) {
        this.addActivity('correction', `Corrected "${originalWord}" to "${correctedWord}"`);
    }

    addActivity(type, description) {
        const activity = {
            type,
            description,
            timestamp: Date.now()
        };
        
        this.activityLog.unshift(activity);
        
        // Keep only recent activities
        if (this.activityLog.length > this.maxActivityLog) {
            this.activityLog = this.activityLog.slice(0, this.maxActivityLog);
        }
    }

    trimFrequencyMap(frequencyMap) {
        // Convert to array, sort by frequency, keep top items
        const sortedEntries = Array.from(frequencyMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.maxFrequencyItems);
        
        frequencyMap.clear();
        sortedEntries.forEach(([word, count]) => {
            frequencyMap.set(word, count);
        });
    }

    getStats() {
        const avgResponseTime = this.responseTimes.length > 0
            ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
            : 0;
        
        return {
            totalWordsProcessed: this.totalWordsProcessed,
            totalSuggestions: this.totalSuggestions,
            totalErrors: this.totalErrors,
            averageResponseTime: avgResponseTime,
            sessionDuration: Date.now() - this.sessionStart
        };
    }

    getMostFrequentWords(limit = 10) {
        return Array.from(this.wordFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, frequency]) => ({ word, frequency }));
    }

    getMostFrequentErrors(limit = 10) {
        return Array.from(this.errorFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, frequency]) => ({ word, frequency }));
    }

    getRecentActivity(limit = 20) {
        return this.activityLog
            .slice(0, limit)
            .map(activity => ({
                ...activity,
                timeAgo: this.formatTimeAgo(activity.timestamp)
            }));
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    }

    getPerformanceMetrics() {
        if (this.responseTimes.length === 0) {
            return {
                average: 0,
                median: 0,
                min: 0,
                max: 0,
                percentile95: 0
            };
        }
        
        const sorted = [...this.responseTimes].sort((a, b) => a - b);
        const len = sorted.length;
        
        return {
            average: Math.round(sorted.reduce((a, b) => a + b, 0) / len),
            median: len % 2 === 0 
                ? Math.round((sorted[len / 2 - 1] + sorted[len / 2]) / 2)
                : sorted[Math.floor(len / 2)],
            min: sorted[0],
            max: sorted[len - 1],
            percentile95: sorted[Math.floor(len * 0.95)]
        };
    }

    exportData() {
        return {
            sessionStart: this.sessionStart,
            stats: this.getStats(),
            wordFrequency: Object.fromEntries(this.wordFrequency),
            errorFrequency: Object.fromEntries(this.errorFrequency),
            activityLog: this.activityLog,
            performanceMetrics: this.getPerformanceMetrics()
        };
    }

    importData(data) {
        if (data.sessionStart) {
            this.sessionStart = data.sessionStart;
        }
        
        if (data.wordFrequency) {
            this.wordFrequency = new Map(Object.entries(data.wordFrequency));
        }
        
        if (data.errorFrequency) {
            this.errorFrequency = new Map(Object.entries(data.errorFrequency));
        }
        
        if (data.activityLog && Array.isArray(data.activityLog)) {
            this.activityLog = data.activityLog;
        }
    }

    reset() {
        this.sessionStart = Date.now();
        this.totalWordsProcessed = 0;
        this.totalSuggestions = 0;
        this.totalErrors = 0;
        this.responseTimes = [];
        this.wordFrequency.clear();
        this.errorFrequency.clear();
        this.activityLog = [];
    }

    // Generate a comprehensive report
    generateReport() {
        const stats = this.getStats();
        const performance = this.getPerformanceMetrics();
        const topWords = this.getMostFrequentWords(10);
        const topErrors = this.getMostFrequentErrors(10);
        
        const sessionHours = Math.floor(stats.sessionDuration / (1000 * 60 * 60));
        const sessionMinutes = Math.floor((stats.sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            summary: {
                sessionDuration: `${sessionHours}h ${sessionMinutes}m`,
                totalWordsProcessed: stats.totalWordsProcessed,
                totalSuggestions: stats.totalSuggestions,
                totalErrors: stats.totalErrors,
                errorRate: stats.totalWordsProcessed > 0 
                    ? `${((stats.totalErrors / stats.totalWordsProcessed) * 100).toFixed(1)}%`
                    : '0%',
                averageResponseTime: `${stats.averageResponseTime}ms`
            },
            performance: {
                averageResponseTime: `${performance.average}ms`,
                medianResponseTime: `${performance.median}ms`,
                fastestResponse: `${performance.min}ms`,
                slowestResponse: `${performance.max}ms`,
                p95ResponseTime: `${performance.percentile95}ms`
            },
            topWords: topWords,
            topErrors: topErrors,
            recentActivity: this.getRecentActivity(10)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}