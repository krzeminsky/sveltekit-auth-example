export enum AuthError {
    None,
    Unknown,
    EmailInUse,
    CredentialsMismatch,
    WrongCode,
    CodeExpired,
    RateLimitReached
}