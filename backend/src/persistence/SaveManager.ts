import { promises as fs } from 'fs';
import { join } from 'path';
import { CONFIG } from '../config/constants';
import { logger } from '../utils/logger';

export class SaveManager {
  private saveDir: string;
  private backupDir: string;
  private maxBackups: number = 5;

  constructor() {
    this.saveDir = CONFIG.SAVE_DIR;
    this.backupDir = CONFIG.BACKUP_DIR;
    this.ensureDirectories();
  }

  /**
   * Ensure save directories exist
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.saveDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating save directories:', error);
    }
  }

  /**
   * Save AI state to file
   */
  public async save(slotName: string, data: any): Promise<void> {
    const filename = `${slotName}.json`;
    const filepath = join(this.saveDir, filename);

    try {
      // Create backup of existing save if it exists
      await this.createBackup(slotName);

      // Write new save
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(filepath, json, 'utf-8');

      logger.info(`Saved to ${filepath}`);
    } catch (error) {
      logger.error(`Error saving to ${filepath}:`, error);
      throw error;
    }
  }

  /**
   * Load AI state from file
   */
  public async load(slotName: string): Promise<any | null> {
    const filename = `${slotName}.json`;
    const filepath = join(this.saveDir, filename);

    try {
      const json = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(json);

      logger.info(`Loaded from ${filepath}`);
      return data;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        logger.warn(`Save file not found: ${filepath}`);
        return null;
      }
      logger.error(`Error loading from ${filepath}:`, error);
      throw error;
    }
  }

  /**
   * Create backup of existing save
   */
  private async createBackup(slotName: string): Promise<void> {
    const filename = `${slotName}.json`;
    const filepath = join(this.saveDir, filename);

    try {
      // Check if file exists
      await fs.access(filepath);

      // Create backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `${slotName}_backup_${timestamp}.json`;
      const backupPath = join(this.backupDir, backupFilename);

      // Copy file to backup
      await fs.copyFile(filepath, backupPath);

      logger.debug(`Created backup: ${backupFilename}`);

      // Clean old backups
      await this.cleanOldBackups(slotName);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        logger.error('Error creating backup:', error);
      }
    }
  }

  /**
   * Clean old backups (keep only most recent)
   */
  private async cleanOldBackups(slotName: string): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);

      // Filter backups for this slot
      const slotBackups = files.filter(f => f.startsWith(`${slotName}_backup_`));

      if (slotBackups.length > this.maxBackups) {
        // Sort by name (timestamp in filename)
        slotBackups.sort();

        // Remove oldest
        const toRemove = slotBackups.slice(0, slotBackups.length - this.maxBackups);

        for (const file of toRemove) {
          await fs.unlink(join(this.backupDir, file));
          logger.debug(`Removed old backup: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning old backups:', error);
    }
  }

  /**
   * List available saves
   */
  public async listSaves(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.saveDir);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch (error) {
      logger.error('Error listing saves:', error);
      return [];
    }
  }

  /**
   * Delete a save
   */
  public async deleteSave(slotName: string): Promise<void> {
    const filename = `${slotName}.json`;
    const filepath = join(this.saveDir, filename);

    try {
      await fs.unlink(filepath);
      logger.info(`Deleted save: ${slotName}`);
    } catch (error) {
      logger.error(`Error deleting save ${slotName}:`, error);
      throw error;
    }
  }
}
