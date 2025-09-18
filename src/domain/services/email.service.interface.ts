export interface IEmailService {
  sendInvitationEmail(
    _recipientEmail: string,
    _inviterName: string,
    _dependentName: string,
    _token: string,
  ): Promise<boolean>;
}
