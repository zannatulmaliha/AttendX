class IEmail {
    /**
     * Send a verification email
     * @param {string} to - The recipient email address
     * @param {string} token - The verification token
     */
    async sendVerificationEmail(to, token) {
        // Log to console for clean mocked implementation
        const verificationLink = `http://localhost:5173/verify-email/${token}`;
        console.log('\n=============================================');
        console.log(`[EMAIL SERVICE MOCK]`);
        console.log(`To: ${to}`);
        console.log(`Subject: Verify Your AttendX Account`);
        console.log(`Body:`);
        console.log(`Welcome to AttendX! Please verify your email by clicking the link below:`);
        console.log(verificationLink);
        console.log('=============================================\n');
        
        return Promise.resolve(true);
    }
}

module.exports = new IEmail();
