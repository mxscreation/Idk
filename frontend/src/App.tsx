import { useEffect } from 'react';
import { socketService } from './services/socket';
import { useWorldStore } from './store/worldStore';
import { useAIStore } from './store/aiStore';
import World3D from './components/World3D/World3D';
import ChatPanel from './components/ChatPanel/ChatPanel';
import DebugPanel from './components/DebugPanel/DebugPanel';
import WorldBuilder from './components/WorldBuilder/WorldBuilder';
import ControlPanel from './components/ControlPanel/ControlPanel';
import { useUIStore } from './store/uiStore';

function App() {
  const { setObjects, setAIPosition, setAIVelocity, setAIOrientation } = useWorldStore();
  const { setInternal } = useAIStore();
  const { showDebugPanel, showChatPanel, showWorldBuilder } = useUIStore();

  useEffect(() => {
    // Connect to backend
    socketService.connect();

    // Listen for world updates
    socketService.on('world:update', (data: any) => {
      setObjects(data.objects);
      setAIPosition(data.aiState.position);
      setAIVelocity(data.aiState.velocity);
      setAIOrientation(data.aiState.orientation);
    });

    // Listen for AI state updates
    socketService.on('ai:stateUpdate', (data: any) => {
      setInternal(data.internal);
    });

    return () => {
      socketService.disconnect();
    };
  }, [setObjects, setAIPosition, setAIVelocity, setAIOrientation, setInternal]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-white">
      {/* Top control panel */}
      <ControlPanel />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D World View */}
        <div className="flex-1 relative">
          <World3D />
        </div>

        {/* Right sidebar */}
        <div className="w-96 flex flex-col bg-gray-800 border-l border-gray-700">
          {showDebugPanel && (
            <div className="flex-1 overflow-y-auto border-b border-gray-700">
              <DebugPanel />
            </div>
          )}

          {showChatPanel && (
            <div className="h-64 border-b border-gray-700">
              <ChatPanel />
            </div>
          )}

          {showWorldBuilder && (
            <div className="h-48 overflow-y-auto">
              <WorldBuilder />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
