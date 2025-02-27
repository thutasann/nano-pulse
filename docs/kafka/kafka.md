# Kafka

## Scripts

Start Zookeeper Service:

```bash
zookeeper-server-start /opt/homebrew/etc/kafka/zookeeper.properties
```

Open a new terminal window and start the Kafka server:

```bash
kafka-server-start /opt/homebrew/etc/kafka/server.properties
```

## Create a Kafka Topic

- Open another terminal window and create a Kafka topic:

```bash
kafka-topics --create --topic test-topic --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
```

- List all topics to ensure your topic was created successfully:

```bash
kafka-topics --list --bootstrap-server localhost:9092
```

## Test Kafka Setup

- Open a new terminal window and start a producer to send messages to the test-topic:

```bash
kafka-console-producer --topic test-topic --bootstrap-server localhost:9092
```

- Open another terminal window and start a consumer to read messages from the test-topic:

```bash
kafka-console-consumer --topic test-topic --from-beginning --bootstrap-server localhost:9092
```
