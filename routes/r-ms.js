const os = require( 'os' )
const express = require( 'express' )
const r = express.Router()
const session = require( 'express-session' );
const passport = require( 'passport' )
const userController = require( '../controller/c-user.js' )

const PORT = process.env.PORT || 5010
let redirect = `http://${os.hostname}:${PORT}`

if ( process.env.NODE_ENV === 'development' ) {
    redirect = 'http://localhost:3000'
}


r.use( '/', passport.authenticate( 'microsoft', {
    prompt: 'select_account'
} ) )

r.get( '/auth/callback',
    userController.checkMsUserExists,
    ( req, res ) => res.redirect( redirect )
)



module.exports = r