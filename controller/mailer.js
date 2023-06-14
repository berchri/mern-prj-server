const nodemailer = require( 'nodemailer' );

const transporter = nodemailer.createTransport( {
    // mail.live.com
    // host: "smtp-mail.outlook.com",
    // office365
    host: 'smtp.office365.com',
    secureConnection: false,
    port: 587,
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: process.env.DUE_RVTTOOLS_LOGINSERVICE_ADDRESS,
        pass: process.env.DUE_RVTTOOLS_LOGINSERVICE_PW
    }
} )


module.exports = transporter