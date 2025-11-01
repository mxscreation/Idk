import { useState } from 'react';
import { socketService } from '../../services/socket';

function WorldBuilder() {
  const [objectType, setObjectType] = useState<'sphere' | 'box' | 'cylinder'>('sphere');

  const handleAddObject = () => {
    // Add object at random position near AI
    const position = {
      x: (Math.random() - 0.5) * 10,
      y: 2,
      z: (Math.random() - 0.5) * 10,
    };

    socketService.emit('world:addObject', {
      type: objectType,
      position,
      properties: {},
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2 text-gray-200">World Builder</h2>

      <div className="space-y-2">
        <div>
          <label className="text-sm text-gray-300 block mb-1">Object Type</label>
          <select
            value={objectType}
            onChange={(e) => setObjectType(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white outline-none"
          >
            <option value="sphere">Sphere</option>
            <option value="box">Box</option>
            <option value="cylinder">Cylinder</option>
          </select>
        </div>

        <button
          onClick={handleAddObject}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
        >
          Add Object
        </button>
      </div>
    </div>
  );
}

export default WorldBuilder;
