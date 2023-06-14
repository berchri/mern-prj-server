const res = require( 'express/lib/response' )
// const model = require( '../model/m-app.js' )
const fs = require( 'fs' )
const { Layer, LayerGroup, Room, RoomTopology } = require( '../model/m-app.js' )
const { User } = require( '../model/m-user.js' )
const mongoose = require( 'mongoose' )
const session = require( 'express-session' );



const sendDefaultTreeData = async ( req, res ) => {
    try {
        const data = await fs.promises.readFile( '../data/tree.json' )
        res.send( { status: 'OK', data: data } )
    } catch ( e ) {
        console.log( 'something went wrong... ', e )
    }
    res.send( { status: 'error', message: 'Loading Room Topology failed.' } )
}

const saveTreeData = async ( req, res ) => {
    try {
        const user = await User.findById( req.user.id )
        const now = new Date()
        const roomTopology = await RoomTopology.create( {
            name: req.body.name,
            _author: user._id,
            lastUpdate: now,
            // structure: Buffer.from( JSON.stringify( { data: req.body.treeData } ) )
            structure: { data: req.body.treeData }
        } )
        console.log( 'new Tree data: ', roomTopology )
        res.send( { status: 'OK', redirect: '/auth/room', treeData: roomTopology } )
        return
    } catch ( e ) {
        console.log( 'something went wrong... ', e )
    }
    res.send( { status: 'error', message: 'Loading Room Topology failed.' } )
}

const loadTreeData = async ( req, res ) => {
    try {
        const rT = await RoomTopology.findById( req.body.id )
        // let json = JSON.parse( rT.roomsStructure.toString() )

        return res.send( { status: 'OK', data: rT.structure.data } )
    } catch ( e ) {
        console.log( 'error at getting List' )
    }
    res.send( { status: 'error', message: 'Loading List of Room Topology failed.' } )
}

const getListTreeData = async ( req, res ) => {
    try {
        const roomTopologies = await RoomTopology.find( { user: req.user.id } )
        console.log( roomTopologies )
        const list = roomTopologies.map( e => { return { name: e.name, date: e.lastUpdate, id: e._id } } )



        return res.send( { status: 'OK', data: list } )
    } catch ( e ) {
        console.log( 'error at getting List' )
    }
    res.send( { status: 'error', message: 'Loading List of Room Topology failed.' } )
}


module.exports = { sendDefaultTreeData, loadTreeData, saveTreeData, getListTreeData }