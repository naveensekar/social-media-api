const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')

router.post('/login', async (req, res) => {

    const user = await User.findOne({ email: req.body.email })
        .select('-createdAt -updatedAt -__v -userid')

    if (user) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if(result) {
                const token = user.generateToken()
                res
                    .header('x-auth-token', token)
                    .send({ token, ...user._doc, password: null })
                return
            }
        })
    }
    else {
        res.status(400).send('Incorrect username or password')
    }

})

router.post('/register', async (req, res) => {

    const {username, email, password} = req.body

    bcrypt.hash(password, 10, (err, hash) => {
        if(err) return res.status(500).send(err)

        User.create({
            username,
            email,
            password: hash
        })
        .then(user => {
            const token = user.generateToken()
            res.header('x-auth-token', token).status(201).send({token, ...user._doc, password: null})
        })
        .catch(err => res.status(400).send(err.message))
    })
    
})

module.exports = router
