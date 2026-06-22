import { Kafka, type Producer, type Consumer, Partitioners } from "kafkajs";
import { logger } from "../utils/logger";

const KAFKA_ENABLED = process.env.KAFKA_ENABLED === "true";

const kafka = KAFKA_ENABLED
  ? new Kafka({
      clientId: "axiom-api",
      brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
    })
  : null;

class KafkaService {
  private producer: Producer | null = null;

  constructor() {
    if (KAFKA_ENABLED && kafka) {
      this.producer = kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
      });
    }
  }

  async connect(): Promise<void> {
    if (!KAFKA_ENABLED || !this.producer) {
      logger.info("Kafka connection skipped (KAFKA_ENABLED is not true)");
      return;
    }
    await this.producer.connect();
    logger.info("Kafka producer connected");
  }

  async publish(topic: string, payload: unknown): Promise<void> {
    if (!KAFKA_ENABLED || !this.producer) {
      logger.info(`Kafka disabled. Skip publish to ${topic}`);
      return;
    }
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }

  async disconnect(): Promise<void> {
    if (!KAFKA_ENABLED || !this.producer) {
      return;
    }
    await this.producer.disconnect();
  }

  createConsumer(groupId: string): Consumer | null {
    if (!KAFKA_ENABLED || !kafka) {
      logger.info("Kafka disabled. Cannot create consumer");
      return null;
    }
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
