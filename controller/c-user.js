const view = require( '../view/v-user.js' )
const bcryptjs = require( 'bcryptjs' )
const crypto = require( 'crypto' )
const model = require( '../model/m-user.js' )
const User = model.User
const transporter = require( './mailer' )

/**
 * Render function sends back a requested html file
 * e.g. /start?param=something => sends back start.html (params are ignored)
 * @param {Object} req Request e.g. /start?optparam=ignored
 * @param {Object} res Response html
 */
const render = async ( req, res ) => {
    let parts = req.url.split( '?' )
    let html = await view.loadHTML( parts[ 0 ] )
    res.send( html )
}

/**
 * Used for registration of a User
 * @param {Object} req Userobject URLencoded in Body
 * @param {Object} res redirect or Error
 */
const register = ( req, res, next ) => {
    console.log( req.body )
    User.create( {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password
    } )
        .then( ( u ) => {
            console.log( 'New User: ', u )
            try {
                sendEmailLink( 'confirm', u._id, u.username, u.accessToken, req.apiURL )
            }
            catch ( err ) {
                return res.send( { status: 'error', message: 'something went wrong...' } )
            }
            return next()
        } )
        .catch( ( e ) => {
            console.log( 'Registration failed.', e )
            res.send( { status: 'error', message: 'something went wrong...' } )
        } )
}

/**
 * Creates a Link to confirm the Email adress and sends it to the User.
 * @param {String} type Which kind of Email?
 * @param {Object} id _id of the User
 * @param {String} address Email Address
 * @param {String} key An Access Token. (UID)
 */
const sendEmailLink = ( type, id, address, key, apiURL ) => {
    const params = new URLSearchParams( {
        id: id,
        key: key
    } )
    let link = `${apiURL}/user/${type}?${params.toString()}`

    const mail = new view.Email( address, type, { link: link } )
    console.log( 'mail', mail )

    transporter.sendMail( mail, ( err, info ) => {
        if ( err ) {
            return new Error( err.message );
        }
        console.log( 'Message sent: ' + info.response );
    } )
}

const receiveEmailConfirmation = async ( req, res, next ) => {
    try {
        const user = await User.findById( req.query.id )
        console.log( 'User account active: ', user )
        if ( !user.active ) {
            if ( user.accessToken === req.query.key ) {
                user.active = true
                user.accessToken = 'expired'
                await user.save()
                return next()
            }
        }
        if ( user ) return next()
    } catch ( e ) {
        console.log( 'something went wrong... ', e )
    }
    res.send( { status: 'error', message: 'something went wrong...' } )
}

/**
 * Used by Passport to check Authentication
 * Returns User if found.
 * @param {String} username
 * @param {String} password
 * @returns User || Null
 */
const authenticationCheck = ( username, password ) => {
    return new Promise( ( resolve, reject ) => {
        User.findOne( { username: username } )
            .then( async ( user ) => {
                console.log( user )
                if ( !user.active ) resolve( null )
                let result = await bcryptjs.compare( password, user.password )
                console.log( 'result', result )
                resolve( user )
            } )
            .catch( ( e ) => {
                resolve( null )
            } )
    } )
}

const getUserPasswordReset = async ( req, res, next ) => {
    try {
        const user = await User.findOne( { username: req.body.username } )

        if ( !user.active ) throw new Error( 'Confirm E-Mail Address first.' )
        user.createPasswordResetToken()
        await user.save()
        sendEmailLink( 'reset', user._id, user.username, user.passwordResetToken, req.apiURL )

        return next()
    } catch ( e ) {
        console.log( 'something went wrong... ', e )
    }
    res.send( { status: 'error', message: 'Getting User and sendig Email Link failed' } )
}

// Check user Information sent from reset Link.
const checkUserPasswordReset = async ( req, res, next ) => {
    try {
        console.log( 'Reset Link clicked: ', req.query )
        const user = await User.findById( req.query.id )

        if ( !user.active ) throw new Error( 'Cornfirm E-Mail Address first.' )
        const now = new Date()
        console.log( 'token expiration > now: ', ( user.passwordResetTokenExpiration > now ) )
        if ( user.passwordResetToken === req.query.key && user.passwordResetTokenExpiration > now ) {
            // user.passwordReset = true
            // await user.save()
            req.passwordResetToken = user.passwordResetToken
            req.userId = user._id
            return next()
        }
    } catch ( e ) {
        console.log( 'error: ', e.message )
    }
    res.send( { status: 'error', message: 'Request an new Reset Link.' } )
}

const getChangePasswordReset = async ( req, res, next ) => {
    try {
        const user = await User.findById( req.userId )
        console.log( 'User set a new password: ', user )
        if ( !user.active ) throw new Error( 'Cornfirm E-Mail Address first.' )

        const now = new Date()
        if ( user.passwordResetToken === req.passwordResetToken && user.passwordResetTokenExpiration > now ) {
            user.password = req.body.password
            user.passwordResetTokenExpiration = now
            await user.save()
            return next()
        }
    } catch ( e ) {
        console.log( 'error: ', e.message )
    }
    res.send( { status: 'error', message: 'Request an new Reset Link.' } )
}

const checkUserExists = async ( req, res, next ) => {
    try {
        const user = await User.findOne( { username: req.body.username } )
        if ( user === null ) {
            return next()
        }
    } catch ( e ) {
        console.log( 'something went wrong... ', e )
    }
    res.send( { status: 'error', message: 'User already exists.' } )
}

const checkMsUserExists = async ( req, res, next ) => {
    try {
        const user = await User.findOne( { msid: req.user.id } )

        if ( user ) {
            user.username = req.user._json.mail
            user.firstname = req.user.name.givenName
            user.lastname = req.user.name.familyName
            await user.save()
            return next()
        }

        if ( user === null ) {
            const newUser = await User.create( {
                msid: req.user.id,
                username: req.user._json.mail,
                firstname: req.user.name.givenName,
                lastname: req.user.name.familyName,
                active: true,
                password: crypto.randomUUID()
            } )
            console.log( 'new MS User: ', newUser )
            return next()
        }

    } catch ( e ) {
        console.log( 'something went wrong... ', e )
    }
    res.send( { status: 'error', message: 'User already exists.' } )
}

module.exports = {
    authenticationCheck,
    register,
    receiveEmailConfirmation,
    getUserPasswordReset,
    checkUserPasswordReset,
    getChangePasswordReset,
    render,
    checkUserExists,
    checkMsUserExists
}