const mongoose = require('mongoose')

const Schema = mongoose.Schema

const downloadSchema = new Schema({
    dlink: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

module.exports = mongoose.model('DownloadFiles', downloadSchema)

// const Sequelize = require('sequelize')
// const sequelize = require('../util/database')

// const DownloadFiles = sequelize.define('url', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
         
//     },
//     dlink: Sequelize.STRING

// })

// module.exports = DownloadFiles