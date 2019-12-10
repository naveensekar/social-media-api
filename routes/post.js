const router = require('express').Router()
const auth = require('../middleware/auth')
const Post = require('../models/Post')
const Tag = require('../models/Tag')
const User = require('../models/User')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')
const aws = require('aws-sdk')
const sharp = require('sharp')

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
})

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Math.pow(1024, 2) * 30 }, //max file size is 30mb
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext === '.jpg' || ext === '.png' || ext === '.jpeg' || ext === '.mp4') cb(null, true)
        else cb(Error('Invalid file type'))
    }
}).single('media')

//create post
router.post('/', auth, (req, res) => {
    upload(req, res, async err => {
        if (err) {
            res.status(400).send(err.message)
            return
        }

        let tag
        try {
            tag = await Tag.findOne({ _id: req.body.tag })
        }
        catch (ex) {
            res.status(400).send('Tag ID is not valid!')
            return
        }
        let slug = req.body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 100000000).toString(36) + '-' + tag.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
        let post = null

        if (req.file) {
            //upload to aws
            const ext = path.extname(req.file.originalname)
            const filename = crypto.pseudoRandomBytes(16).toString('hex') + ext

            if (ext !== '.mp4') {
                req.file.buffer = await sharp(req.file.buffer).resize(1000).jpeg({ quality: 80 }).toBuffer()
            }

            s3.upload({
                ACL: 'public-read',
                Bucket: process.env.AWS_BUCKET,
                Key: filename,
                Body: req.file.buffer
            })
                .on('httpUploadProgress', progress => {
                    req.users[req.user._id].emit('upload_progress', progress)
                })
                .send((err, data) => {
                    if (err) {
                        res.status(500).send('Upload Failed: ' + err)
                        return
                    }

                    post = new Post({
                        ...req.body,
                        slug,
                        author: req.user,
                        media: {
                            type: ext === '.mp4' ? 'video' : 'image',
                            path: data.Location
                        }
                    })
                    post.save()
                        .then(p => {
                            res.status(201).send(p)
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(500).send('Something went wrong!')
                        })
                })
        }
        else {
            post = new Post({
                ...req.body,
                slug,
                author: req.user
            })
            post.save()
                .then(p => {
                    res.status(201).send(p)
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).send('Something went wrong!')
                })
        }
    })
})

//get posts
router.get('/', async (req, res) => {
    const { tag, id } = req.query
    const query = {}
    if (tag) query.tag = tag
    if (id) query._id = id

    try {
        let posts = await Post.find(query)
            .limit(parseInt(req.query.limit) || 10)
            .select('-createdAt -updatedAt -__v -group')
            .populate('author', 'username')
            .populate('tag', 'name')
            .sort('-createdAt')

        res.send(posts)
    }
    catch (ex) {
        console.log(ex)
        res.status(500).send('Something went wrong!')
    }
})

//upvote
router.post('/upvote/:id', auth, async (req, res) => {

    //get user
    const user = await User.findOne({ _id: req.user, liked_posts: req.params.id })

    //decrement points
    if (user) {
        Post.updateOne(
            { _id: req.params.id },
            { $inc: { points: -1 } }
        ).then(async d => {
            const u = await User.findById(req.user)
            u.liked_posts.remove(req.params.id)
            await u.save()
            res.send({ ...d, message: 'upvote removed' })
        })
            .catch(err => {
                res.status(500).send(err)
            })
        return
    }

    //increment post points
    Post.updateOne(
        { _id: req.params.id },
        { $inc: { points: 1 } }
    ).then(async d => {
        const u = await User.findById(req.user)
        u.liked_posts.push(req.params.id)
        await u.save()
        res.send({ ...d, message: 'upvote added' })
    })
        .catch(err => {
            res.status(500).send(err)
        })
})

//downvote
router.post('/downvote/:id', auth, async (req, res) => {

    //get user
    const user = await User.findOne({ _id: req.user, disliked_posts: req.params.id })

    //decrement points
    if (user) {
        Post.updateOne(
            { _id: req.params.id },
            { $inc: { points: 1 } }
        ).then(async d => {
            const u = await User.findById(req.user)
            u.disliked_posts.remove(req.params.id)
            await u.save()
            res.send({ ...d, message: 'downvote removed' })
        })
            .catch(err => {
                res.status(500).send(err)
            })
        return
    }

    //increment post points
    Post.updateOne(
        { _id: req.params.id },
        { $inc: { points: -1 } }
    ).then(async d => {
        const u = await User.findById(req.user)
        u.disliked_posts.push(req.params.id)
        await u.save()
        res.send({ ...d, message: 'downvote added' })
    })
        .catch(err => {
            res.status(500).send(err)
        })
})

module.exports = router
