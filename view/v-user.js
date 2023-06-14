const path = require( 'path' )
const fs = require( 'fs' )
const model = require( '../model/m-user.js' )
const hbs = require( 'express-handlebars' )

/**
 * Loads and returns a requested html file
 * e.g.: /start => start.html
 * @param {String} name  e.g.: /start => start.html
 */
const loadHTML = async ( name ) => {
    let file = name.replace( '/', '' ) + '.html'
    let html = await fs.promises.readFile( path.resolve( 'view', 'public', file ) )
    return html.toString();
}

//Todo Email Objekt
/**
 * Creates an returns an Email Object
 * @param {String} receiver  Email Adress
 * @param {String} type  Type of Message Text (Template) to use.
 * @param {Object} context  Variables for the Message Template.
 */
class Email {
    constructor( receiver, type, context ) {
        this.from = process.env.LOGINSERVICE_ADDRESS
        this.to = receiver
        this.subject = ''
        this.html = ''

        switch ( type ) {
            case 'login':
                this.subject = 'Your login link'
                this.html = `<h1>Login</h1><p>Please Enter the following Key:</p><p>${context.key}</p><p>or click on this <a href="${context.link}">LINK</a></p>`;
                break
            case 'confirm':
                this.subject = 'Confirm your Email adress'
                this.html = `<h1>Confirm Email Adress</h1><p>Please click on the following link:</p><a href="${context.link}">LINK</a></p>`;
                break
            case 'reset':
                this.subject = 'Reset your password'
                this.html = `<h1>Reset your Password</h1><p>Please click on the following link:</p><a href="${context.link}">LINK</a></p>`;
                break
            // case 'password':
            //     return hbs.render( './email/forgot-pw.html', context )
            //     break
        }
    }
}


// const sendMail = ( message ) => {
//     transporter.sendMail( message, ( err, info ) => {
//         if ( err ) {
//             return console.log( err.message );
//         }

//         console.log( 'Message sent: ' + info.response );
//     } )
// }

module.exports = { loadHTML, Email }
