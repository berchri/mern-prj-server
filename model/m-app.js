const mongoose = require( 'mongoose' )
const Schema = mongoose.Schema
// const bcryptjs = require( 'bcryptjs' )
// const crypto = require( 'crypto' )
const { User } = require( './m-user' )

const LayerSchema = new Schema( {
    name: String,
    id: String,
    thickness: Number,
    orientation: [ 'horizontal', 'vertical' ],
    height: Number,
    TLK_Key: String,
    TLK_Name: String
} )

const LayerGroupSchema = new Schema( {
    name: String,
    layer: [ LayerSchema ]
} )

const RoomSchema = new Schema( {
    name: String,
    lateralSurface: LayerGroupSchema,
    bottomSurface: [ LayerGroupSchema ],
    ceilingSurface: [ LayerGroupSchema ]
} )


RoomSchema.methods.createUniqueLink = ( length = 5 ) => {

    // Random Hex
    const genRanHex = length => [ ...Array( length ) ].map( () => Math.floor( Math.random() * 16 ).toString( 16 ) ).join( '' )

    // Random Hex mit Node.js
    const randomString = crypto.randomBytes( 8 ).toString( 'hex' )

}


const RoomTopologySchema = new Schema( {
    name: {
        type: String,
        required: true
    },
    _author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdate: Date,
    structure: {
        type: Object
    }
}, { autoIndex: false } )
// roomsSetup: [ RoomSchema ]

const Layer = mongoose.model( 'layer', LayerSchema )
const LayerGroup = mongoose.model( 'layerGroup', LayerGroupSchema )
const Room = mongoose.model( 'room', RoomSchema )
const RoomTopology = mongoose.model( 'roomTopology', RoomTopologySchema )

module.exports = { Layer, LayerGroup, Room, RoomTopology }