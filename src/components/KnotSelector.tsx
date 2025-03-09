import React from 'react';
import { useKnotStore } from '../store/knotStore';
import { KnotDefinition } from '../types/knot';
import { Plus } from 'lucide-react';

export const KnotSelector: React.FC = () => {
  const { knots, selectedKnot, selectKnot, addKnot } = useKnotStore();

  const handleAddNewKnot = () => {
    const newKnot: KnotDefinition = {
      id: `knot-${Date.now()}`,
      name: 'New Knot',
      description: 'Custom knot definition',
      code: `function generatePoints(t) {
  const x = Math.sin(t);
  const y = Math.cos(t);
  const z = Math.sin(2 * t);
  return [x, y, z];
}`
    };
    addKnot(newKnot);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Knot Library</h2>
        <button
          onClick={handleAddNewKnot}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-2">
        {knots.map((knot) => (
          <button
            key={knot.id}
            onClick={() => selectKnot(knot.id)}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              selectedKnot === knot.id
                ? 'bg-blue-100 border-blue-500'
                : 'hover:bg-gray-100'
            }`}
          >
            <h3 className="font-medium">{knot.name}</h3>
            <p className="text-sm text-gray-600">{knot.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
