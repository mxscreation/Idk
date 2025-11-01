import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { CONFIG } from './config/constants';
import { logger } from './utils/logger';
import { SocketHandler } from './communication/SocketHandler';
import { AICore } from './ai/AICore';
import { PhysicsWorld } from './world/PhysicsWorld';
import { WorldState as WorldStateManager } from './world/WorldState';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: CONFIG.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CONFIG.FRONTEND_URL,
    credentials: true,
  },
});

// Initialize core systems
logger.info('Initializing core systems...');

const physicsWorld = new PhysicsWorld();
const worldState = new WorldStateManager(physicsWorld);
const aiCore = new AICore(worldState, physicsWorld);
const socketHandler = new SocketHandler(io, aiCore, worldState);

// Main simulation loop
let lastUpdateTime = Date.now();
let isRunning = true;

function simulationLoop() {
  if (!isRunning) return;

  const currentTime = Date.now();
  const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
  lastUpdateTime = currentTime;

  try {
    // Update physics
    physicsWorld.step(deltaTime);

    // Update world state
    worldState.update(deltaTime);

    // Update AI (perception, thinking, action)
    aiCore.update(deltaTime);

    // Emit state updates to connected clients
    socketHandler.broadcastWorldUpdate(deltaTime);
    socketHandler.broadcastAIStateUpdate();

  } catch (error) {
    logger.error('Error in simulation loop:', error);
  }

  // Schedule next update
  const targetInterval = 1000 / CONFIG.UPDATE_FREQUENCY;
  const elapsed = Date.now() - currentTime;
  const nextDelay = Math.max(0, targetInterval - elapsed);

  setTimeout(simulationLoop, nextDelay);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  isRunning = false;

  try {
    // Save AI state before shutdown
    await aiCore.save('autosave_shutdown');
    logger.info('AI state saved');
  } catch (error) {
    logger.error('Error saving AI state:', error);
  }

  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server
httpServer.listen(CONFIG.PORT, () => {
  logger.info(`Server running on port ${CONFIG.PORT}`);
  logger.info(`Environment: ${CONFIG.NODE_ENV}`);
  logger.info(`Frontend URL: ${CONFIG.FRONTEND_URL}`);
  logger.info('Starting simulation loop...');

  // Initialize AI (start as "newborn")
  aiCore.initialize();

  // Start simulation loop
  simulationLoop();
});

export { io, aiCore, worldState, physicsWorld };
