import React, { useState, useRef, useEffect } from 'react';
import { useKnotStore } from '../store/knotStore';
import { Plus, Download, Trash2, Moon, Sun, MoreVertical, X, Edit } from 'lucide-react';
import { KnotDefinition } from '../types/knot';
import { EditModal } from './EditModal';
import { useTheme } from '../store/themeStore';

interface SideMenuProps {
  onCreateNew: () => void;
  onCloseMenu: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ onCreateNew, onCloseMenu }) => {
  const { knots, selectedKnot, isMenuOpen, selectKnot, deleteKnot } = useKnotStore();
  const { isDark, toggleTheme } = useTheme();
  const [editingKnot, setEditingKnot] = React.useState<KnotDefinition | null>(null);
  const [popoverKnotId, setPopoverKnotId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const knotItemRef = useRef<HTMLElement[]>([]); // Ref to track each knot item


  const handleDownload = (knot: KnotDefinition) => {
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

  const handlePopoverToggle = (knotId: string) => {
    setPopoverKnotId(popoverKnotId === knotId ? null : knotId);
  };

  const closePopover = () => {
    setPopoverKnotId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-64 ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white'
        } shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col`}
      >
        <div className="p-3 flex flex-col h-full">
          <div className="flex justify-between items-center ml-2 mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Library
            </h2>
          </div>

          <button
            onClick={onCreateNew}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors mb-6 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Plus size={20} />
            <span>Create New</span>
          </button>


          <div className="flex-grow overflow-y-auto">
            {knots.map((knot, index) => (
              <div
                key={knot.id}
                ref={(el) => (knotItemRef.current[index] = el as HTMLElement)}
                className={`relative group p-3 py-1.5 rounded-lg transition-colors ${
                  selectedKnot === knot.id
                    ? isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                    : isDark
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => selectKnot(knot.id)}
                  className="w-full text-left"
                >
                  <h3 className={`font-normal ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {knot.name}
                  </h3>
                </button>

                <div className="absolute top-1.5 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handlePopoverToggle(knot.id)}
                    className={`p-1 rounded-md ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {popoverKnotId === knot.id && (
                  <div 
                    ref={popoverRef} 
                    className={`absolute border ${isDark ? 'border-gray-600' : 'border-gray-200'} right-0 top-full w-48 rounded-md shadow-lg ${
                      isDark ? 'bg-gray-700' : 'bg-white'
                    } focus:outline-none z-10`}
                  >
                    <div className="" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <button
                        onClick={() => { setEditingKnot(knot); closePopover(); }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${
                          isDark 
                            ? 'text-gray-200 hover:bg-gray-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        role="menuitem"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => { handleDownload(knot); closePopover(); }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${
                          isDark 
                            ? 'text-gray-200 hover:bg-gray-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        role="menuitem"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      <button
                        onClick={() => { deleteKnot(knot.id); closePopover(); }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm text-red-500 w-full text-left ${
                          isDark 
                            ? 'hover:bg-gray-600' 
                            : 'hover:bg-gray-100'
                        }`}
                        role="menuitem"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <button
            onClick={toggleTheme}
            className={`absolute bottom-4 right-4 p-2 ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } rounded-full transition-colors flex items-center justify-center`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {editingKnot && (
        <EditModal
          knot={editingKnot}
          onClose={() => setEditingKnot(null)}
          isDark={isDark}
        />
      )}
    </>
  );
};