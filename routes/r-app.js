const path = require( 'path' )
const express = require( 'express' )
const r = express.Router()
const session = require( 'express-session' );
const appController = require( '../controller/c-app.js' )
const passport = require( 'passport' );
const { redirect } = require( 'express/lib/response' );

const checkAuth = ( req, res, next ) => {
    if ( req.user ) {
        // console.log( 'checkAuth: ', req.user )
        next()
    } else {
        res.send( { status: 'Error' } )
    }
}

// Authentication for all Routes in /auth*
r.use( checkAuth )

// User starts App or got redirected from MS Login
r.post( '/start',
    ( req, res ) => { res.send( { status: 'OK', redirect: '/auth' } ) }
)

// List of saved RoomTopologies
r.post( '/room/tree/list', appController.getListTreeData )

// Load a specific Structure
r.post( '/room/tree/load', appController.loadTreeData )

// Save new Structure
r.post( '/room/tree/save', appController.saveTreeData )



module.exports = r