export interface Environment {
  appVersion: string;
  production: boolean;
  apiUrl: string;
  /** Límite de memoria del visor IFC en GiB (web-ifc MEMORY_LIMIT; máx. efectivo < 4). */
  maxMemoryRender: number;
}
