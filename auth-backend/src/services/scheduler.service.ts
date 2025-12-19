import { classReminderService } from './class-reminder.service';
import { eventNotificationService } from './event-notification.service';
import { classStatusService } from './class-status.service';
import logger from '../config/logger';

/**
 * Scheduler service for running periodic tasks
 */
class SchedulerService {
  private intervals: NodeJS.Timeout[] = [];

  /**
   * Start all scheduled tasks
   */
  start(): void {
    logger.info('Starting scheduler service...');

    // Run 24-hour reminders every hour
    this.scheduleTask(
      'Class 24h Reminders',
      () => classReminderService.send24HourReminders(),
      60 * 60 * 1000 // Every hour
    );

    // Run 1-hour reminders every 15 minutes
    this.scheduleTask(
      'Class 1h Reminders',
      () => classReminderService.send1HourReminders(),
      15 * 60 * 1000 // Every 15 minutes
    );

    // Run 15-minute reminders every 5 minutes
    this.scheduleTask(
      'Class 15m Reminders',
      () => classReminderService.send15MinuteReminders(),
      5 * 60 * 1000 // Every 5 minutes
    );

    // Check low credit balances every 6 hours
    this.scheduleTask(
      'Low Credit Balance Check',
      () => eventNotificationService.checkLowCreditBalances(),
      6 * 60 * 60 * 1000 // Every 6 hours
    );

    // Check expiring trials every 12 hours
    this.scheduleTask(
      'Expiring Trials Check',
      () => eventNotificationService.checkExpiringTrials(),
      12 * 60 * 60 * 1000 // Every 12 hours
    );

    // Update class statuses every 5 minutes
    this.scheduleTask(
      'Class Status Update',
      () => classStatusService.updateClassStatuses(),
      5 * 60 * 1000 // Every 5 minutes
    );

    logger.info('Scheduler service started successfully');
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    logger.info('Stopping scheduler service...');
    
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    
    logger.info('Scheduler service stopped');
  }

  /**
   * Schedule a task to run periodically
   */
  private scheduleTask(
    name: string,
    task: () => Promise<any>,
    intervalMs: number
  ): void {
    // Run immediately on start
    task().catch((error) => {
      logger.error(`Error running scheduled task "${name}":`, error);
    });

    // Schedule periodic execution
    const interval = setInterval(async () => {
      try {
        await task();
      } catch (error) {
        logger.error(`Error running scheduled task "${name}":`, error);
      }
    }, intervalMs);

    this.intervals.push(interval);
    
    logger.info(
      `Scheduled task "${name}" to run every ${intervalMs / 1000} seconds`
    );
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();
