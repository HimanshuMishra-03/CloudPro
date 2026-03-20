import { Kafka } from "kafkajs";
import { DataWriteKafkaEvent } from "@/types/data-write";

const KAFKA_BROKERS = [process.env.KAFKA_BOOTSTRAP || "localhost:9092"];

export interface AuditLogEvent {
  event_type: "APP_REGISTERED" | "REGISTRATION_FAILED";
  schema_version: "1.0";
  timestamp: number;
  actor: string;
  app_id: string;
  spiffe_id: string;
  vault_key_name: string;
  detected_stack: string;
  result: "SUCCESS" | "DENIED";
  reason_code?: string | null;
  platform_version: "1.0.0";
}

export async function emitAuditEvent(event: AuditLogEvent) {
  console.log(`[Kafka] Emitting ${event.event_type} for ${event.app_id}`);

  try {
    const kafka = new Kafka({
      clientId: "cloudsentinel-api",
      brokers: KAFKA_BROKERS,
      connectionTimeout: 1000, // Short timeout for local dev
    });

    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: "audit-log",
      messages: [{ value: JSON.stringify(event), key: event.app_id }],
    });
    await producer.disconnect();
    console.log("[Kafka] Event successfully published.");
  } catch (error) {
    console.warn("[Kafka] Skip: Service unreachable (local development mode).");
    // Silent fallback: just log to console and allow the app to continue.
  }
}

export async function emitDataWriteEvent(event: DataWriteKafkaEvent) {
  console.log(`[Kafka] Emitting ${event.event_type} for app: ${event.app_id}`);

  try {
    const kafka = new Kafka({
      clientId: "cloudsentinel-api",
      brokers: KAFKA_BROKERS,
      connectionTimeout: 1000,
    });

    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: "data-writes",
      messages: [{ value: JSON.stringify(event), key: event.app_id }],
    });
    await producer.disconnect();
    console.log("[Kafka] Data write event published.");
  } catch (error) {
    console.warn("[Kafka] Skip: Service unreachable (local development mode).");
  }
}
