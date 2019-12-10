const router = require('express').Router()
const Comment = require('../models/Comment')
const auth = require('../middleware/auth')
const Notification = require('../models/Notification')
const Post = require('../models/Post')

//create comment
router.post('/', auth, async (req, res) => {
    const comment = new Comment({
        ...req.body,
        author: req.user
    })
    comment.save()
        .then(async d => {
            res.status(201).send(d)

            //create notification
            const post = await Post.findById(req.body.post_id)
            await Notification.create({
                text: `${req.user._id} commented on your post ${post.title}`,
                receiver: post.author,
                url: post.slug
            })
            req.notify(post.author)
        })
        .catch(err => res.status(500).send(err))
})

//create reply to a comment
router.post('/reply/:comment_id', auth, async (req, res) => {

    const parentComment = await Comment.findById(req.params.comment_id).populate('post_id', '_id title slug')

    const comment = new Comment({
        ...req.body,
        post_id: parentComment.post_id._id,
        author: req.user,
        is_reply: true
    })

    comment.save()
        .then(async d => {
            try {
                await Comment.updateOne(
                    { _id: req.params.comment_id },
                    { $push: { replies: d._id } }
                )
                res.status(201).send(d)

                //create notification
                await Notification.create({
                    text: `${req.user._id} replied to your comment on post "${parentComment.post_id.title}"`,
                    receiver: parentComment.author,
                    url: parentComment.post_id.slug
                })
                req.notify(parentComment.author)
            }
            catch (ex) {
                res.status(500).send(ex)
            }
        })
        .catch(err => res.status(500).send(err))
})

//get comments
router.get('/:post_id', async (req, res) => {

    const comments = await Comment.find({ post_id: req.params.post_id, is_reply: false })

    res.send(comments)
})

module.exports = router
