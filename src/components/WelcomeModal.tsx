import React from 'react';
import { useKnotStore } from '../store/knotStore';
import { Plus } from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const { knots, selectKnot, addKnot } = useKnotStore();

  const handleCreateNew = () => {
    const newKnot = {
      id: `knot-${Date.now()}`,
      name: 'New Knot',
      description: 'Custom knot definition',
      lastModified: Date.now(),
      code: `function generateKnotPoints(t) {
  const x = Math.sin(t);
  const y = Math.cos(t);
  const z = Math.sin(2 * t);
  return [x, y, z];
}`
    };
    addKnot(newKnot);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to Topology Visualizer</h2>
          <p className="text-gray-600 mb-6">
            Choose from our pre-made examples or create your own topology visualization
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {knots.map((knot) => (
              <button
                key={knot.id}
                onClick={() => {
                  selectKnot(knot.id);
                  onClose();
                }}
                className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
              >
                <h3 className="font-medium">{knot.name}</h3>
                <p className="text-sm text-gray-600">{knot.description}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              Create New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
