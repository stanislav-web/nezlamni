export interface HttpExceptionResponse {
  message: string;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  code?: any;
  headers?: object;
  message: any;
  method?: string;
  path?: string;
  stack?: any;
  status: number;
  timestamp?: Date;
}
