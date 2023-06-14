const os = require( 'os' )
const path = require( 'path' )
const express = require( 'express' )
const session = require( 'express-session' )
const r = express.Router()
const userController = require( '../controller/c-user.js' )
const passport = require( 'passport' )
const req = require( 'express/lib/request' )

if ( !process.env.NODE_ENV ) console.error( "Error: Please set Environment status. NODE_ENV ='development||production'" )

const PORT = process.env.PORT || 5010
let apiURL = `http://${os.hostname}:${PORT}`
let reactURL = apiURL

if ( process.env.NODE_ENV === 'development' ) {
    apiURL = 'http://localhost:5010'
    reactURL = 'http://localhost:3000'
}


// User clicked on Passwort Reset Link in Email. => Reset Token is set in session.
r.get( '/reset',
    userController.checkUserPasswordReset,
    setCookieInfoPasswordReset,
    ( req, res ) => { res.redirect( reactURL + '/user/reset' ) }
)

// User clicked logout
r.get( '/logout', logoutUser, ( req, res ) => { res.send( { status: 'OK', redirect: '/user/login' } ) } )

// User clicked Email Confirmation Link in Email
r.get( '/confirm',
    userController.receiveEmailConfirmation,
    ( req, res ) => { res.redirect( reactURL + '/user/login' ) }
)

// User sends registration Data.
r.post( '/register',
    ( req, res, next ) => {
        req.apiURL = apiURL
        return next()
    },
    userController.register,
    ( req, res ) => { res.send( { status: 'OK', redirect: '/user/await-confirmation' } ) }
)

// User sends login data.
r.post( '/login',
    loginUser,
    ( req, res ) => {
        let status = { status: 'error', message: 'Ungültige Login Daten' }
        if ( req.user ) status = { status: 'OK', redirect: '/auth' }
        res.send( status )
    }
)

// User sends Username from /forgot-password
r.post( '/forgot-password',
    ( req, res, next ) => {
        req.apiURL = apiURL
        return next()
    },
    userController.getUserPasswordReset,
    ( req, res ) => { res.send( { status: 'OK', redirect: '/user/await-reset-link' } ) }
)

// User sends a new password
r.post( '/reset-password',
    getCookieInfoPasswordReset,
    userController.getChangePasswordReset,
    ( req, res ) => { res.send( { status: 'OK', redirect: '/user/login' } ) }
)

// User entered an email in registration process.
r.post( '/available-username',
    userController.checkUserExists,
    ( req, res ) => { res.send( { status: 'OK' } ) }
)


r.use( '/js', express.static( path.resolve( '..', 'view/js' ) ) ) //__dirname

r.use( '/vendor', express.static( path.resolve( '..', 'node-modules/bootstrap/dist' ) ) )


function loginUser( req, res, next ) {
    passport.authenticate( 'local', ( err, user, info ) => {
        console.log( 'user: ', user )
        req.login( user, ( err ) => {
            if ( err ) {
                console.log( 'error: Invalid Authentication' )
            }
        } )
        return next()
    } )( req, res )
}

function logoutUser( req, res, next ) {
    console.log( 'req', req.session )
    req.logout()
    req.session.regenerate(
        () => {
            console.log( 'destroy: ', req.session )
            return next()
        }
    )
}

function setCookieInfoPasswordReset( req, res, next ) {
    req.session.passwordResetToken = req.passwordResetToken
    req.session.userId = req.userId
    return next()
}
function getCookieInfoPasswordReset( req, res, next ) {
    req.passwordResetToken = req.session.passwordResetToken
    req.userId = req.session.userId
    return next()
}


module.exports = r