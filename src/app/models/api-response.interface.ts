export interface IApiResponse<T> {
  codresp: number;
  mensaje: string;
  status: boolean;
  datos: T | null;
}
