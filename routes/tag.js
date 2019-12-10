const express = require('express')
const router = express.Router()

const Tag = require('../models/Tag')

//list
router.get('/', (req, res) => {
    Tag.find().select('-createdAt -updatedAt -__v')
        .then((tags) => {
            res.json(tags)
        })

})
//new entry
router.post('/', (req, res) => {
    const data = req.body
    const tag = new Tag(data)
    tag.save()
        .then((tag) => {
            res.json(tag)
        })
        .catch(err => {
            res.json(err)
        })
})
//show
router.get('/:id', (req, res) => {
    const id = req.params.id
    Tag.findById(id)
        .then((tag) => {
            res.json(tag)
        })
})
//update 
router.put('/:id', (req, res) => {
    const id = req.params.id
    const body = req.body
    Tag.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
        .then((tag) => {
            if (tag) {
                res.json({ tag })
            } else {
                res.json(tag)
            }
        })
})
//delete
router.delete('/:id', (req, res) => {
    const id = req.params.id
    Tag.findByIdAndDelete(id)
        .then(tag => {
            if (tag) {
                res.json(tag)
            } else {
                res.status('404').json({})
            }
        })
})

module.exports = router