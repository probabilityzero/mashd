import React, { useState, useRef, useEffect } from 'react';
import { Visualisation } from './components/Visualisation';
import { CodeEditor } from './components/CodeEditor';
import { SideMenu } from './components/SideMenu';
import { EditModal } from './components/EditModal';
import { useKnotStore } from './store/knotStore';
import { Menu, X, Moon, Plus, Sun, Pencil, PlusCircle } from 'lucide-react';
import { useTheme } from './store/themeStore';
import { KnotDefinition } from './types/knot';
import Home from './components/Home';

function App() {
  const { knots, selectedKnot, isMenuOpen, toggleMenu, addKnot, updateKnot, deleteKnot, selectedKnotData, selectKnot } = useKnotStore();
  const { isDark, toggleTheme, setThemeBasedOnSystem } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'code' | 'latex' | 'mathjax'>('code'); // Default to 'code'
  const currentKnot = knots.find(k => k.id === selectedKnot);
  const [editingKnot, setEditingKnot] = useState<KnotDefinition | undefined>(selectedKnotData);

  // Effect to set theme based on system preference on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeBasedOnSystem(prefersDark);
    
    // Add listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setThemeBasedOnSystem(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setThemeBasedOnSystem]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (isMenuOpen && e.target === e.currentTarget) {
      toggleMenu();
    }
  };

  const handleCreateNew = () => {
    // Find highest number in existing "My Visualization X" names
    let highestNum = 0;
    knots.forEach(knot => {
      const match = knot.name.match(/My Visualization (\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNum) highestNum = num;
      }
    });
    
    const newKnot = {
      id: `math-${Date.now()}`,
      name: `My Visualization ${highestNum + 1}`,
      description: 'Custom mathematical visualization',
      lastModified: Date.now(),
      code: `function generatePoints(t) {
  const x = Math.sin(t);
  const y = Math.cos(t);
  const z = Math.sin(2 * t);
  return [x, y, z];
}`
    };
    addKnot(newKnot);
    selectKnot(newKnot.id);
  };

  const handleGoHome = () => {
    selectKnot('');
  };

  const handleDownload = (knot: KnotDefinition | undefined) => {
    if (!knot) return;
    const blob = new Blob([knot.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${knot.name.toLowerCase().replace(/\s+/g, '-')}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteKnot = (knotId: string | undefined) => {
    if (!knotId) return;
    deleteKnot(knotId);
    // Select the first knot after deletion if knots are still available
    if (knots.length > 1) {
      selectKnot(knots[0].id);
    }
  };

  useEffect(() => {
    setEditingKnot(selectedKnotData);
  }, [selectedKnotData]);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      <header className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md h-12 w-full sticky top-0 z-30`}>
        <div className="mx-auto px-4 md:px-6 py-0 flex justify-between items-center h-full">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMenu}
              className={`p-1.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 
              className="text-lg font-semibold md:font-bold cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleGoHome}
            >
                Mash<span className="font-serif font-medium md:font-semibold">(d)</span>
            </h1>
          </div>
          {currentKnot && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <button
                onClick={() => setShowEditModal(true)}
                className={`text-sm md:text-base font-medium ${isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'} flex items-center gap-1 font-serif`}
              >
                {currentKnot.name}
                <Pencil size={12} className="pl-1" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
              title="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center p-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white rounded-full hover:from-blue-700 hover:via-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-base font-medium"
            >
              <PlusCircle size={16}/>
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClickOutside} />}
      <SideMenu onCreateNew={handleCreateNew} onCloseMenu={toggleMenu} />

      <main className="container mx-auto p-3 md:p-6">
        {currentKnot ? (
          <div className="space-y-3 md:space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`} style={{ height: '640px' }}>
              <Visualisation code={currentKnot.code} isDark={isDark} editingKnot={editingKnot} onDeleteKnot={handleDeleteKnot} onDownloadKnot={handleDownload} setShowEditModal={setShowEditModal} />
            </div>

            <div className="flex">
              <div className="flex flex-col w-full">
                <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg overflow-hidden mt-2 border`}>
                  <div className={`flex p-1.5 justify-between items-center border-b border-gray-300 dark:border-gray-700 bg-gradient-to-r ${isDark ? 'to-gray-900 from-gray-800' : 'from-blue-100 to-blue-200'}`}>
                    <div className="flex space-x-1">
                      {(['input', 'code', 'latex', 'mathjax'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1 capitalize text-sm font-medium rounded-full transition-colors ${
                            activeTab === tab
                              ? isDark
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-700 text-white'
                              : isDark
                              ? 'text-gray-300 hover:bg-gray-600 hover:text-white'
                              : 'text-blue-900 hover:bg-blue-200 hover:text-blue-900'
                          }`}
                        >
                          {tab === 'input' ? 'Input' : tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    {activeTab === 'input' && (
                      <div className="p-4">
                        <p className="text-lg">Input options and controls coming soon...</p>
                      </div>
                    )}
                    {activeTab === 'code' && (
                      <CodeEditor
                        code={currentKnot.code}
                        onChange={(newCode) => updateKnot(currentKnot.id, { code: newCode })}
                        isDark={isDark}
                      />
                    )}
                    {activeTab === 'latex' && (
                      <div className="p-4">
                        <p className="text-lg">LaTeX representation coming soon...</p>
                      </div>
                    )}
                    {activeTab === 'mathjax' && (
                      <div className="p-4">
                        <p className="text-lg">MathJax representation coming soon...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Home isDark={isDark} onCreateNew={handleCreateNew} />
        )}
      </main>

      {showEditModal && currentKnot && (
        <EditModal
          knot={currentKnot}
          onClose={() => setShowEditModal(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}

export default App;