interface SignupEmailProps {
  confirmationUrl: string;
  token?: string;
}

export const SignupEmail = ({ confirmationUrl, token }: SignupEmailProps): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f8fafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 40px 0;">
  <div style="background-color: #ffffff; margin: 0 auto; padding: 40px 20px; max-width: 560px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 28px; font-weight: bold; color: #2E9B8D; text-decoration: none;">🐾 PetLinkID</span>
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 16px;">Welcome to PetLinkID!</h1>
    
    <p style="color: #1a1a1a; font-size: 16px; line-height: 24px; margin: 16px 0;">
      Thanks for signing up! Please confirm your email address to get started managing your pet's health records, vaccinations, and more.
    </p>

    <a href="${confirmationUrl}" style="background-color: #2E9B8D; border-radius: 8px; color: #ffffff; display: block; font-size: 16px; font-weight: 600; text-align: center; text-decoration: none; padding: 14px 24px; margin: 24px auto; width: fit-content;">
      Confirm Email Address
    </a>

    <p style="color: #666666; font-size: 14px; line-height: 22px; margin: 16px 0;">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    <p style="color: #2E9B8D; font-size: 14px; word-break: break-all; text-decoration: underline;">
      <a href="${confirmationUrl}" style="color: #2E9B8D; text-decoration: underline;">${confirmationUrl}</a>
    </p>

    ${token ? `
    <p style="color: #666666; font-size: 14px; line-height: 22px; margin: 16px 0;">
      Or use this verification code:
    </p>
    <p style="display: inline-block; padding: 12px 20px; background-color: #f4f4f4; border-radius: 6px; border: 1px solid #e5e5e5; color: #1a1a1a; font-size: 24px; font-weight: 600; letter-spacing: 4px; text-align: center; margin: 16px auto;">${token}</p>
    ` : ''}

    <hr style="border-top: 1px solid #e5e5e5; margin: 32px 0;">

    <p style="color: #888888; font-size: 12px; line-height: 20px; text-align: center; margin: 32px 0 0;">
      If you didn't create an account with PetLinkID, you can safely ignore this email.
      <br><br>
      © ${new Date().getFullYear()} PetLinkID. All rights reserved.
    </p>
  </div>
</body>
</html>
  `;
};
