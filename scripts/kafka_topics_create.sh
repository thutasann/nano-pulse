#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

echo "${YELLOW}Starting Kafka topic creation script...${NC}"

# Check if Kafka is running
if ! brew services list | grep -q "kafka.*started"; then
    echo "${RED}Kafka is not running. Starting Kafka...${NC}"
    brew services start zookeeper
    sleep 5
    brew services start kafka
    sleep 5
fi

# Function to create a topic
create_topic() {
    local topic=$1
    local partitions=$2
    local replication_factor=$3

    echo "${YELLOW}Creating topic: ${topic}${NC}"
    
    kafka-topics --create \
        --if-not-exists \
        --bootstrap-server localhost:9092 \
        --topic "$topic" \
        --partitions "$partitions" \
        --replication-factor "$replication_factor" \
        --config cleanup.policy=delete \
        --config retention.ms=604800000 \
        --config min.insync.replicas=1

    if [ $? -eq 0 ]; then
        echo "${GREEN}Successfully created topic: ${topic}${NC}"
    else
        echo "${RED}Failed to create topic: ${topic}${NC}"
        exit 1
    fi
}

# Delete topics if they exist (optional, comment out if not needed)
echo "${YELLOW}Deleting existing topics...${NC}"
kafka-topics --bootstrap-server localhost:9092 --delete --topic webhook_queue_medium --if-exists
kafka-topics --bootstrap-server localhost:9092 --delete --topic webhook_queue_low --if-exists

# Wait for topic deletion to complete
sleep 5

# Create topics
create_topic "webhook_queue_medium" 3 1
create_topic "webhook_queue_low" 3 1
create_topic "user_auth_events" 3 1

# List all topics
echo "${YELLOW}Current Kafka topics:${NC}"
kafka-topics --list --bootstrap-server localhost:9092

echo "${GREEN}Kafka topic creation completed successfully!${NC}"
