# Running Kafka & Zookeeper Locally on macOS

## 1. Installation using Homebrew

```bash
# Install Kafka (includes Zookeeper)
brew install kafka
```

## 2. Configuration Files

### A. Zookeeper Configuration

```bash
# Location: /opt/homebrew/etc/zookeeper/zoo.cfg
# Key configurations:
tickTime=2000
dataDir=/opt/homebrew/var/lib/zookeeper
clientPort=2181
initLimit=5
syncLimit=2
```

### B. Kafka Configuration

```bash
# Location: /opt/homebrew/etc/kafka/server.properties
# Key configurations:
broker.id=1
listeners=PLAINTEXT://localhost:9092
log.dirs=/opt/homebrew/var/lib/kafka/data
zookeeper.connect=localhost:2181
```

## 3. Starting Services

### Method 1: Using Homebrew Services (Recommended)

```bash
# Start Zookeeper
brew services start zookeeper

# Start Kafka
brew services start kafka

# Check status
brew services list

# Stop services
brew services stop kafka
brew services stop zookeeper
```

# Check Kafka logs for any errors

```
tail -f /opt/homebrew/var/log/kafka/kafka_output.log
```

### Method 2: Manual Start

```bash
# Start Zookeeper
zookeeper-server-start /opt/homebrew/etc/kafka/zookeeper.properties

# Start Kafka (in a new terminal)
kafka-server-start /opt/homebrew/etc/kafka/server.properties
```

## 4. Verification Commands

```bash
# Create a test topic
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic test

# List topics
kafka-topics --list --bootstrap-server localhost:9092

# In terminal 1 - Start a producer
kafka-console-producer --broker-list localhost:9092 --topic test

# In terminal 2 - Start a consumer
kafka-console-consumer --bootstrap-server localhost:9092 --topic test --from-beginning
```

## 5. Common Issues & Solutions

### A. Port Already in Use

```bash
# Check if ports are in use
lsof -i :9092  # Kafka port
lsof -i :2181  # Zookeeper port

# Check service status
brew services list

# Check logs
cat /opt/homebrew/var/log/kafka/kafka_output.log
cat /opt/homebrew/var/log/zookeeper/zookeeper.log

# Kill process if needed
kill -9 <PID>
```

### B. Clean Start

```bash
# 1. First stop Kafka and Zookeeper
brew services stop kafka
brew services stop zookeeper

# 2. Clean up the Kafka logs and data directories
sudo rm -rf /opt/homebrew/var/lib/kafka-logs
sudo rm -rf /opt/homebrew/var/lib/kafka/data
sudo rm -rf /opt/homebrew/var/lib/zookeeper/*

# 3. Create fresh directories
sudo mkdir -p /opt/homebrew/var/lib/kafka-logs
sudo mkdir -p /opt/homebrew/var/lib/kafka/data

# 4. Set proper permissions
sudo chown -R $(whoami):admin /opt/homebrew/var/lib/kafka-logs
sudo chown -R $(whoami):admin /opt/homebrew/var/lib/kafka
sudo chown -R $(whoami):admin /opt/homebrew/var/lib/zookeeper

# 5. Start services in correct order
brew services start zookeeper
# Wait for 10 seconds
sleep 10
brew services start kafka

# 6. Verify the services are running
brew services list

# 7. Check Kafka logs for successful startup
tail -f /opt/homebrew/var/log/kafka/kafka_output.log
```

## 6. Integration with Your Webhook System

### A. Environment Variables

```typescript:src/config/env.ts
export const KAFKA_CONFIG = {
  BROKERS: process.env.KAFKA_BROKERS || 'localhost:9092',
  CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'webhook-system',
  GROUP_ID: process.env.KAFKA_GROUP_ID || 'webhook-group',
};
```

### B. Kafka Health Check

```typescript:src/shared/libraries/kafka/kafka-health.ts
import { KafkaConfig } from './kafka-config';
import { logger } from '../utils/logger';

export async function checkKafkaHealth(): Promise<boolean> {
  const admin = KafkaConfig.getInstance().getClient().admin();

  try {
    await admin.connect();
    const topics = await admin.listTopics();
    await admin.disconnect();

    logger.info('Kafka connection successful', { topics });
    return true;
  } catch (error) {
    logger.error('Kafka health check failed', error);
    return false;
  }
}
```

### C. Startup Script

```bash:scripts/start-local.sh
#!/bin/bash

# Check if Kafka and Zookeeper are running
if ! brew services list | grep -q "kafka.*started"; then
  echo "Starting Kafka..."
  brew services start kafka
fi

if ! brew services list | grep -q "zookeeper.*started"; then
  echo "Starting Zookeeper..."
  brew services start zookeeper
fi

# Wait for services to be ready
sleep 5

# Create required topics if they don't exist
kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --replication-factor 1 --partitions 3 --topic webhook-events
kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --replication-factor 1 --partitions 3 --topic webhook-retries
kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --replication-factor 1 --partitions 3 --topic webhook-dlq

# Start your application
npm run dev
```

## 7. Monitoring

### A. Using Kafka Tool

```bash
# Install Kafka Tool
brew install kafka-tool

# Or use Docker
docker run -d -p 8080:8080 -e KAFKA_BROKERS=localhost:9092 provectuslabs/kafka-ui
```

### B. Command Line Monitoring

```bash
# Monitor consumer groups
kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group webhook-group

# Monitor topic lag
kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group webhook-group | grep webhook-events
```

## 8. Development Best Practices

1. **Always use environment variables** for Kafka configuration
2. **Implement proper error handling** and reconnection logic
3. **Monitor consumer lag** to ensure proper processing
4. **Use separate topics** for different priority levels
5. **Implement dead letter queues** for failed messages
6. **Regular health checks** to ensure Kafka connectivity

Would you like me to:

1. Add more details about topic configuration?
2. Show how to set up multiple broker instances?
3. Provide monitoring dashboard setup?
4. Add more debugging commands?

## 9. Creat the requird topics:

```bash
kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --topic webhook-events --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --topic webhook-retries --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --topic webhook-medium-priority --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --topic webhook-low-priority --partitions 3 --replication-factor 1
```
