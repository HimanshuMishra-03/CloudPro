export type DataType =
  | 'health_metric'
  | 'chaos_result'
  | 'config_snapshot'
  | 'custom';

export interface WriteRequest {
  app_id:    string;
  data_type: DataType;
  payload:   Record<string, unknown>; // max 256KB serialized
}

export interface WriteResponse {
  record_id:         string;          // UUID
  app_id:            string;
  data_type:         DataType;
  vault_key_version: number;
  write_latency_ms:  number;
  written_at:        string;           // ISO 8601
}

export interface ReadResponse {
  record_id:         string;
  app_id:            string;
  data_type:         DataType;
  payload:           Record<string, unknown>; // decrypted
  vault_key_version: number;
  written_at:        string;
}

export interface VaultEncryptResponse {
  data: {
    ciphertext:   string;  // 'vault:v1:...'
    key_version:  number;
  };
}

export interface VaultDecryptResponse {
  data: {
    plaintext: string;     // base64-encoded original
  };
}

export interface DataWriteKafkaEvent {
  event_type:        'DATA_WRITTEN' | 'DATA_WRITE_FAILED';
  schema_version:    string;
  app_id:            string;
  data_type:         DataType;
  record_id:         string | null;
  vault_key_version: number | null;
  write_latency_ms:  number;
  error_code:        string | null;
  timestamp:         number;           // epoch ms
}
