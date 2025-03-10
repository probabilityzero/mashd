import React, { useState, useEffect } from 'react';
import { Visualisation } from './components/Visualisation';
import { CodeEditor } from './components/CodeEditor';
import { SideMenu } from './components/SideMenu';
import { EditModal } from './components/EditModal';
import { useKnotStore } from './store/knotStore';
import { Menu, X, Moon, Plus, Sun, Pencil, PlusCircle } from 'lucide-react';
import { useTheme } from './store/themeStore';
import { KnotDefinition } from './types/knot';

// --- KnotPreview Component ---
interface KnotPreviewProps {
    code: string;
    isDark: boolean;
}

const KnotPreview: React.FC<KnotPreviewProps> = ({ code, isDark }) => {
    return (
        <div className="h-36 w-full overflow-hidden relative pointer-events-none z-10">
            <Visualisation code={code} isDark={isDark} editingKnot={undefined} onDeleteKnot={() => { }} onDownloadKnot={() => { }} setShowEditModal={() => { }} />
        </div>
    );
};
// --- End KnotPreview Component ---


function App() {
    const { knots, selectedKnot, isMenuOpen, toggleMenu, addKnot, updateKnot, deleteKnot, selectedKnotData, selectKnot } = useKnotStore();
    const { isDark, toggleTheme, setThemeBasedOnSystem } = useTheme();
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'input' | 'code' | 'latex' | 'mathjax'>('code'); // Default to 'code'
    const currentKnot = knots.find(k => k.id === selectedKnot);
    const [editingKnot, setEditingKnot] = useState<KnotDefinition | undefined>(selectedKnotData()); // Call as a function
    
    // FIX: Improved hover state management
    const [hoverState, setHoverState] = useState({
        element: '',
        isHovering: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });


    // Effect to set theme based on system preference on initial load
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeBasedOnSystem(prefersDark);

        // Add listener for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setThemeBasedOnSystem(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [setThemeBasedOnSystem]);

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMenuOpen && e.target === e.currentTarget) {
            toggleMenu();
        }
    };

    const handleCreateNew = () => {
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
        if (knots.length > 1) {
            selectKnot(knots[0].id);
        }
    };

    useEffect(() => {
        setEditingKnot(selectedKnotData());
    }, [selectedKnotData]);

    // FIX: Consolidated hover handlers for consistency
    const handleMouseEnter = (e: React.MouseEvent, id: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverState({
            element: id,
            isHovering: true,
            x: 0,
            y: 0,
            width: rect.width,
            height: rect.height
        });
    };

    const handleMouseMove = (e: React.MouseEvent, id: string) => {
        if (hoverState.element !== id) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setHoverState(prev => ({
            ...prev,
            x,
            y
        }));
    };

    const handleMouseLeave = (id: string) => {
        if (hoverState.element === id) {
            setHoverState(prev => ({
                ...prev,
                isHovering: false
            }));
        }
    };

    const formatRelativeTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 24 * 60 * 60 * 1000) {
            return "Today";
        }
        else if (diff < 48 * 60 * 60 * 1000) {
            return "Yesterday";
        }
        else {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };
    
    // FIX: Helper function for rendering glow effect
    const renderGlowEffect = (elementId: string) => {
        const isActive = hoverState.isHovering && hoverState.element === elementId;
        const glowSize = 100; // Base glow size
        
        return (
            <div
                className={`absolute rounded-full pointer-events-none filter blur-xl transition-opacity duration-300 ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`}
                style={{
                    width: `${glowSize}px`,
                    height: `${glowSize}px`,
                    left: `${hoverState.x - glowSize/2}px`,
                    top: `${hoverState.y - glowSize/2}px`,
                    opacity: isActive ? 0.5 : 0,
                    transform: 'translate(0, 0)',
                    zIndex: 0,
                }}
            />
        );
    };

    return (
        <div className={`min-h-screen ${isDark ? 'dark bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
            <header className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md h-14 w-full sticky top-0 z-30`}>
                <div className="mx-auto px-4 md:px-6 py-0 flex justify-between items-center h-full">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleMenu}
                            className={`p-1.5 relative ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                            onMouseEnter={(e) => handleMouseEnter(e, 'menu-button')}
                            onMouseMove={(e) => handleMouseMove(e, 'menu-button')}
                            onMouseLeave={() => handleMouseLeave('menu-button')}
                        >
                            {/* FIX: Consistent glow effect for header buttons */}
                            {renderGlowEffect('menu-button')}
                            <span className="relative z-10">
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </span>
                        </button>
                        <h1
                            className="text-xl font-semibold md:font-bold cursor-pointer hover:opacity-80 transition-opacity relative"
                            onClick={handleGoHome}
                            onMouseEnter={(e) => handleMouseEnter(e, 'logo')}
                            onMouseMove={(e) => handleMouseMove(e, 'logo')}
                            onMouseLeave={() => handleMouseLeave('logo')}
                        >
                            {/* FIX: Consistent glow effect for logo */}
                            {renderGlowEffect('logo')}
                            <span className="relative z-10">
                                Mash<span className="font-serif font-medium md:font-semibold">(d)</span>
                            </span>
                        </h1>
                    </div>
                    {currentKnot && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className={`text-sm md:text-lg font-medium relative ${isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'} flex items-center gap-1 font-serif`}
                                onMouseEnter={(e) => handleMouseEnter(e, 'edit-button')}
                                onMouseMove={(e) => handleMouseMove(e, 'edit-button')}
                                onMouseLeave={() => handleMouseLeave('edit-button')}
                            >
                                {/* FIX: Consistent glow effect for edit button */}
                                {renderGlowEffect('edit-button')}
                                <span className="relative z-10">
                                    {currentKnot.name}
                                    <Pencil size={14} className="pl-1" />
                                </span>
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 relative ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                            title="Toggle theme"
                            onMouseEnter={(e) => handleMouseEnter(e, 'theme-button')}
                            onMouseMove={(e) => handleMouseMove(e, 'theme-button')}
                            onMouseLeave={() => handleMouseLeave('theme-button')}
                        >
                            {/* FIX: Consistent glow effect for theme button */}
                            {renderGlowEffect('theme-button')}
                            <span className="relative z-10">
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </span>
                        </button>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center p-1 relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-base font-medium"
                            onMouseEnter={(e) => handleMouseEnter(e, 'new-button')}
                            onMouseMove={(e) => handleMouseMove(e, 'new-button')}
                            onMouseLeave={() => handleMouseLeave('new-button')}
                        >
                            {/* FIX: Special glow effect for create new button with different color */}
                            <div
                                className={`absolute rounded-full pointer-events-none filter blur-xl transition-opacity duration-300 ${isDark ? 'bg-purple-600' : 'bg-purple-400'}`}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    left: `${hoverState.x - 50}px`,
                                    top: `${hoverState.y - 50}px`,
                                    opacity: hoverState.isHovering && hoverState.element === 'new-button' ? 0.5 : 0,
                                    transform: 'translate(0, 0)',
                                    zIndex: 0,
                                }}
                            />
                            <span className="relative z-10">
                                <PlusCircle size={18} />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClickOutside} />}
            <SideMenu onCreateNew={handleCreateNew} onCloseMenu={toggleMenu} />

            <main className="container mx-auto px-4 md:px-6 py-8">
                {currentKnot ? (
                    <div className="space-y-6">
                        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`} style={{ height: '600px' }}>
                            <Visualisation code={currentKnot.code} isDark={isDark} editingKnot={editingKnot} onDeleteKnot={handleDeleteKnot} onDownloadKnot={handleDownload} setShowEditModal={setShowEditModal} />
                        </div>

                        <div className="flex">
                            <div className="flex flex-col w-full">
                                <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg overflow-hidden mt-2 border`}>
                                    <div className={`flex p-1.5 justify-between items-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r ${isDark ? 'to-gray-800 from-gray-700' : 'from-blue-300 to-blue-500'}`}>
                                        <div className="flex space-x-1">
                                            {(['input', 'code', 'latex', 'mathjax'] as const).map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`px-3 py-1 capitalize text-sm font-medium rounded-full transition-colors ${activeTab === tab
                                                        ? isDark
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-blue-700 text-white'
                                                        : isDark
                                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                    <div className="space-y-10 max-w-6xl mx-auto">
                        <div
                            className={`relative ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-blue-50'
                                } rounded-xl shadow-xl p-8 py-14 text-center border ${isDark ? 'border-gray-700' : 'border-blue-100'
                                } overflow-hidden`}
                            style={{
                                marginTop: '2rem',
                                minHeight: '320px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onMouseEnter={(e) => handleMouseEnter(e, 'hero')}
                            onMouseMove={(e) => handleMouseMove(e, 'hero')}
                            onMouseLeave={() => handleMouseLeave('hero')}
                        >
                            {/* FIX: Improved hero section glow effect */}
                            <div
                                className={`absolute inset-0 pointer-events-none filter blur-3xl transition-opacity duration-300 bg-gradient-to-r from-blue-400 to-purple-300`}
                                style={{ 
                                    opacity: hoverState.isHovering && hoverState.element === 'hero' ? 0.5 : 0
                                }}
                            />

                            {/* Hero Section Content */}
                            <div className="max-w-3xl mx-auto relative z-10">
                                <div className="mb-3">
                                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        Mathematical Visualization Tool
                                    </span>
                                </div>
                                <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Mash<span className="font-serif font-semibold">(d)</span> for Mathematical Visualization
                                </h2>
                                <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                                    Bring algebra, geometry and topology to life with interactive multi-dimension visualizations to explore concepts in a visual way.
                                </p>
                                <button
                                    onClick={handleCreateNew}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-lg mx-auto font-medium"
                                >
                                    <Plus size={24} />
                                    Create New
                                </button>
                            </div>
                        </div>


                        <div className="mt-12">
                            <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} text-center`}>
                                Your Visualizations
                            </h3>

                            {knots.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {knots.map((knot) => (
                                        <div
                                            key={knot.id}
                                            className={`${isDark
                                                ? 'bg-gray-900 hover:bg-gray-900 border-gray-700'
                                                : 'bg-white hover:bg-blue-50 border-gray-200'
                                                } rounded-xl shadow-md transition-all duration-200 overflow-hidden border hover:shadow-lg group cursor-pointer relative`}
                                            onClick={() => selectKnot(knot.id)}
                                            onMouseEnter={(e) => handleMouseEnter(e, knot.id)}
                                            onMouseMove={(e) => handleMouseMove(e, knot.id)}
                                            onMouseLeave={() => handleMouseLeave(knot.id)}
                                        >
                                            {/* FIX: Improved glow effect for knot cards */}
                                            <div
                                                className={`absolute rounded-full pointer-events-none filter blur-xl transition-opacity duration-300 ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`}
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    left: `${hoverState.x - 75}px`,
                                                    top: `${hoverState.y - 75}px`,
                                                    opacity: hoverState.isHovering && hoverState.element === knot.id ? 0.5 : 0,
                                                    zIndex: 1,
                                                }}
                                            />

                                            {/* --- Use KnotPreview Here --- */}
                                            <KnotPreview code={knot.code} isDark={isDark} />
                                            {/* --- End KnotPreview --- */}

                                            {/* Text container */}
                                            <div className="relative z-10">
                                                <div className="p-4 py-2 transition-transform duration-200">
                                                    <h3
                                                        className={`text-xl font-medium mb-1 transition-colors font-serif ${isDark ? 'text-white' : 'text-gray-800'
                                                            }`}
                                                    >
                                                        {knot.name}
                                                    </h3>
                                                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                                                        {knot.description}
                                                    </p>
                                                    <div className="flex justify-end items-center">
                                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {formatRelativeTime(knot.lastModified)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center p-8 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    <p>You haven't created any visualizations yet.  Click "Create New" to begin.</p>
                                </div>
                            )}
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