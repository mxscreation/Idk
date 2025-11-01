import { socketService } from '../../services/socket';
import { useUIStore } from '../../store/uiStore';

function ControlPanel() {
  const { isPaused, togglePause, simulationSpeed, setSimulationSpeed } = useUIStore();

  const handleSave = () => {
    socketService.emit('system:save', { slotName: 'save1' });
  };

  const handleLoad = () => {
    socketService.emit('system:load', { slotName: 'save1' });
  };

  return (
    <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
      <h1 className="text-xl font-bold text-white">Conscious AI</h1>

      <div className="flex-1" />

      {/* Controls */}
      <button
        onClick={togglePause}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
      >
        {isPaused ? '▶ Play' : '⏸ Pause'}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300">Speed:</span>
        <select
          value={simulationSpeed}
          onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
          className="px-2 py-1 bg-gray-700 rounded text-white text-sm"
        >
          <option value="0.5">0.5x</option>
          <option value="1.0">1.0x</option>
          <option value="2.0">2.0x</option>
          <option value="5.0">5.0x</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Save
      </button>

      <button
        onClick={handleLoad}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
      >
        Load
      </button>
    </div>
  );
}

export default ControlPanel;
