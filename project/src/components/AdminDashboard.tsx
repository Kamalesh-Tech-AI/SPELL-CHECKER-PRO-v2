import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDSA } from '../contexts/DSAContext';
import { 
  LogOut, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  TrendingUp,
  Settings,
  Filter,
  Save,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { words, addWord, updateWord, deleteWord, searchWords } = useDSA();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    examples: ['']
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWord) {
      updateWord(editingWord, {
        ...formData,
        examples: formData.examples.filter(ex => ex.trim() !== ''),
        createdBy: user?.username || 'admin'
      });
      setEditingWord(null);
    } else {
      addWord({
        ...formData,
        examples: formData.examples.filter(ex => ex.trim() !== ''),
        createdBy: user?.username || 'admin'
      });
    }
    setFormData({
      word: '',
      definition: '',
      category: '',
      difficulty: 'beginner',
      examples: ['']
    });
    setShowAddForm(false);
  };

  const handleEdit = (word: any) => {
    setFormData({
      word: word.word,
      definition: word.definition,
      category: word.category,
      difficulty: word.difficulty,
      examples: word.examples.length > 0 ? word.examples : ['']
    });
    setEditingWord(word.id);
    setShowAddForm(true);
  };

  const handleAddExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, '']
    });
  };

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = value;
    setFormData({
      ...formData,
      examples: newExamples
    });
  };

  const handleRemoveExample = (index: number) => {
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      examples: newExamples.length > 0 ? newExamples : ['']
    });
  };

  const stats = {
    totalWords: words.length,
    categories: new Set(words.map(w => w.category)).size,
    recentlyAdded: words.filter(w => {
      const wordDate = new Date(w.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return wordDate >= weekAgo;
    }).length
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
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-purple-200 text-sm">DSA Learning Platform</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Words</p>
                <p className="text-3xl font-bold text-white">{stats.totalWords}</p>
              </div>
              <BookOpen className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Categories</p>
                <p className="text-3xl font-bold text-white">{stats.categories}</p>
              </div>
              <Filter className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Added This Week</p>
                <p className="text-3xl font-bold text-white">{stats.recentlyAdded}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff} className="text-gray-900 capitalize">{diff}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Word</span>
            </button>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingWord ? 'Edit Word' : 'Add New Word'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingWord(null);
                    setFormData({
                      word: '',
                      definition: '',
                      category: '',
                      difficulty: 'beginner',
                      examples: ['']
                    });
                  }}
                  className="text-purple-300 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Word</label>
                  <input
                    type="text"
                    required
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter DSA term"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Definition</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.definition}
                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter definition"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="" className="text-gray-900">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff} className="text-gray-900 capitalize">{diff}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Examples</label>
                  {formData.examples.map((example, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={example}
                        onChange={(e) => handleExampleChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder={`Example ${index + 1}`}
                      />
                      {formData.examples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExample(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="text-purple-300 hover:text-white text-sm"
                  >
                    + Add Example
                  </button>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingWord ? 'Update' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingWord(null);
                      setFormData({
                        word: '',
                        definition: '',
                        category: '',
                        difficulty: 'beginner',
                        examples: ['']
                      });
                    }}
                    className="px-6 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Words List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white">DSA Words ({filteredWords.length})</h2>
          </div>
          <div className="divide-y divide-white/20">
            {filteredWords.map((word) => (
              <div key={word.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{word.word}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        word.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                        word.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {word.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                        {word.category}
                      </span>
                    </div>
                    <p className="text-purple-200 mb-3">{word.definition}</p>
                    {word.examples.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-purple-300 mb-1">Examples:</p>
                        <ul className="list-disc list-inside text-sm text-purple-200 space-y-1">
                          {word.examples.map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-purple-400">
                      Added by {word.createdBy} on {word.createdAt}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(word)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredWords.length === 0 && (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-200">No words found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}