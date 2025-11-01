import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { AICore } from '../ai/AICore';
import { WorldState } from '../world/WorldState';
import type {
  AddObjectEvent,
  RemoveObjectEvent,
  ModifyObjectEvent,
  ChatMessageEvent,
  SetGravityEvent,
  SaveEvent,
  LoadEvent,
  WorldUpdateEvent,
  AIStateUpdateEvent,
  ChatAIMessageEvent,
  SystemEvent,
} from '../types';

export class SocketHandler {
  private io: SocketIOServer;
  private aiCore: AICore;
  private worldState: WorldState;
  private connectedClients: Set<string> = new Set();

  constructor(io: SocketIOServer, aiCore: AICore, worldState: WorldState) {
    this.io = io;
    this.aiCore = aiCore;
    this.worldState = worldState;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);
      this.connectedClients.add(socket.id);

      // Send initial state to newly connected client
      this.sendInitialState(socket);

      // Register event handlers
      this.registerWorldEvents(socket);
      this.registerChatEvents(socket);
      this.registerSystemEvents(socket);

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  private sendInitialState(socket: Socket) {
    // Send current world state
    const worldUpdate: WorldUpdateEvent = {
      aiState: this.aiCore.getState(),
      objects: this.worldState.getAllObjects(),
      deltaTime: 0,
    };
    socket.emit('world:update', worldUpdate);

    // Send current AI internal state
    const aiStateUpdate: AIStateUpdateEvent = {
      internal: this.aiCore.getInternalState(),
    };
    socket.emit('ai:stateUpdate', aiStateUpdate);
  }

  private registerWorldEvents(socket: Socket) {
    socket.on('world:addObject', (data: AddObjectEvent) => {
      try {
        logger.debug('Adding object to world', data);
        const object = this.worldState.addObject(data);
        logger.info(`Object added: ${object.id}`);
      } catch (error) {
        logger.error('Error adding object:', error);
        this.sendSystemEvent(socket, {
          type: 'error',
          success: false,
          message: 'Failed to add object',
        });
      }
    });

    socket.on('world:removeObject', (data: RemoveObjectEvent) => {
      try {
        logger.debug('Removing object from world', data);
        this.worldState.removeObject(data.objectId);
        logger.info(`Object removed: ${data.objectId}`);
      } catch (error) {
        logger.error('Error removing object:', error);
        this.sendSystemEvent(socket, {
          type: 'error',
          success: false,
          message: 'Failed to remove object',
        });
      }
    });

    socket.on('world:modifyObject', (data: ModifyObjectEvent) => {
      try {
        logger.debug('Modifying object properties', data);
        this.worldState.modifyObject(data.objectId, data.properties);
        logger.info(`Object modified: ${data.objectId}`);
      } catch (error) {
        logger.error('Error modifying object:', error);
        this.sendSystemEvent(socket, {
          type: 'error',
          success: false,
          message: 'Failed to modify object',
        });
      }
    });

    socket.on('world:setGravity', (data: SetGravityEvent) => {
      try {
        logger.debug('Setting gravity', data);
        this.worldState.setGravity(data.value);
        logger.info(`Gravity set to: ${data.value}`);
      } catch (error) {
        logger.error('Error setting gravity:', error);
        this.sendSystemEvent(socket, {
          type: 'error',
          success: false,
          message: 'Failed to set gravity',
        });
      }
    });
  }

  private registerChatEvents(socket: Socket) {
    socket.on('chat:message', (data: ChatMessageEvent) => {
      try {
        logger.debug('Received chat message from user', data);
        // Process message through AI
        this.aiCore.processUserMessage(data.text);

        // AI will respond asynchronously through its update cycle
        // Response will be sent via this.sendAIMessage()
      } catch (error) {
        logger.error('Error processing chat message:', error);
      }
    });
  }

  private registerSystemEvents(socket: Socket) {
    socket.on('system:save', async (data: SaveEvent) => {
      try {
        logger.info(`Saving AI state to slot: ${data.slotName}`);
        await this.aiCore.save(data.slotName);
        this.sendSystemEvent(socket, {
          type: 'saveComplete',
          success: true,
          message: `Saved to ${data.slotName}`,
        });
        logger.info('Save complete');
      } catch (error) {
        logger.error('Error saving:', error);
        this.sendSystemEvent(socket, {
          type: 'error',
          success: false,
          message: 'Save failed',
        });
      }
    });

    socket.on('system:load', async (data: LoadEvent) => {
      try {
        logger.info(`Loading AI state from slot: ${data.slotName}`);
        await this.aiCore.load(data.slotName);
        this.sendSystemEvent(socket, {
          type: 'loadComplete',
          success: true,
          message: `Loaded from ${data.slotName}`,
        });
        logger.info('Load complete');

        // Send updated state to all clients
        this.broadcastWorldUpdate(0);
        this.broadcastAIStateUpdate();
      } catch (error) {
        logger.error('Error loading:', error);
        this.sendSystemEvent(socket, {
          type: 'error',
          success: false,
          message: 'Load failed',
        });
      }
    });
  }

  // Public methods for broadcasting updates

  public broadcastWorldUpdate(deltaTime: number) {
    const worldUpdate: WorldUpdateEvent = {
      aiState: this.aiCore.getState(),
      objects: this.worldState.getAllObjects(),
      deltaTime,
    };
    this.io.emit('world:update', worldUpdate);
  }

  public broadcastAIStateUpdate() {
    const aiStateUpdate: AIStateUpdateEvent = {
      internal: this.aiCore.getInternalState(),
    };
    this.io.emit('ai:stateUpdate', aiStateUpdate);
  }

  public sendAIMessage(message: ChatAIMessageEvent) {
    this.io.emit('chat:aiMessage', message);
  }

  private sendSystemEvent(socket: Socket, event: SystemEvent) {
    socket.emit('system:event', event);
  }

  public getConnectedClientCount(): number {
    return this.connectedClients.size;
  }
}
