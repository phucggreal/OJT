const verifyEmailTemplate = (username, otp) => `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
      <div style="background:#4f46e5; padding:15px 20px; text-align:center;">
        <h1 style="color:#fff; margin:0;">PhucGG</h1>
      </div>
      <div style="padding:30px;">
        <h2 style="color:#333;">Hello ${username},</h2>
        <p style="color:#555; font-size:15px; line-height:1.6;">
          Thank you for registering. Please use the following verification code:
        </p>
        <div style="text-align:center; margin:30px 0;">
          <div style="display:inline-block; padding:15px 25px; background:#4f46e5; color:#fff; font-size:20px; letter-spacing:3px; border-radius:8px; font-weight:bold;">
            ${otp}
          </div>
        </div>
        <p style="color:#999; font-size:13px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>
    </div>
  </div>
`;

const resendOTPTemplate = (username, otp) => `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
      <div style="background:#4f46e5; padding:15px 20px; text-align:center;">
        <h1 style="color:#fff; margin:0;">PhucGG</h1>
      </div>
      <div style="padding:30px;">
        <h2 style="color:#333;">Hello ${username},</h2>
        <p style="color:#555; font-size:15px; line-height:1.6;">
          You requested a new OTP. Please use the following code:
        </p>
        <div style="text-align:center; margin:30px 0;">
          <div style="display:inline-block; padding:15px 25px; background:#4f46e5; color:#fff; font-size:20px; letter-spacing:3px; border-radius:8px; font-weight:bold;">
            ${otp}
          </div>
        </div>
        <p style="color:#999; font-size:13px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>
    </div>
  </div>
`;

const resetPasswordTemplate = (username, otp) => `
  <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
      <div style="background:#4f46e5; padding:15px 20px; text-align:center;">
        <h1 style="color:#fff; margin:0;">PhucGG</h1>
      </div>
      <div style="padding:30px;">
        <h2 style="color:#333;">Hello ${username},</h2>
        <p style="color:#555; font-size:15px; line-height:1.6;">
          You requested a password reset. Please use the following code to continue:
        </p>
        <div style="text-align:center; margin:30px 0;">
          <div style="display:inline-block; padding:15px 25px; background:#ef4444; color:#fff; font-size:20px; letter-spacing:3px; border-radius:8px; font-weight:bold;">
            ${otp}
          </div>
        </div>
        <p style="color:#999; font-size:13px;">
          This code will expire in <strong>10 minutes</strong>. If you didn’t request a password reset, please ignore this email.
        </p>
      </div>
    </div>
  </div>
`;

export {
  verifyEmailTemplate,
  resendOTPTemplate,
  resetPasswordTemplate
};
