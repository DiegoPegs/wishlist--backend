export interface IEmailService {
  sendGuardianInvitation(
    recipientIdentifier: string,
    _token: string,
  ): Promise<void>;
}
