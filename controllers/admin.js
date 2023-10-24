const {Post, Tag} = require('../models')

// Renders the create post page
async function createPost(req, res, next) {
  const tags = await Tag.find().lean().catch(next)
  res.render('write-post', {tags, isLoggedIn: req.session.isLoggedIn})
}

// Renders the edit post page
async function editPost(req, res) {
  try {
    const {slug} = req.params
    let [post, tags] = await Promise.all([
      Post.findOne({slug}).lean(),
      Tag.find().lean()
    ])
    //must convert _ids to strings
    post.tags = post.tags.map(tag => tag.toString())
    tags = tags.map(tag => {
      if(post.tags.includes(tag._id.toString()))
        tag.checked = true
      return tag
    })
    res.render('write-post', {post, tags, isLoggedIn: req.session.isLoggedIn})
  } catch(err) {
    res.status(500).send(err.message)
  }
}

module.exports = {
  createPost,
  editPost
}
