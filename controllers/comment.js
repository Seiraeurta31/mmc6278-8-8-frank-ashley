const {Post} = require('../models')

async function create(req, res) {
  try {
    const {postId} = req.params
    const {author, body} = req.body
    if (!(postId && body))
      return res.status(400).send('postId and body required')
    const post = await Post.findByIdAndUpdate(
      postId,
      // this adds the comment to the comments array
      // the author key is omitted from the object if
      // no author is included
      {$push: {comments: {...(author && {author}), body} }},
      {new: true, runValidators: true}
    )
    res.redirect(`/post/${post.slug}#comments`)
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function remove(req, res) {
  try {
    const {postId} = req.params
    if (!postId)
      return res.status(400).send('postId is required')
    const commentId = req.params.id
    const post = await Post.findByIdAndUpdate(
      postId,
      {$pull: {comments: {_id: commentId} }},
      {new: true, runValidators: true}
    )
    res.json(post)
  } catch(err) {
    res.status(500).send(err.message)
  }
}

module.exports = { create, remove }
