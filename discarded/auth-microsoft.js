/*
*  Microsoft Authentication
*/

const msal = require( '@azure/msal-node' )

const config = {
    auth: {
        clientId: process.env.APPLICATION_ID,
        authority: process.env.TENANT_ID,
        clientSecret: process.env.CLIENT_SECRET
        // clientId: "Enter_the_Application_Id",
        // authority: "Enter_the_Cloud_Instance_Id_Here/Enter_the_Tenant_Id_here",
        // clientSecret: "Enter_the_Client_secret"
    },
    system: {
        loggerOptions: {
            loggerCallback( loglevel, message, containsPii ) {
                console.log( message );
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        }
    }
};


// Create msal application object
const cca = new msal.ConfidentialClientApplication( config );

app.get( '/', ( req, res ) => {
    const authCodeUrlParameters = {
        scopes: [ "user.read" ],
        redirectUri: "http://localhost:5010/auth-response",
    };

    // get url to sign user in and consent to scopes needed for application
    cca.getAuthCodeUrl( authCodeUrlParameters ).then( ( response ) => {
        res.redirect( response );
    } ).catch( ( error ) => console.log( JSON.stringify( error ) ) );
} );

app.get( '/auth-response', ( req, res ) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: [ "user.read" ],
        redirectUri: "http://localhost:5010/auth-response",
    };

    cca.acquireTokenByCode( tokenRequest ).then( ( response ) => {
        console.log( "\nResponse: \n:", response );
        res.sendStatus( 200 );
    } ).catch( ( error ) => {
        console.log( error );
        res.status( 500 ).send( error );
    } );
} );