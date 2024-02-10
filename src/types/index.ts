type ErrorFormat = {
  message: string;
  field: string;
  location: string;
  stack: string | null;
};

type LoggerErrorMetadata = {
  id: string;
  errors?: ErrorFormat[];
  stack: string;
  statusCode: number;
  path: string;
  method: string;
};

export { ErrorFormat, LoggerErrorMetadata };
