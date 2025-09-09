import { 
  CreateLogGroupCommand, 
  CreateLogStreamCommand, 
  PutLogEventsCommand,
  DescribeLogGroupsCommand 
} from '@aws-sdk/client-cloudwatch-logs'
import { cloudWatchClient } from './aws'

const LOG_GROUP_NAME = '/aws/fullstack-project'
const LOG_STREAM_NAME = 'application-logs'

export class CloudWatchLogger {
  private logGroupName: string
  private logStreamName: string
  private sequenceToken?: string

  constructor(logGroupName: string = LOG_GROUP_NAME, logStreamName: string = LOG_STREAM_NAME) {
    this.logGroupName = logGroupName
    this.logStreamName = logStreamName
  }

  async initialize(): Promise<void> {
    try {
      // Check if log group exists
      const describeCommand = new DescribeLogGroupsCommand({
        logGroupNamePrefix: this.logGroupName,
      })
      
      const response = await cloudWatchClient.send(describeCommand)
      const logGroupExists = response.logGroups?.some(
        group => group.logGroupName === this.logGroupName
      )

      // Create log group if it doesn't exist
      if (!logGroupExists) {
        const createLogGroupCommand = new CreateLogGroupCommand({
          logGroupName: this.logGroupName,
        })
        await cloudWatchClient.send(createLogGroupCommand)
      }

      // Create log stream
      const createLogStreamCommand = new CreateLogStreamCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
      })
      
      try {
        await cloudWatchClient.send(createLogStreamCommand)
      } catch (error: any) {
        // Log stream might already exist, which is fine
        if (error.name !== 'ResourceAlreadyExistsException') {
          throw error
        }
      }
    } catch (error) {
      console.error('Failed to initialize CloudWatch logging:', error)
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    try {
      const logEvent = {
        timestamp: Date.now(),
        message: JSON.stringify({
          level,
          message,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      }

      const command = new PutLogEventsCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: [logEvent],
        sequenceToken: this.sequenceToken,
      })

      const response = await cloudWatchClient.send(command)
      this.sequenceToken = response.nextSequenceToken
    } catch (error) {
      console.error('Failed to send log to CloudWatch:', error)
      // Fallback to console logging
      console.log(`[${level}] ${message}`, metadata)
    }
  }

  async info(message: string, metadata?: any): Promise<void> {
    await this.log('INFO', message, metadata)
  }

  async error(message: string, metadata?: any): Promise<void> {
    await this.log('ERROR', message, metadata)
  }

  async warn(message: string, metadata?: any): Promise<void> {
    await this.log('WARN', message, metadata)
  }

  async debug(message: string, metadata?: any): Promise<void> {
    await this.log('DEBUG', message, metadata)
  }
}

// Create a singleton instance
export const cloudWatchLogger = new CloudWatchLogger()
