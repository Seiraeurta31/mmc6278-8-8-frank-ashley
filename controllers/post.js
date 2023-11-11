const { Post, Tag } = require('../models')

async function create(req, res, next) {
  // TODO: create a new post
  try{
    const {
      title, 
      body, 
      tags
    } = req.body
    // if there is no title or body, return a 400 status
    // omitting tags is OK
    if (!(
      title && 
      body 
    ))
      return res
        .status(400)
        .send('Unable to creare a post')
    // create a new post using title, body, and tags
    // return the new post as json and a 200 status
    const post = await Post.create({
      title, 
      body, 
      tags
    })
    res.json(post).status(200)
  
  }catch (err) {
    res.status(500).send('Error creating post' + err.message)
  }

}

// should render HTML
async function get(req, res) {
  try {
    const slug = req.params.slug
    // TODO: Find a single post
    // find a single post by slug and populate 'tags'
    // you will need to use .lean() or .toObject()
    const post = await Post.findOneAndUpdate(slug).lean().populate('tags')

    post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    post.comments.map(comment => {
      comment.createdAt = new Date(comment.createdAt).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
      return comment
    })
    res.render('view-post', {post, isLoggedIn: req.session.isLoggedIn})
  } catch(err) {
    res.status(500).send(err.message)
  }
}

// should render HTML
async function getAll(req, res) {
  try {
    // get by single tag id if included
    const mongoQuery = {}
    if (req.query.tag) {
      const tagDoc =  await Tag.findOne({name: req.query.tag}).lean()
      if (tagDoc)
        mongoQuery.tags = {_id: tagDoc._id }
    }
    const postDocs = await Post
      .find(mongoQuery)
      .populate({
        path: 'tags'
      })
      .sort({createdAt: 'DESC'})
    const posts = postDocs.map(post => {
      post = post.toObject()
      post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return post
    })
    res.render('index', {
      posts,
      isLoggedIn: req.session.isLoggedIn,
      tag: req.query.tag
    })
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function update(req, res) {
  try {
    // TODO: update a post  
    const {
      title, 
      body, 
      tags
    } = req.body

    // if there is no title or body, return a 400 status
    // omitting tags is OK
    if (!(
      title && 
      body 
    ))
      return res
        .status(400)

    const postId = req.params.id
    
    // find and update the post with the title, body, and tags
    // return the updated post as json
    const post = await Post.findOneAndReplace(
      {postId},
      {$set: {title, body, tags}},
      {new: true}
    )
    res.json(post)
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function remove(req, res, next) {
  try{
    // TODO: Delete a post
    // delete post by id, return a 200 status
    const postId = req.params.id
    const post = await Post.findByIdAndDelete(postId)
    res.status(200)
  } catch (err) {
    res.status(500).send('Post not found' + err.message)
  }  
}

module.exports = {
  get,
  getAll,
  create,
  update,
  remove
}
