import React, { useState } from 'react';
import { useKnotStore } from '../store/knotStore';
import { KnotDefinition } from '../types/knot';
import { X } from 'lucide-react';

interface EditModalProps {
  knot: KnotDefinition;
  onClose: () => void;
  isDark: boolean;
}

export const EditModal: React.FC<EditModalProps> = ({ knot, onClose, isDark }) => {
  const { updateKnot } = useKnotStore();
  const [name, setName] = useState(knot.name);
  const [description, setDescription] = useState(knot.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKnot(knot.id, { name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full mx-4`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Edit Visualization
            </h2>
            <button
              onClick={onClose}
              className={`p-2 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } rounded-full transition-colors`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
