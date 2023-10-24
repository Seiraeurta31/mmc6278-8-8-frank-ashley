const bcrypt = require('bcrypt')
const {User} = require('../models')

async function login(req, res) {
  try {
    const {username, password} = req.body
    if (!username || !password)
      return res.redirect('/admin/login?error=true')
    const user = await User.findOne({username}).lean()
    if (!user)
      return res.redirect('/admin/login?error=true')
    const { password: hash } = user
    const isLoggedIn = await bcrypt.compare(password, hash)
    if (!isLoggedIn)
      return res.redirect('/admin/login?error=true')

    req.session.isLoggedIn = isLoggedIn
    req.session.save(() => res.redirect('/'))
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function logout(req, res) {
  req.session.destroy(() => res.redirect('/'))
}

module.exports = { login, logout }
