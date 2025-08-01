const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Turf Booking System</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Turf Booking System!</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for signing up with our Turf Booking System. We're excited to have you on board!</p>
            <p>You can now:</p>
            <ul>
                <li>Browse available turfs in your city</li>
                <li>Book turfs for your favorite sports</li>
                <li>Manage your bookings</li>
                <li>Update your profile</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Turf Booking Team</p>
        </div>
    </div>
</body>
</html>
`;

const loginEmailTemplate = (userName, loginTime) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Login Notification - Turf Booking System</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Login Notification</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We detected a new login to your Turf Booking System account.</p>
            <div class="alert">
                <strong>Login Details:</strong><br>
                Time: ${loginTime}<br>
                If this wasn't you, please contact support immediately.
            </div>
            <p>If this was you, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Turf Booking Team</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    welcomeEmailTemplate,
    loginEmailTemplate
}; 