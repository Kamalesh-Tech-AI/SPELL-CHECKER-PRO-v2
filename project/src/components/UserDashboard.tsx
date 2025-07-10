import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDSA } from '../contexts/DSAContext';
import { 
  LogOut, 
  Search, 
  BookOpen, 
  Filter,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { words, searchWords } = useDSA();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedWord, setSelectedWord] = useState<any>(null);

  const categories = ['Data Structures', 'Algorithms', 'Complexity Analysis', 'Problem Solving'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const filteredWords = words.filter(word => {
    const matchesSearch = !searchQuery || 
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || word.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || word.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const stats = {
    totalWords: words.length,
    categories: new Set(words.map(w => w.category)).size,
    beginnerWords: words.filter(w => w.difficulty === 'beginner').length,
    intermediateWords: words.filter(w => w.difficulty === 'intermediate').length,
    advancedWords: words.filter(w => w.difficulty === 'advanced').length
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">DSA Learning Hub</h1>
                <p className="text-purple-200 text-sm">Master Data Structures & Algorithms</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-purple-200">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to DSA Learning Platform</h2>
          <p className="text-purple-200 mb-6">
            Explore our comprehensive collection of Data Structures and Algorithms concepts. 
            Learn at your own pace and master the fundamentals of computer science.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalWords}</div>
              <div className="text-sm text-purple-200">Total Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">{stats.beginnerWords}</div>
              <div className="text-sm text-purple-200">Beginner</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.intermediateWords}</div>
              <div className="text-sm text-purple-200">Intermediate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-300">{stats.advancedWords}</div>
              <div className="text-sm text-purple-200">Advanced</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
              <input
                type="text"
                placeholder="Search DSA concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="text-gray-900">{cat}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff} className="text-gray-900 capitalize">{diff}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Words Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((word) => (
            <div
              key={word.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
              onClick={() => setSelectedWord(word)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors">
                  {word.word}
                </h3>
                <ChevronRight className="h-5 w-5 text-purple-400 group-hover:text-white transition-colors" />
              </div>
              
              <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                {word.definition}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                    {word.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                    {word.category}
                  </span>
                </div>
                <Eye className="h-4 w-4 text-purple-400" />
              </div>
            </div>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
            <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No concepts found</h3>
            <p className="text-purple-200">Try adjusting your search criteria or browse all available concepts.</p>
          </div>
        )}

        {/* Word Detail Modal */}
        {selectedWord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedWord.word}</h2>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedWord.difficulty)}`}>
                      {selectedWord.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                      {selectedWord.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-purple-300 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Definition</h3>
                  <p className="text-purple-200 leading-relaxed">{selectedWord.definition}</p>
                </div>
                
                {selectedWord.examples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Examples</h3>
                    <div className="space-y-3">
                      {selectedWord.examples.map((example: string, index: number) => (
                        <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                          <code className="text-purple-200 text-sm">{example}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/20">
                  <p className="text-sm text-purple-400">
                    Added by {selectedWord.createdBy} on {selectedWord.createdAt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}