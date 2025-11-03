const cron = require('node-cron');
const SyncService = require('./sync');

class Scheduler {
  constructor() {
    this.syncService = new SyncService();
    this.jobs = [];
  }

  /**
   * Start daily sync at specified time (default: 2:00 AM)
   */
  startDailySync(cronTime = '0 2 * * *') {
    console.log(`Scheduling daily sync with cron: ${cronTime}`);

    const job = cron.schedule(cronTime, async () => {
      console.log('Starting scheduled incremental sync...');
      try {
        await this.syncService.incrementalSync();
        console.log('Scheduled sync completed successfully');
      } catch (error) {
        console.error('Scheduled sync failed:', error);
      }
    });

    this.jobs.push(job);
    console.log('Daily sync scheduler started');
  }

  /**
   * Trigger manual sync
   */
  async triggerManualSync(syncType = 'incremental') {
    console.log(`Triggering manual ${syncType} sync...`);

    try {
      if (syncType === 'full') {
        return await this.syncService.fullSync();
      } else {
        return await this.syncService.incrementalSync();
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('All scheduled jobs stopped');
  }
}

module.exports = Scheduler;
