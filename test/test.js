const { expect } = require("chai");
const request = require("supertest");
const { JSDOM } = require("jsdom");
const {
  configure,
  getByText,
  queryByText,
  getAllByRole,
  getByLabelText,
} = require("@testing-library/dom");
require('dotenv').config()
if (!process.env.SESSION_SECRET) {
  console.log("\x1b[31m%s\x1b[0m", `SESSION_SECRET is missing!`)
  console.log("\x1b[33m%s\x1b[0m", `Setting SESSION_SECRET before running test suite...`)
  console.log("\x1b[33m%s\x1b[0m", `Don't forget to create the .env file for local development.`)
  process.env.SESSION_SECRET = 'banana_meatloaf'
}
const fs = require("fs/promises");
const app = require("../app");
const { Post, Tag } = require("../models");

configure({
  getElementError(message) {
    const error = new Error(message);
    error.name = "TestingLibraryElementError";
    error.stack = null;
    return error;
  },
});

const TEST_USERNAME = "testname";
const TEST_PASSWORD = "testpass";

describe("Mongo Blog", () => {
  describe("Static Files", () => {
    it("should serve CSS", async () => {
      const response = await request(app).get(`/style.css`);
      expect(response.status).to.eq(200);
      const fileText = await fs.readFile(`public/style.css`, "UTF-8");
      expect(response.text).to.eq(fileText);
    });
  });
  describe("HTML Routes", () => {
    describe("Unauthenticated", () => {
      describe("GET / - index page showing all posts", () => {
        let posts;
        before(async () => {
          posts = await Post.find().populate({ path: "tags" }).lean();
        });
        it("should NOT render new post and logout links", async () => {
          const res = await request(app).get("/");
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          expect(queryByText(document, "New Post")).to.not.exist;
          expect(queryByText(document, "Logout")).to.not.exist;
        });
        it("should render all post titles as links to post", async () => {
          const res = await request(app).get("/");
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          for (const post of posts) {
            const postTitle = getByText(document, post.title);
            expect(postTitle).to.exist;
            expect(postTitle.tagName).to.eq("H2");
            expect(postTitle.closest("a").href).to.eq("/post/" + post.slug);
          }
        });
        it("should render dates of posts, format: Thu, Oct 26, 2000", async () => {
          const res = await request(app).get("/");
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          for (const post of posts) {
            const createdAt = new Date(post.createdAt).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );
            const postDate = getByText(document, "Posted on: " + createdAt);
            expect(postDate).to.exist;
          }
        });
      });
      describe("GET /?tag={tag} - index page showing all posts by tag", async () => {
        let posts;
        before(async () => {
          posts = await Post.find().populate({ path: "tags" }).lean();
        });
        it("should render with non-existent tag", async () => {
          const res = await request(app).get("/?tag=banana").expect(200);
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
        });
        for (const tag of ["guides", "musings"]) {
          it("should render only posts of tag: " + tag, async () => {
            const res = await request(app)
              .get("/?tag=" + tag)
              .expect(200);
            expect(res.status).to.eq(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            for (const post of posts) {
              if (post.tags.find((postTag) => postTag.name === tag)) {
                const postTitle = getByText(document, post.title);
                expect(postTitle).to.exist;
                expect(postTitle.tagName).to.eq("H2");
                expect(postTitle.closest("a").href).to.eq("/post/" + post.slug);
              } else {
                expect(queryByText(document, post.title)).to.be.null;
              }
            }
          });
          it("should NOT render new post and logout links", async () => {
            const res = await request(app).get(`/?tag=${tag}`).expect(200);
            expect(res.status).to.eq(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            expect(queryByText(document, "New Post")).to.not.exist;
            expect(queryByText(document, "Logout")).to.not.exist;
          });
        }
      });
      describe("GET /post/:slug - view post", () => {
        let posts;
        before(async () => {
          posts = await Post.find().populate({ path: "tags" }).lean();
        });
        it("should render all posts by slug", async () => {
          for (const post of posts) {
            const res = await request(app)
              .get(`/post/${post.slug}`)
              .expect(200);
            expect(res.status).to.eq(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            const postTitle = getByText(document, post.title);
            expect(postTitle).to.exist;
            expect(postTitle.tagName).to.eq("H1");
            expect(document.querySelector("article").innerHTML).includes(
              post.body
            );
          }
        });
        it("should render all post pages WITHOUT new post and logout links", async () => {
          for (const post of posts) {
            const res = await request(app)
              .get(`/post/${post.slug}`)
              .expect(200);
            expect(res.status).to.eq(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            expect(queryByText(document, "New Post")).to.not.exist;
            expect(queryByText(document, "Logout")).to.not.exist;
          }
        });
        it("should render all post comments", async () => {
          for (const post of posts) {
            const res = await request(app)
              .get(`/post/${post.slug}`)
              .expect(200);
            expect(res.status).to.eq(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            for (const comment of post.comments) {
              const commentEl = getByText(document, comment.body);
              expect(commentEl).to.exist;
            }
          }
        });
        it("should render all post comments' author and date, format: 01/01/2000", async () => {
          for (const post of posts) {
            const res = await request(app)
              .get(`/post/${post.slug}`)
              .expect(200);
            expect(res.status).to.eq(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            for (const comment of post.comments) {
              const date = new Date(comment.createdAt).toLocaleDateString(
                "en-US",
                {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                }
              );
              const commentEl = getByText(document, comment.body);
              expect(commentEl).to.exist;
              expect(commentEl.textContent).to.include(
                `${comment.author} ${date}`
              );
            }
          }
        });
      });
      describe("GET /admin - redirect route", () => {
        it("should redirect to login page", async () => {
          const res = await request(app).get("/admin").expect(302);
          expect(res.headers.location).to.eq("/admin/login");
        });
      });
      describe("GET /admin/login - login page", () => {
        it("should render HTML", async () => {
          const res = await request(app).get("/admin/login").expect(200);
          expect(res.headers["content-type"]).to.include("html");
        });
      });
      describe("GET /admin/create-post - new post page", () => {
        it("should redirect to login page", async () => {
          const res = await request(app).get("/admin/create-post").expect(302);
          expect(res.headers.location).to.eq("/admin/login");
        });
      });
      describe("GET /admin/edit-post/:slug - edit post page", () => {
        it("should redirect to login page", async () => {
          const res = await request(app)
            .get("/admin/edit-post/banana")
            .expect(302);
          expect(res.headers.location).to.eq("/admin/login");
        });
      });
    });
    describe("Authenticated", () => {
      const agent = request.agent(app);
      before(async () => {
        posts = await Post.find().populate({ path: "tags" }).lean();
        await agent
          .post("/api/login")
          .send({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
          })
          .expect(302)
          .expect("location", "/");
      });
      describe("GET / - index page", () => {
        it("should render new post and logout links", async () => {
          const res = await agent.get(`/`).expect(200);
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          expect(getByText(document, "New Post")).to.exist;
          expect(getByText(document, "Logout")).to.exist;
        });
        it("should show edit and delete options for each post", async () => {
          const res = await agent.get("/");
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          for (const post of posts) {
            const createdAt = new Date(post.createdAt).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );
            const postDate = getByText(document, createdAt, { exact: false });
            expect(postDate).to.exist;
            const editBtn = getByText(postDate, "Edit Post");
            expect(editBtn).to.exist;
            const removeBtn = getByText(postDate, "Delete Post");
            expect(removeBtn).to.exist;
          }
        });
      });
      describe("GET /?tag={tag} - index page showing all posts by tag", () => {
        it("should render new post and logout links", async () => {
          const res = await agent.get(`/?tag=guides`).expect(200);
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          expect(getByText(document, "New Post")).to.exist;
          expect(getByText(document, "Logout")).to.exist;
        });
        it("should show edit and delete options for each post", async () => {
          const res = await agent.get("/?tag=guides");
          expect(res.status).to.eq(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          for (const post of posts) {
            const createdAt = new Date(post.createdAt).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );
            if (post.tags.find((tag) => tag.name === "guides")) {
              const postDate = getByText(document, createdAt, { exact: false });
              expect(postDate).to.exist;
              const editBtn = getByText(postDate, "Edit Post");
              expect(editBtn).to.exist;
              const removeBtn = getByText(postDate, "Delete Post");
              expect(removeBtn).to.exist;
            } else {
              const postDate = queryByText(document, createdAt, {
                exact: false,
              });
              expect(postDate).to.be.null;
            }
          }
        });
      });
      describe("GET /post/:slug - view post", () => {
        it("should render all post pages with new post and logout links", async () => {
          for (const post of posts) {
            const res = await agent.get(`/post/${post.slug}`).expect(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            expect(getByText(document, "New Post")).to.exist;
            expect(getByText(document, "Logout")).to.exist;
          }
        });
        it("should render all post comments with remove option", async () => {
          for (const post of posts) {
            const res = await agent.get(`/post/${post.slug}`).expect(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            for (const comment of post.comments) {
              const commentEl = getByText(document, comment.body);
              expect(commentEl).to.exist;
              expect(getByText(commentEl, "Remove")).to.exist;
            }
          }
        });
      });
      describe("GET /admin - redirect route", () => {
        it("should redirect to index page", async () => {
          const res = await agent.get("/admin").expect(302);
          expect(res.headers.location).to.eq("/");
        });
      });
      describe("GET /admin/login - login page", () => {
        it("should redirect to index page", async () => {
          const res = await agent.get("/admin").expect(302);
          expect(res.headers.location).to.eq("/");
        });
      });
      describe("GET /admin/create-post - new post page", () => {
        let tags;
        before(async () => {
          tags = await Tag.find().lean();
        });
        it("should render create post page", async () => {
          const res = await agent.get("/admin/create-post").expect(200);
          expect(res.headers["content-type"]).to.include("html");
          const {
            window: { document },
          } = new JSDOM(res.text);
          expect(document.querySelector("form#create-post")).to.exist;
          for (const tag of tags) {
            expect(getByText(document, new RegExp(tag.name, "i"))).to.exist;
          }
        });
      });
      describe("GET /admin/edit-post/:slug - edit post page", () => {
        let posts;
        let tags;
        before(async () => {
          posts = await Post.find().populate({ path: "tags" }).lean();
          tags = await Tag.find().lean();
        });
        it("should render edit post page for each post with pre-filled title", async () => {
          for (const post of posts) {
            const res = await agent
              .get("/admin/edit-post/" + post.slug)
              .expect(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            const titleInput = getByLabelText(document, "Title");
            expect(titleInput).to.exist;
            expect(titleInput.value).to.eq(post.title);
          }
        });
        it("should render edit post page for each post with pre-filled body", async () => {
          for (const post of posts) {
            const res = await agent
              .get("/admin/edit-post/" + post.slug)
              .expect(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            const editorBodyEl = document.getElementById("editor");
            expect(editorBodyEl).to.exist;
            expect(editorBodyEl.innerHTML.trim()).to.eq(post.body);
          }
        });
        it("should render edit post page for each post with pre-filled tags", async () => {
          for (const post of posts) {
            const res = await agent
              .get("/admin/edit-post/" + post.slug)
              .expect(200);
            expect(res.headers["content-type"]).to.include("html");
            const {
              window: { document },
            } = new JSDOM(res.text);
            for (const tag of tags) {
              const tagEl = getByLabelText(document, new RegExp(tag.name, "i"));
              expect(tagEl).to.exist;
              if (tagEl.checked) {
                expect(post.tags.find((postTag) => postTag.name === tag.name))
                  .to.exist;
              } else {
                expect(post.tags.find((postTag) => postTag.name === tag.name))
                  .to.not.exist;
              }
            }
          }
        });
      });
    });
  });
  describe("API Routes", () => {
    describe("Unauthenticated", () => {
      describe("POST /api/login - login admin user", () => {
        it("should log user in with correct username/pass and redirect to /", async () => {
          const agent = request.agent(app);
          const res = await agent
            .post("/api/login")
            .send({
              username: TEST_USERNAME,
              password: TEST_PASSWORD,
            })
            .expect(302)
            .expect("location", "/");
          expect(res.headers["set-cookie"]).to.exist;
          await agent.get("/admin/create-post").expect(200);
        });
        it("should redirect user to /admin/login?error=true with INCORRECT username", async () => {
          const res = await request(app)
            .post("/api/login")
            .send({
              username: "banana",
              password: TEST_PASSWORD,
            })
            .expect(302)
            .expect("location", "/admin/login?error=true");
          expect(res.headers["set-cookie"]).to.not.exist;
        });
        it("should redirect user to /admin/login?error=true with INCORRECT password", async () => {
          const res = await request(app)
            .post("/api/login")
            .send({
              username: TEST_USERNAME,
              password: "banana",
            })
            .expect(302)
            .expect("location", "/admin/login?error=true");
          expect(res.headers["set-cookie"]).to.not.exist;
        });
      });
      describe("GET /api/logout - logout admin user", () => {
        it("should log user out and redirect to /", async () => {
          const agent = request.agent(app);
          const loginRes = await agent
            .post("/api/login")
            .send({
              username: TEST_USERNAME,
              password: TEST_PASSWORD,
            })
            .expect(302)
            .expect("location", "/");
          expect(loginRes.headers["set-cookie"]).to.exist;
          await agent.get("/api/logout").expect(302).expect("location", "/");
          await agent
            .get("/admin/create-post")
            .expect(302)
            .expect("location", "/admin/login");
        });
      });
      describe("POST /api/post/:postId/comment - add comment to post", () => {
        let postId;
        let postSlug;
        let originalComments;
        before(async () => {
          const [post] = await Post.find().lean();
          postId = post._id.toString();
          postSlug = post.slug;
          originalComments = post.comments;
        });
        afterEach(async () => {
          await Post.findByIdAndUpdate(postId, { comments: originalComments });
        });
        it("should add comment to specific post", async () => {
          const commentText = "BANANARAMA";
          const commentAuthor = "GRAPEFRUIT";
          await request(app)
            .post(`/api/post/${postId}/comment`)
            .send({
              author: commentAuthor,
              body: commentText,
            })
            .expect(302)
            .expect("location", `/post/${postSlug}#comments`);
          const updatedPost = await Post.findById(postId).lean();
          const addedComment = updatedPost.comments.find(
            (comment) => comment.body === commentText
          );
          expect(addedComment).to.exist;
          expect(addedComment.author).to.eq(commentAuthor);
        });
        it("should add comment to specific post with Anonymous author if author omitted", async () => {
          const commentText = "BANANARAMA";
          await request(app)
            .post(`/api/post/${postId}/comment`)
            .send({
              body: commentText,
            })
            .expect(302)
            .expect("location", `/post/${postSlug}#comments`);
          const updatedPost = await Post.findById(postId).lean();
          const addedComment = updatedPost.comments.find(
            (comment) => comment.body === commentText
          );
          expect(addedComment).to.exist;
          expect(addedComment.author).to.match(/anonymous/i);
        });
        it("should return 400 if no body is included", async () => {
          await request(app).post(`/api/post/${postId}/comment`).expect(400);
        });
      });
      // auth'd routes
      describe("DELETE /api/post/:postId/comment/:id - delete comment from post", () => {
        it("should redirect to login page", async () => {
          const res = await request(app).get("/admin").expect(302);
          expect(res.headers.location).to.eq("/admin/login");
        });
      });
      describe("POST /api/post - new post", () => {
        it("should redirect to login page", async () => {
          const res = await request(app).get("/admin").expect(302);
          expect(res.headers.location).to.eq("/admin/login");
        });
      });
      describe("PUT /api/post/:id - edit post", () => {
        it("should redirect to login page", async () => {
          const res = await request(app).get("/admin").expect(302);
          expect(res.headers.location).to.eq("/admin/login");
        });
      });
      describe("DELETE /api/post/:id - delete post", () => {
        it("should redirect to login page", async () => {
          const res = await request(app).get("/admin").expect(302);
          expect(res.headers.location).to.eq("/admin/login");
        });
      });
    });
    describe("Authenticated", () => {
      const agent = request.agent(app);
      let post;
      let tags;
      before(async () => {
        tags = await Tag.find().lean();
        await agent
          .post("/api/login")
          .send({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            tags: [tags[0]._id.toString()],
          })
          .expect(302)
          .expect("location", "/");
      });
      beforeEach(async () => {
        post = await Post.create({
          title: "my post title",
          body: "this is my best post ever",
        });
      });
      afterEach(async () => {
        await Post.findByIdAndRemove(post._id);
      });
      describe("DELETE /api/post/:postId/comment/:id - delete comment from post", () => {
        let commentId;
        beforeEach(async () => {
          const updatedPost = await Post.findByIdAndUpdate(
            post._id,
            {
              $push: { comments: { author: "dude", body: "duuuuuuude" } },
            },
            {
              new: true,
              runValidators: true,
            }
          );
          const addedComment = updatedPost.comments.find(
            (comment) => comment.author === "dude"
          );
          expect(addedComment).to.exist;
          expect(addedComment.body).to.eq("duuuuuuude");
          commentId = updatedPost.comments[0]._id.toString();
        });
        afterEach(async () => {
          const updatedPost = await Post.findByIdAndUpdate(
            post._id,
            {
              $pull: { comments: { _id: commentId } },
            },
            {
              new: true,
              runValidators: true,
            }
          );
        });
        it("should remove comment from post", async () => {
          const res = await agent
            .delete(`/api/post/${post._id}/comment/${commentId}`)
            .expect(200);
          const updatedPost = await Post.findById(post._id);
          const comment = updatedPost.comments.find(
            (comment) => comment._id === commentId
          );
          expect(comment).to.not.exist;
        });
      });
      describe("POST /api/post - new post", () => {
        let postIds;
        beforeEach(async () => {
          const posts = await Post.find().lean();
          postIds = posts.map((post) => post._id.toString());
        });
        afterEach(async () => {
          const posts = await Post.find().lean();
          const addedPostIds = posts
            .map((post) => post._id.toString())
            .filter((id) => !postIds.includes(id));
          for (const addedPostId of addedPostIds) {
            await Post.findByIdAndRemove(addedPostId);
          }
        });
        it("should add post", async () => {
          const body = "this is my new post";
          const title = "the best post title";
          const res = await agent
            .post("/api/post")
            .send({
              body,
              title,
            })
            .expect(200);
          const addedPost = await Post.findOne({ title }).lean();
          expect(addedPost).to.exist;
          expect(addedPost.body).to.eq(body);
        });
        it("should add tag ids to post if included", async () => {
          const body = "this is my new post";
          const title = "the best post title";
          const tagIds = (await Tag.find().lean()).map((tag) =>
            tag._id.toString()
          );
          const res = await agent
            .post("/api/post")
            .send({
              body,
              title,
              tags: tagIds,
            })
            .expect(200);
          const addedPost = await Post.findOne({ title }).lean();
          expect(addedPost).to.exist;
          expect(addedPost.body).to.eq(body);
          const addedPostTagIds = addedPost.tags.map(({ _id }) =>
            _id.toString()
          );
          for (const tagId of tagIds) {
            expect(addedPostTagIds).to.include(tagId);
          }
        });
        it("should return 400 if title not included", async () => {
          const body = "this is my new post";
          const res = await agent.post("/api/post").send({ body }).expect(400);
          const addedPost = await Post.findOne({ body }).lean();
          expect(addedPost).to.not.exist;
        });
        it("should return 400 if body not included", async () => {
          const title = "the best post title";
          const res = await agent.post("/api/post").send({ title }).expect(400);
          const addedPost = await Post.findOne({ title }).lean();
          expect(addedPost).to.not.exist;
        });
      });
      describe("PUT /api/post/:id - edit post", () => {
        it("should allow editing title", async () => {
          const newTitle = "oh yeaaaaaaaah";
          const res = await agent
            .put(`/api/post/${post._id}`)
            .send({
              title: newTitle,
              body: post.body,
              tags: post.tags,
            })
            .expect(200);
          const updatedPost = await Post.findById(post._id);
          expect(updatedPost).to.exist;
          expect(updatedPost.title).to.eq(newTitle);
          expect(updatedPost.body).to.eq(post.body);
          expect(updatedPost.tags).to.deep.eq(post.tags);
        });
        it("should allow editing body", async () => {
          const newBody = "oh yeaaaaaaaah";
          const res = await agent
            .put(`/api/post/${post._id}`)
            .send({
              title: post.title,
              body: newBody,
              tags: post.tags,
            })
            .expect(200);
          const updatedPost = await Post.findById(post._id);
          expect(updatedPost).to.exist;
          expect(updatedPost.title).to.eq(post.title);
          expect(updatedPost.body).to.eq(newBody);
          expect(updatedPost.tags).to.deep.eq(post.tags);
        });
        it("should overwrite tags with new tags", async () => {
          const res = await agent
            .put(`/api/post/${post._id}`)
            .send({
              title: post.title,
              body: post.body,
              tags: tags.map((tag) => tag._id.toString()),
            })
            .expect(200);
          const updatedPost = await Post.findById(post._id);
          expect(updatedPost).to.exist;
          expect(updatedPost.title).to.eq(post.title);
          expect(updatedPost.body).to.eq(post.body);
          for (const tagId of tags.map((tag) => tag._id.toString())) {
            expect(updatedPost.tags).to.include(tagId);
          }
        });
        it("should remove all tags if tags are omitted", async () => {
          const res = await agent
            .put(`/api/post/${post._id}`)
            .send({
              title: post.title,
              body: post.body,
            })
            .expect(200);
          const updatedPost = await Post.findById(post._id);
          expect(updatedPost).to.exist;
          expect(updatedPost.title).to.eq(post.title);
          expect(updatedPost.body).to.eq(post.body);
          expect(updatedPost.tags).to.be.empty;
        });
        it("should return 400 if body is omitted", async () => {
          const res = await agent
            .put(`/api/post/${post._id}`)
            .send({
              title: "banana",
            })
            .expect(400);
          const notUpdatedPost = await Post.findById(post._id);
          expect(notUpdatedPost).to.exist;
          expect(notUpdatedPost.title).to.eq(post.title);
          expect(notUpdatedPost.body).to.eq(post.body);
        });
        it("should return 400 if title is omitted", async () => {
          const res = await agent
            .put(`/api/post/${post._id}`)
            .send({
              body: "banana",
            })
            .expect(400);
          const notUpdatedPost = await Post.findById(post._id);
          expect(notUpdatedPost).to.exist;
          expect(notUpdatedPost.title).to.eq(post.title);
          expect(notUpdatedPost.body).to.eq(post.body);
        });
      });
      describe("DELETE /api/post/:id - delete post", () => {
        it("should delete post", async () => {
          const res = await agent.delete(`/api/post/${post._id}`).expect(200);
          const deletedPost = await Post.findById(post._id);
          expect(deletedPost).to.not.exist;
        });
      });
    });
  });
});
