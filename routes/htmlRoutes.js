const router = require("express").Router();
const controllers = require("../controllers");
const checkAuth = require("../middleware/auth");

router.get('/admin', (req, res) => {
  if (req.session.isLoggedIn)
    return res.redirect('/')
  res.redirect('/admin/login')
})

// admin login page
router.get("/admin/login", async (req, res) => {
  if (req.session.isLoggedIn)
    return res.redirect('/')
  res.render("login", {error: req.query.error});
});

router.get("/admin/create-post", checkAuth, controllers.admin.createPost)
router.get("/admin/edit-post/:slug", checkAuth, controllers.admin.editPost)

// get all posts
// ?tag=tagId for posts by single tag
router.get("/", controllers.post.getAll);

// get single post
router.get("/post/:slug", controllers.post.get);

module.exports = router;
