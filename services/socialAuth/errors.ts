export class SocialAuthCancelledError extends Error {
  constructor(message = "Social authentication was cancelled") {
    super(message);
    this.name = "SocialAuthCancelledError";
  }
}

export class SocialAuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocialAuthConfigError";
  }
}
