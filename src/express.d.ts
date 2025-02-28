declare global {
  namespace Express {
    interface Request {
      client?: {
        apiKey: string;
      };
    }
  }
}
