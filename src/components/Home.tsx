import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useKnotStore } from '../store/knotStore';
import { KnotDefinition } from '../types/knot';
import { Visualisation } from '../components/Visualisation';

interface HomeProps {
  isDark: boolean;
  onCreateNew: () => void;
}

const Home: React.FC<HomeProps> = ({ isDark, onCreateNew }) => {
  const { knots, selectKnot } = useKnotStore();
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0, isHovering: false, elementId: '' });
  const [heroHover, setHeroHover] = useState({ x: 0, y: 0, isHovering: false });

  // Mouse hover tracking for gradient effect on cards
  const handleMouseMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoverPosition({ x, y, isHovering: true, elementId: id });
  };

  // Mouse tracking for hero section
  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHeroHover({ x, y, isHovering: true });
  };

  const handleMouseLeave = () => {
    setHoverPosition(prev => ({ ...prev, isHovering: false }));
  };

  const handleHeroMouseLeave = () => {
    setHeroHover(prev => ({ ...prev, isHovering: false }));
  };

  // Function to format the lastModified date to relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      return "Today";
    } 
    // Less than 48 hours
    else if (diff < 48 * 60 * 60 * 1000) {
      return "Yesterday";
    } 
    // Otherwise show days ago
    else {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Use actual visualization instead of the thumbnail preview
  const renderVisualization = (code: string) => {
    return (
      <div className="w-full h-full">
        <Visualisation code={code} isDark={isDark} />
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div 
        className={`relative ${
          isDark ? 'bg-gradient-to-br from-gray-900 to-gray-950' : 'bg-gradient-to-br from-white to-blue-50'
        } rounded-xl shadow-xl p-8 py-14 text-center border ${
          isDark ? 'border-gray-800' : 'border-blue-100'
        }`} 
        style={{ 
          marginTop: '2rem',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Base Glow Effect for Hero - More subtle */}
        <div 
          className="absolute inset-0 pointer-events-none z-[-1] filter blur-3xl opacity-20 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-400 transition-opacity duration-300"
        />
        
        {/* Mouse follow glow effect - More subtle and faster */}
        {heroHover.isHovering && (
          <div 
            className="absolute pointer-events-none filter blur-3xl opacity-20 bg-gradient-to-r from-blue-500 via-lavender-500 to-purple-400 rounded-full transition-all duration-150 ease-out"
            style={{
              width: '280px',
              height: '280px',
              left: heroHover.x - 140,
              top: heroHover.y - 140,
              zIndex: 0
            }}
          />
        )}
        
        {/* Hero Section Content */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
              isDark ? 'bg-blue-950 text-blue-300' : 'bg-blue-100 text-blue-800'
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
            onClick={onCreateNew}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:via-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-lg mx-auto font-medium"
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
                className={`${
                  isDark
                    ? 'bg-gray-900 hover:bg-gray-800 border-gray-800'
                    : 'bg-white hover:bg-blue-50 border-gray-200'
                } rounded-xl shadow-md transition-all duration-200 overflow-hidden border hover:shadow-lg group cursor-pointer relative`}
                onClick={() => selectKnot(knot.id)}
                onMouseMove={(e) => handleMouseMove(e, knot.id)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Improved Glow effect - More subtle and faster */}
                {hoverPosition.isHovering && hoverPosition.elementId === knot.id && (
                  <div 
                    className="absolute rounded-full pointer-events-none filter blur-2xl opacity-15 bg-gradient-to-r from-blue-500 via-purple-400 to-blue-400 transition-all duration-150 ease-out"
                    style={{
                      width: '300px',
                      height: '300px',
                      left: hoverPosition.x - 150,
                      top: hoverPosition.y - 150,
                      zIndex: 1
                    }}
                  />
                )}
                
                {/* Real Visualization Instead of Thumbnail */}
                <div className="h-36 w-full overflow-hidden relative pointer-events-none z-10">
                  {renderVisualization(knot.code)}
                </div>
                
                {/* Text container */}
                <div className="relative z-10">
                  <div className="p-4 py-2 transition-transform duration-200">
                    <h3
                      className={`text-xl font-medium mb-1 transition-colors font-serif ${
                        isDark ? 'text-white' : 'text-gray-800'
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
            <p>You haven't created any visualizations yet. Click "Create New" to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;