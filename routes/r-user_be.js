const path = require( 'path' )
const express = require( 'express' )
const session = require( 'express-session' )
const r = express.Router()
const userController = require( '../controller/c-user.js' )
const passport = require( 'passport' )
const req = require( 'express/lib/request' )

/*
* /await-reset-link   show notification to check the Emails 
* /confirm-email      show notification to check the Emails 
* /confirm            used in the Link in the sended Email to confirm the Address
*/

r.get( '/', ( req, res ) => { res.redirect( '/user/login' ) } )
r.get( '/register', userController.render )
r.get( '/login', userController.render )
r.get( '/forgot-password', userController.render )
r.get( '/reset', userController.checkUserPasswordReset, setCookieInfoPasswordReset, userController.render )
r.get( '/await-reset-link', userController.render )
r.get( '/logout', logoutUser, ( req, res ) => { res.redirect( '/user/login' ) } )
r.get( '/confirm-email', userController.render )
r.get( '/confirm', userController.receiveEmailConfirmation, ( req, res ) => { res.redirect( '/user/login' ) } )


r.post( '/register', userController.register, ( req, res ) => { res.redirect( '/user/login' ) } )
r.post( '/login', loginUser, ( req, res ) => { res.redirect( '/auth' ) } )
r.post( '/forgot-password', userController.getUserPasswordReset, ( req, res ) => { res.redirect( '/user/await-reset-link' ) } )
r.post( '/reset-password', getCookieInfoPasswordReset, userController.getChangePasswordReset, ( req, res ) => { res.redirect( '/user/login' ) } )

r.use( '/js', express.static( path.resolve( '..', 'view/js' ) ) ) //__dirname
r.use( '/vendor', express.static( path.resolve( '..', 'node-modules/bootstrap/dist' ) ) )


function loginUser( req, res, next ) {
    console.log( 'body', req.body )
    passport.authenticate( 'local', ( err, user, info ) => {
        req.login( user, ( err ) => {
            // res.send( { status: !err ? 'success' : 'error' } )
            if ( err ) res.send( { status: 'error' } )
            console.log( 'User logged in: ', user )
        } )
        next()
    } )( req, res )
}

function logoutUser( req, res, next ) {
    console.log( 'req', req.session )
    req.logout()
    req.session.regenerate(
        () => {
            console.log( 'destroy: ', req.session )
            next()
        }
    )
    // req.session.destroy(
    // )
}

function setCookieInfoPasswordReset( req, res, next ) {
    req.session.passwordResetToken = req.passwordResetToken
    req.session.userId = req.userId
    console.log( 'here' )
    return next()
}
function getCookieInfoPasswordReset( req, res, next ) {
    req.passwordResetToken = req.session.passwordResetToken
    req.userId = req.session.userId
    return next()
}


module.exports = r