const mongoose = require( 'mongoose' )
const Schema = mongoose.Schema
const bcryptjs = require( 'bcryptjs' )
const validator = require( 'validator' )
const crypto = require( 'crypto' )


const UserSchema = new Schema( {
    msid: {
        type: String,
    },
    firstname: {
        type: String,
        required: true,
        maxlength: [ 20, 'too many characters' ]
    },
    lastname: {
        type: String,
        required: true,
        maxlength: [ 20, 'too many characters' ]
    },
    username: {
        type: String,
        lowercase: true,
        required: true,
        // unique: true
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    password: {
        type: String,
        // required: true
    },
    passwordReset: {
        type: Boolean,
        required: true,
        default: false
    },
    accessToken: {
        type: String,
        default: crypto.randomUUID(),
    },
    passwordResetToken: String,
    passwordResetTokenExpiration: Date,
    loginToken: Number,
    loginTokenExpiration: Date,
    signupDate: {
        type: Date,
        default: new Date()
    },
    treeData: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RoomTopology'
        }
    ]
} )

// function getRandomUId() {
//     return crypto.randomUUID()
// }

// function getRandomInt() {
//     return crypto.randomInt( 100000, 999999 )
// }

UserSchema.methods.createPasswordResetToken = function ( min = 10 ) {
    let d = new Date()
    this.passwordResetTokenExpiration = d.setMinutes( d.getMinutes() + min )
    this.passwordResetToken = crypto.randomUUID()
    return this.passwordResetToken
}

UserSchema.methods.createLoginToken = function ( min = 5 ) {
    let d = new Date()
    this.loginTokenExpiration = d.setMinutes( d.getMinutes() + min )
    this.loginToken = crypto.randomInt( 100000, 999999 )
    return this.loginToken
}

// UserSchema.virtual( 'password' )
//     .get( function () {
//         return this.password
//     } )
//     .set( function ( value ) {
//         this.password = value
//     } )

// UserSchema.path( 'emailconfirmkey' ).validate( function () {
//     this.emailconfirmkey = 1
// } )


UserSchema.path( 'username' ).validate( function ( value ) {
    if ( !validator.isEmail( value ) ) {
        this.invalidate( 'username', 'not a valid E-Mail' );
    }
} )


UserSchema.path( 'password' ).validate( function ( pw ) {
    if ( pw === 'Passwort' ) this.invalidate( 'password', 'password not allowed' )
} )



UserSchema.pre( 'save', async function ( next ) {
    const user = this
    if ( user.isNew || user.isModified( 'password' ) ) {
        let salt = await bcryptjs.genSalt( 10 )
        let hash = await bcryptjs.hash( user.password, salt )
        user.password = hash
    }

} )

const User = mongoose.model( 'user', UserSchema )

module.exports = { User, UserSchema }