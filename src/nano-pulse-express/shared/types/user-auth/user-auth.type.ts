export namespace UserAuth {
  export type UserAuthEvent = {
    eventType: string;
    timestamp: number;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
