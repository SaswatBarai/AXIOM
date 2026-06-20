import { Kafka, type Producer, type Consumer, Partitioners } from "kafkajs";
import { logger } from "../utils/logger";

const kafka = new Kafka({
  clientId: "axiom-api",
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
});

class KafkaService {
  private producer: Producer;

  constructor() {
    this.producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    logger.info("Kafka producer connected");
  }

  async publish(topic: string, payload: unknown): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  createConsumer(groupId: string): Consumer {
    return kafka.consumer({ groupId });
  }
}

export const kafkaService = new KafkaService();

// ── Topic constants ──────────────────────────────────────────────────────
export const KafkaTopic = {
  RESUME_PARSE: "resume.parse",
  RESUME_ATS: "resume.ats",
  JOB_MATCH: "job.match",
  NOTIFICATION_EMAIL: "notification.email",
  NOTIFICATION_PUSH: "notification.push",
} as const;
