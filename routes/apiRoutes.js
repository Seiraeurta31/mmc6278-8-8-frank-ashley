const router = require('express').Router()
const controllers = require('../controllers')
const checkAuth = require('../middleware/auth')

// admin login/logout
router.post('/login', controllers.auth.login)
router.get('/logout', controllers.auth.logout)

router.post(
  '/post',
  checkAuth,
  controllers.post.create
)

router
  .route('/post/:id')
  .put(checkAuth, controllers.post.update) // edit post
  .delete(checkAuth, controllers.post.remove) // remove post

router.post('/post/:postId/comment', controllers.comment.create)

router.delete(
  '/post/:postId/comment/:id',
  checkAuth,
  controllers.comment.remove
)

module.exports = router
