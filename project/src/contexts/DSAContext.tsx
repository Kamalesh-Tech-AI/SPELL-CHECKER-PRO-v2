import React, { createContext, useContext, useState, useEffect } from 'react';

interface DSAWord {
  id: string;
  word: string;
  definition: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples: string[];
  createdAt: string;
  createdBy: string;
}

interface DSAContextType {
  words: DSAWord[];
  addWord: (word: Omit<DSAWord, 'id' | 'createdAt'>) => void;
  updateWord: (id: string, word: Partial<DSAWord>) => void;
  deleteWord: (id: string) => void;
  searchWords: (query: string) => DSAWord[];
  getWordsByCategory: (category: string) => DSAWord[];
  getWordsByDifficulty: (difficulty: string) => DSAWord[];
}

const DSAContext = createContext<DSAContextType | undefined>(undefined);

// Initial DSA words data
const initialWords: DSAWord[] = [
  {
    id: '1',
    word: 'Array',
    definition: 'A collection of elements stored at contiguous memory locations',
    category: 'Data Structures',
    difficulty: 'beginner',
    examples: ['int arr[5] = {1, 2, 3, 4, 5};', 'Dynamic arrays in Python: [1, 2, 3]'],
    createdAt: '2024-01-01',
    createdBy: 'admin'
  },
  {
    id: '2',
    word: 'Binary Search',
    definition: 'A search algorithm that finds the position of a target value within a sorted array',
    category: 'Algorithms',
    difficulty: 'intermediate',
    examples: ['Search in sorted array', 'Time complexity: O(log n)'],
    createdAt: '2024-01-02',
    createdBy: 'admin'
  },
  {
    id: '3',
    word: 'Stack',
    definition: 'A linear data structure that follows LIFO (Last In First Out) principle',
    category: 'Data Structures',
    difficulty: 'beginner',
    examples: ['Function call stack', 'Undo operations', 'Expression evaluation'],
    createdAt: '2024-01-03',
    createdBy: 'admin'
  },
  {
    id: '4',
    word: 'Queue',
    definition: 'A linear data structure that follows FIFO (First In First Out) principle',
    category: 'Data Structures',
    difficulty: 'beginner',
    examples: ['BFS traversal', 'Process scheduling', 'Print queue'],
    createdAt: '2024-01-04',
    createdBy: 'admin'
  },
  {
    id: '5',
    word: 'Dynamic Programming',
    definition: 'An algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems',
    category: 'Algorithms',
    difficulty: 'advanced',
    examples: ['Fibonacci sequence', 'Knapsack problem', 'Longest common subsequence'],
    createdAt: '2024-01-05',
    createdBy: 'admin'
  }
];

export function DSAProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<DSAWord[]>([]);

  useEffect(() => {
    const storedWords = localStorage.getItem('dsaWords');
    if (storedWords) {
      setWords(JSON.parse(storedWords));
    } else {
      setWords(initialWords);
      localStorage.setItem('dsaWords', JSON.stringify(initialWords));
    }
  }, []);

  const addWord = (wordData: Omit<DSAWord, 'id' | 'createdAt'>) => {
    const newWord: DSAWord = {
      ...wordData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updatedWords = [...words, newWord];
    setWords(updatedWords);
    localStorage.setItem('dsaWords', JSON.stringify(updatedWords));
  };

  const updateWord = (id: string, wordData: Partial<DSAWord>) => {
    const updatedWords = words.map(word =>
      word.id === id ? { ...word, ...wordData } : word
    );
    setWords(updatedWords);
    localStorage.setItem('dsaWords', JSON.stringify(updatedWords));
  };

  const deleteWord = (id: string) => {
    const updatedWords = words.filter(word => word.id !== id);
    setWords(updatedWords);
    localStorage.setItem('dsaWords', JSON.stringify(updatedWords));
  };

  const searchWords = (query: string): DSAWord[] => {
    if (!query) return words;
    return words.filter(word =>
      word.word.toLowerCase().includes(query.toLowerCase()) ||
      word.definition.toLowerCase().includes(query.toLowerCase()) ||
      word.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getWordsByCategory = (category: string): DSAWord[] => {
    return words.filter(word => word.category === category);
  };

  const getWordsByDifficulty = (difficulty: string): DSAWord[] => {
    return words.filter(word => word.difficulty === difficulty);
  };

  return (
    <DSAContext.Provider value={{
      words,
      addWord,
      updateWord,
      deleteWord,
      searchWords,
      getWordsByCategory,
      getWordsByDifficulty
    }}>
      {children}
    </DSAContext.Provider>
  );
}

export function useDSA() {
  const context = useContext(DSAContext);
  if (context === undefined) {
    throw new Error('useDSA must be used within a DSAProvider');
  }
  return context;
}