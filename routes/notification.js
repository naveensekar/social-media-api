const router = require('express').Router()
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

router.get('/', auth, (req, res) => {
    Notification.find({ receiver: req.user._id, is_read: false })
        .select('-createdAt -updatedAt -__v')
        .sort('createdAt')
        .then(d => res.send(d))
        .catch(err => res.status(500).send(err))
})

router.put('/:id', auth, async (req, res) => {

    const notf = await Notification.findById(req.params.id)

    if (!notf.receiver.equals(req.user._id)) {
        res.status(403).send('Access denied!')
        return
    }

    notf.is_read = true

    notf.save()
        .then(d => res.send(d))
        .catch(err => res.status(500).send(err))

})

router.get('/read-all', auth, (req, res) => {
    Notification.updateMany(
        {receiver: req.user._id},
        {is_read: true}
    ).then(d => res.send(d))
    .catch(err => res.status(500).send(err))
})

module.exports = router
