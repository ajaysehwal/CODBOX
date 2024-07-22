export interface SubmissionResult {
  source_code: string;
  language_id: number;
  compiler_options?: string;
  command_line_arguments?: string;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit: number;
  cpu_extra_time: number;
  wall_time_limit: number;
  memory_limit: number;
  stack_limit?: number;
  max_processes_and_or_threads?: number;
  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
  max_file_size?: number;
  redirect_stderr_to_stdout?: boolean;
  enable_network?: boolean;
  number_of_runs?: number;
  additional_files?: string;
  callback_url?: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  exit_code?: number;
  exit_signal?: number;
  status?: any;
  created_at?: Date;
  finished_at?: Date | null;
  token?: string;
  time?: number;
  wall_time?: number;
  memory?: any;
}

export interface IDataStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  sadd(key: string, member: string): Promise<void>;
  srem(key: string, member: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
}

export interface User {
  uid: string;
  name: string;
  [key: string]: any;
}

export interface Group {
  id: string;
  members: string[];
  sourceCode: string;
  createdAt: string;
  membersInfo: User[];
}

export interface Message {
  id: string;
  name: string;
  text: string;
  uuid: string;
  timestamp: Date;
  avatar: string;
  email: string;
}


export interface CodeChange {
  delta: string;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
}