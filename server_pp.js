const os = require( 'os' )
const crypto = require( 'crypto' )
const path = require( 'path' )
const express = require( 'express' )
const hbs = require( 'express-handlebars' )
const session = require( 'express-session' )

const mongoose = require( 'mongoose' )
// const MongoStore = require( 'connect-mongo' )

const passport = require( 'passport' )
const MicrosoftStrategy = require( 'passport-microsoft' ).Strategy
const LocalStrategy = require( 'passport-local' )

/*
************
* Passport *
************
*/
passport.serializeUser( ( user, done ) => { done( null, user ) } )
passport.deserializeUser( ( user, done ) => { done( null, user ) } )

const userController = require( './controller/c-user.js' )

passport.use( new LocalStrategy( async ( username, password, done ) => {
    const authCheck = await userController.authenticationCheck( username, password )
    if ( authCheck ) {
        console.log( 'found' )
        done( null, {
            username: authCheck.username,
            id: authCheck._id,
            firstname: authCheck.firstname,
            lastname: authCheck.lastname
        } )
    } else {
        done( null )
    }
} ) )


passport.use( new MicrosoftStrategy( {
    clientID: process.env.DUE_RVTTOOLS_MS_APPLICATION_ID,
    clientSecret: process.env.DUE_RVTTOOLS_MS_CLIENT_SECRET,
    tenant: process.env.DUE_RVTTOOLS_MS_TENANT,
    // authority: process.env.DUE_RVTTOOLS_MS_TENANT_ID,
    callbackURL: `http://localhost:5010/ms/auth/callback`, // todo: use variable
    scope: [ 'user.read' ]
},
    function ( accessToken, refreshToken, profile, done ) {
        process.nextTick( function () {
            // console.log( accessToken )
            // console.log( refreshToken )
            console.log( profile )
            return done( null, profile );
        } );
    }
) );


/*
******************
* Express Server *
******************
*/
const app = express()
const PORT = process.env.PORT || 5010
app.listen( PORT, () => {
    console.log( `Server running.
Interner Port:${PORT}
URL: http://${os.hostname}:${PORT}` )
} )

app.engine( 'handlebars', hbs.engine );
app.set( 'view engine', 'handlebars' );

app.use( session( {
    secret: ( () => crypto.randomUUID() )(),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
    },
    passwordResetToken: '',
    userId: ''
} ) )

app.use( passport.initialize() )
app.use( passport.session() )

app.use( express.json() )
app.use( express.urlencoded( { extended: false } ) )

/*
* Routes
*/
const routesUser = require( './routes/r-user.js' )
const routesApp = require( './routes/r-app.js' )
const routesMS = require( './routes/r-ms.js' )
app.use( '/user', routesUser )
app.use( '/auth', routesApp )
app.use( '/ms', routesMS );


app.get( '/', ( req, res ) => {
    res.redirect( '/user' )
} )

app.use( express.static( './view/html' ) )
// app.use( express.static( '../mern-prj-client/build' ) )


/*
************
* Database *
************
*/
mongoose.connect( process.env.DUE_RVTTOOLS_MONGO_URI )
    .then( async () => {
        console.log( 'Database connected' )
    } ).catch( () => {
        console.log( 'Database Connection Error' )
    } )




