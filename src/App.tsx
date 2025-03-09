import React, { useState, useRef, useEffect } from 'react';
import { Visualisation } from './components/Visualisation';
import { CodeEditor } from './components/CodeEditor';
import { SideMenu } from './components/SideMenu';
import { EditModal } from './components/EditModal';
import { useKnotStore } from './store/knotStore';
import { Menu, Plus, X, Moon, Sun, Info, Download, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useTheme } from './store/themeStore';
import { KnotDefinition } from './types/knot';

function App() {
  const { knots, selectedKnot, isMenuOpen, toggleMenu, addKnot, updateKnot, deleteKnot, selectedKnotData, selectKnot } = useKnotStore();
  const { isDark, toggleTheme } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'code' | 'latex' | 'mathjax'>('code'); // Default to 'code' - changed default tab
  const currentKnot = knots.find(k => k.id === selectedKnot);
  const [editingKnot, setEditingKnot] = useState<KnotDefinition | undefined>(selectedKnotData);


  const handleClickOutside = (e: React.MouseEvent) => {
    if (isMenuOpen && e.target === e.currentTarget) {
      toggleMenu();
    }
  };

  const handleCreateNew = () => {
    const newKnot = {
      id: `math-${Date.now()}`,
      name: 'New Visualization',
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
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} shadow-sm h-12`}> {/* Reduced header height to h-12 (3rem which is roughly 5 units) */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between h-full"> {/* Ensure full height for content */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMenu}
              className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-semibold text-center flex-1">Mash D</h1> {/* Centered App Name "Mash D" */}
          </div>
          {currentKnot && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"> {/* Centering the knot name */}
              <button
                onClick={() => setShowEditModal(true)}
                className={`text-lg font-medium ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
              >
                {currentKnot.name}
              </button>
            </div>
          )}
          <div className="flex items-center gap-4">
          </div>
        </div>
      </header>

      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClickOutside} />}
      <SideMenu onCreateNew={handleCreateNew} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentKnot ? (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`} style={{ height: '550px' }}>
              <Visualisation code={currentKnot.code} isDark={isDark} editingKnot={editingKnot} onDeleteKnot={handleDeleteKnot} onDownloadKnot={handleDownload} setShowEditModal={setShowEditModal} />
            </div>

            <div className="flex p-1">
              <div className="flex flex-col w-full"> {/* Ensure column takes full width */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden mt-2`}> {/* Border and margin container */}
                  <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700"> {/* Border for the nav area */}
                    <div className="flex"> {/* Container for tabs to keep them left-aligned */}
                      {(['input', 'code', 'latex', 'mathjax'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 capitalize text-sm rounded-full transition-colors ${ // Rounded-full for pill shape
                            activeTab === tab
                              ? isDark
                                ? 'bg-gray-700 text-white'
                                : 'bg-blue-500 text-white'
                              : isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {tab === 'input' ? 'Input' : tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden"> {/* Content area below tabs */}
                    {activeTab === 'input' && (
                      <div className="p-4"> {/* Reduced padding */}
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
                      <div className="p-4"> {/* Reduced padding */}
                        <p className="text-lg">LaTeX representation coming soon...</p>
                      </div>
                    )}
                    {activeTab === 'mathjax' && (
                      <div className="p-4"> {/* Reduced padding */}
                        <p className="text-lg">MathJax representation coming soon...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`} style={{ height: '350px', paddingTop: '9rem', paddingBottom: '3rem', sm: { paddingTop: '6rem', paddingBottom: '2rem' } }}>
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create Your Mathematical Visualization
              </h2>
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Bring mathematical concepts to life with interactive 3D visualizations
              </p>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg mx-auto"
              >
                <Plus size={24} />
                Start Creating
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knots.map((knot) => (
                <button
                  key={knot.id}
                  onClick={() => updateKnot(knot.id, {})}
                  className={`${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  } p-6 rounded-lg shadow-md text-left transition-colors`}
                >
                  <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {knot.name}
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {knot.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
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
