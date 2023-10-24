let ADMIN_USERNAME
let ADMIN_PASSWORD
if (process.env.MONGODB_URI) {
  console.log("\x1b[31m%s\x1b[0m", 'SEEDING MONGODB PRODUCTION DATABASE!!!\n'.repeat(3))
  console.log("\x1b[31m%s\x1b[0m", "Don't forget to clear MONGODB_URI!\n")
  console.log("\x1b[33m%s\x1b[0m", "Run 'export MONGODB_URI=' or close this terminal after seeding.", "\n")
} else {
  console.log("\x1b[33m%s\x1b[0m", 'SEEDING MONGODB LOCAL DB')
}
if (process.env.NODE_ENV === 'test') {
  console.log("\x1b[35m%s\x1b[0m", 'Using Test Username/Password\n')
  ADMIN_USERNAME = 'testname'
  ADMIN_PASSWORD = 'testpass'
} else {
  require("dotenv").config();
  console.log("\x1b[32m%s\x1b[0m", 'Using .env file Username/Password\n')
  ADMIN_USERNAME = process.env.ADMIN_USERNAME
  ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
}
const { Post, User, Tag } = require("../models");
const { connection } = require("../config/connection");

connection.once("open", async function () {
  await User.create({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  });
  const posts = await Post.create([
    {
      title: "Tomatoes are fruit, therefore ketchup is a smoothie",
      body:
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a rutrum lacus. Donec vitae ultrices nibh. Vestibulum dictum justo pretium, facilisis nulla a, commodo tortor. Quisque dictum elit nec elementum placerat. Integer malesuada, nisl quis ultrices tincidunt, sem enim pulvinar eros, ac blandit massa est non felis. Etiam congue diam at consequat lacinia. Curabitur bibendum neque dolor, eu lobortis quam malesuada vel.</p><p>Proin massa ligula, sollicitudin sit amet tortor sed, congue fringilla erat. Etiam pellentesque lectus ac neque gravida aliquet. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet eros vitae metus vestibulum tempus ut sit amet orci. In eget porta nisl, sit amet semper urna. Praesent erat odio, tincidunt sit amet tincidunt in, efficitur sit amet libero. Suspendisse eu pulvinar massa. Nam pharetra leo purus, id dapibus orci molestie nec. Praesent ut mauris id sapien luctus molestie in vel diam. Donec dapibus tempus molestie. Etiam id nisi justo. Praesent vestibulum sem lectus, sed fringilla risus blandit a. Maecenas nunc purus, tristique tincidunt finibus eget, sollicitudin at lectus. Quisque vulputate sodales augue eget lacinia. Quisque nec tincidunt nibh, id aliquam justo.</p>",
      createdAt: new Date("08/14/1989 12:00 PM EDT").getTime(),
      comments: [
        {
          body: "Freaking GROSS",
        },
      ],
    },
    {
      title:
        "Books and movies set in the future cannot be labeled fiction ...yet",
      body:
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a rutrum lacus. Donec vitae ultrices nibh. Vestibulum dictum justo pretium, facilisis nulla a, commodo tortor. Quisque dictum elit nec elementum placerat. Integer malesuada, nisl quis ultrices tincidunt, sem enim pulvinar eros, ac blandit massa est non felis. Etiam congue diam at consequat lacinia. Curabitur bibendum neque dolor, eu lobortis quam malesuada vel.</p><p>Proin massa ligula, sollicitudin sit amet tortor sed, congue fringilla erat. Etiam pellentesque lectus ac neque gravida aliquet. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet eros vitae metus vestibulum tempus ut sit amet orci. In eget porta nisl, sit amet semper urna. Praesent erat odio, tincidunt sit amet tincidunt in, efficitur sit amet libero. Suspendisse eu pulvinar massa. Nam pharetra leo purus, id dapibus orci molestie nec. Praesent ut mauris id sapien luctus molestie in vel diam. Donec dapibus tempus molestie. Etiam id nisi justo. Praesent vestibulum sem lectus, sed fringilla risus blandit a. Maecenas nunc purus, tristique tincidunt finibus eget, sollicitudin at lectus. Quisque vulputate sodales augue eget lacinia. Quisque nec tincidunt nibh, id aliquam justo.</p>",
      createdAt: new Date("09/09/1995 12:00 PM EDT").getTime(),
      comments: [
        {
          body: "Dude, you're soooo not wrong.",
        },
        {
          author: "Johnny Rocket",
          body: "I love hamburgers!!!!",
        },
      ],
    },
    {
      title: "Drinking alcohol is like borrowing happiness from tomorrow",
      body:
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a rutrum lacus. Donec vitae ultrices nibh. Vestibulum dictum justo pretium, facilisis nulla a, commodo tortor. Quisque dictum elit nec elementum placerat. Integer malesuada, nisl quis ultrices tincidunt, sem enim pulvinar eros, ac blandit massa est non felis. Etiam congue diam at consequat lacinia. Curabitur bibendum neque dolor, eu lobortis quam malesuada vel.</p><p>Proin massa ligula, sollicitudin sit amet tortor sed, congue fringilla erat. Etiam pellentesque lectus ac neque gravida aliquet. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet eros vitae metus vestibulum tempus ut sit amet orci. In eget porta nisl, sit amet semper urna. Praesent erat odio, tincidunt sit amet tincidunt in, efficitur sit amet libero. Suspendisse eu pulvinar massa. Nam pharetra leo purus, id dapibus orci molestie nec. Praesent ut mauris id sapien luctus molestie in vel diam. Donec dapibus tempus molestie. Etiam id nisi justo. Praesent vestibulum sem lectus, sed fringilla risus blandit a. Maecenas nunc purus, tristique tincidunt finibus eget, sollicitudin at lectus. Quisque vulputate sodales augue eget lacinia. Quisque nec tincidunt nibh, id aliquam justo.</p>",
      createdAt: new Date("09/09/1999 12:00 PM EDT").getTime(),
      comments: [
        {
          body: "Wow what a great article!",
        },
        {
          author: "Johnny Rocket",
          body: "I love hamburgers!",
        },
      ],
    },
    {
      title: "Pop tarts have usurped bananas as the most phone-like food",
      body:
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a rutrum lacus. Donec vitae ultrices nibh. Vestibulum dictum justo pretium, facilisis nulla a, commodo tortor. Quisque dictum elit nec elementum placerat. Integer malesuada, nisl quis ultrices tincidunt, sem enim pulvinar eros, ac blandit massa est non felis. Etiam congue diam at consequat lacinia. Curabitur bibendum neque dolor, eu lobortis quam malesuada vel.</p><p>Proin massa ligula, sollicitudin sit amet tortor sed, congue fringilla erat. Etiam pellentesque lectus ac neque gravida aliquet. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet eros vitae metus vestibulum tempus ut sit amet orci. In eget porta nisl, sit amet semper urna. Praesent erat odio, tincidunt sit amet tincidunt in, efficitur sit amet libero. Suspendisse eu pulvinar massa. Nam pharetra leo purus, id dapibus orci molestie nec. Praesent ut mauris id sapien luctus molestie in vel diam. Donec dapibus tempus molestie. Etiam id nisi justo. Praesent vestibulum sem lectus, sed fringilla risus blandit a. Maecenas nunc purus, tristique tincidunt finibus eget, sollicitudin at lectus. Quisque vulputate sodales augue eget lacinia. Quisque nec tincidunt nibh, id aliquam justo.</p>",
      createdAt: new Date("10/26/2000 12:00 PM EDT").getTime(),
      comments: [
        {
          body: "LAWL",
        },
      ],
    },
    {
      title: "Hotdogs are sandwiches, and here is why.",
      body:
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a rutrum lacus. Donec vitae ultrices nibh. Vestibulum dictum justo pretium, facilisis nulla a, commodo tortor. Quisque dictum elit nec elementum placerat. Integer malesuada, nisl quis ultrices tincidunt, sem enim pulvinar eros, ac blandit massa est non felis. Etiam congue diam at consequat lacinia. Curabitur bibendum neque dolor, eu lobortis quam malesuada vel.</p><p>Proin massa ligula, sollicitudin sit amet tortor sed, congue fringilla erat. Etiam pellentesque lectus ac neque gravida aliquet. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet eros vitae metus vestibulum tempus ut sit amet orci. In eget porta nisl, sit amet semper urna. Praesent erat odio, tincidunt sit amet tincidunt in, efficitur sit amet libero. Suspendisse eu pulvinar massa. Nam pharetra leo purus, id dapibus orci molestie nec. Praesent ut mauris id sapien luctus molestie in vel diam. Donec dapibus tempus molestie. Etiam id nisi justo. Praesent vestibulum sem lectus, sed fringilla risus blandit a. Maecenas nunc purus, tristique tincidunt finibus eget, sollicitudin at lectus. Quisque vulputate sodales augue eget lacinia. Quisque nec tincidunt nibh, id aliquam justo.</p>",
      createdAt: new Date("09/27/1986 12:00 PM EDT").getTime(),
      comments: [
        {
          body: "I disagree.",
        },
      ],
    },
    {
      title: "Ten reasons why top ten lists are click bait",
      body:
        "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a rutrum lacus. Donec vitae ultrices nibh. Vestibulum dictum justo pretium, facilisis nulla a, commodo tortor. Quisque dictum elit nec elementum placerat. Integer malesuada, nisl quis ultrices tincidunt, sem enim pulvinar eros, ac blandit massa est non felis. Etiam congue diam at consequat lacinia. Curabitur bibendum neque dolor, eu lobortis quam malesuada vel.</p><p>Proin massa ligula, sollicitudin sit amet tortor sed, congue fringilla erat. Etiam pellentesque lectus ac neque gravida aliquet. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet eros vitae metus vestibulum tempus ut sit amet orci. In eget porta nisl, sit amet semper urna. Praesent erat odio, tincidunt sit amet tincidunt in, efficitur sit amet libero. Suspendisse eu pulvinar massa. Nam pharetra leo purus, id dapibus orci molestie nec. Praesent ut mauris id sapien luctus molestie in vel diam. Donec dapibus tempus molestie. Etiam id nisi justo. Praesent vestibulum sem lectus, sed fringilla risus blandit a. Maecenas nunc purus, tristique tincidunt finibus eget, sollicitudin at lectus. Quisque vulputate sodales augue eget lacinia. Quisque nec tincidunt nibh, id aliquam justo.</p>",
      createdAt: new Date("09/29/1996 12:00 PM EDT").getTime(),
    },
  ]);

  const tags = await Tag.create([{ name: "guides" }, { name: "musings" }]);

  posts[0].tags = [tags[0]._id, tags[1]._id];
  posts[1].tags = [tags[0]._id];
  posts[2].tags = [tags[1]._id];
  posts[3].tags = [tags[1]._id];
  posts[4].tags = [tags[0]._id];
  await Promise.all(posts.map((post) => post.save()));

  connection.close();
});
