import { useAIStore } from '../../store/aiStore';

function DebugPanel() {
  const { internal } = useAIStore();

  if (!internal) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2 text-gray-200">AI Internal State</h2>
        <p className="text-gray-400">Waiting for AI data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-200">AI Internal State</h2>

      {/* Current Thought */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Current Thought</h3>
        <div className="bg-gray-700 p-2 rounded text-gray-200 italic">
          "{internal.currentThought}"
        </div>
      </div>

      {/* Emotion State */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Emotion</h3>
        <div className="space-y-1">
          <div>
            <div className="text-xs text-gray-400">Valence</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-green-500"
                  style={{ width: `${(internal.emotion.valence + 1) * 50}%` }}
                />
              </div>
              <span className="text-xs text-gray-300 w-12">
                {internal.emotion.valence.toFixed(2)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Arousal</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${internal.emotion.arousal * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-300 w-12">
                {internal.emotion.arousal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Curiosity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Curiosity</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-purple-500"
              style={{ width: `${internal.curiosity * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 w-12">
            {internal.curiosity.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Attention */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Attention</h3>
        <div className="bg-gray-700 p-2 rounded text-xs text-gray-300">
          <div>Target: {internal.attention.targetId || 'None'}</div>
          <div>Strength: {internal.attention.strength.toFixed(2)}</div>
        </div>
      </div>

      {/* Memory Stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Memory</h3>
        <div className="bg-gray-700 p-2 rounded text-xs text-gray-300 space-y-1">
          <div>Experiences: {internal.memory.totalExperiences}</div>
          <div>Episodic: {internal.memory.episodicCount}</div>
          <div>Semantic: {internal.memory.semanticCount}</div>
          <div>Vocabulary: {internal.memory.vocabularySize} words</div>
        </div>
      </div>

      {/* Learning Rate */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Learning Rate</h3>
        <div className="bg-gray-700 p-2 rounded text-xs text-gray-300">
          {internal.learningRate.toFixed(4)}
        </div>
      </div>
    </div>
  );
}

export default DebugPanel;
