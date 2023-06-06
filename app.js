const path = require('path')
const express = require('express')
const multer = require("multer") // we use this for storing images and other files sent from the user
const Joi = require('joi') // this is for data validation sent from front-end
const fs = require('fs') // this is for saving or reading files to the server
const Post = require('./methods/posts') // class / constructor
const { Vote, userInfo } = require('./methods/posts') // functions ?  variables


global.admins = ["lucianape3", "fatzuca", "barbuvlad21", "maki1", "abubfc", "dagrine", "jibon23"]

// const { JsonRpc } = require("@proton/hyperion")
// const fetch = require("isomorphic-fetch")
// const endpoint = "https://eos.hyperion.eosrio.io"

// const V1Point = 'https://proton.greymass.com/v1/history/get_transaction'
// const v2Point = '/v2/history/get_actions?account=lucianape3&act.name=lucianape3'

// configuration for multer
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './shield/uploads/')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/")
    let extension = extArray[extArray.length - 1]
    let newFileName = file.fieldname + '-' + Date.now() + '.' + extension
    cb(null, newFileName)
  }
})

const upload = multer({ storage: storage })

const app = express()


// express.json to decifer json data from incoming requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'shield')))


// const rpc = new JsonRpc(endpoint + v2Point, { fetch })

// const test = async () => {
//   let response
//   try {
//     response = await rpc.get_transaction('e14d9104a1e9d12864a06a2dfe5f448af7b24a71911190eb990c1dde3544b36f')
//     console.log(response);

//   }

//   catch (error) {
//     console.log(error)
//     console.log(response);
//   }
// }

// test()

// https://proton.greymass.com/v1/chain/get_currency_balance
//        ^^^^^^
// const currencyPayload = {
//   "code": "eosio.token",
//   "account": "lucianape3",
//   "symbol": "XPR"
// }


// with this request we can get all the data of a transaction
// app.get('/balance', (req, res) => {
//   fetch(V1Point, {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       id: req.query.id
//     })
//   }).then(response => {
//     return response.json()
//   }).then(data => {
//     res.send(data)
//     // data.traces[1].receipt.receiver
//   }).catch(err => {
//     res.send(err)
//   })

// })


// GETs all data from posts.json file 
app.get('/getposts', (req, res) => {

  let readPosts = JSON.parse(fs.readFileSync('./data/posts.json'))
  let readVotes = JSON.parse(fs.readFileSync('./data/votes.json'))
  //let comments

  // filter posts and votes object based on: if the user requesting is an admin or regular user
  // if (req.query.user) {
  // } else {
  //   // if the user is not present or is not an admin
  //   const filteredPosts = readPosts.filter(post => post.approved)
  //   const filteredVotes = readVotes.filter(vote => {
  //     const post = filteredPosts.find(p => p.id === vote.id)
  //     return post && post.approved
  //   })

  //   readPosts = filteredPosts
  //   readVotes = filteredVotes
  // }

  if (req.query.id) {
    //let posts = readPosts.filter(title => title.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') === req.query.title)
    let posts = readPosts.filter(id => id.id == req.query.id)

    let votes
    let comments = {}
    if (posts[0]) {
      if (fs.existsSync(`./data/comments/#${posts[0].id}.json`)) {
        comments.comments = JSON.parse(fs.readFileSync('./data/comments/#' + posts[0].id + '.json'))
      } else { comments = null }
    }
    if (posts.length > 0) {
      votes = readVotes.filter(vote => vote.id === posts[0].id)
    } else {
      posts, votes, comments = null
    }
    res.send({ posts, votes, comments })
  }

  else if (req.query.tag) {
    let posts = readPosts.filter(post => post.tags.includes(req.query.tag))
    let votes = []

    if (posts.length > 0) {
      posts.forEach((el, i) => {
        let oneObject = readVotes.filter(vote => vote.id === el.id)
        votes.push(oneObject[0])
      })
    } else {
      posts, votes = null
    }
    res.send({ posts, votes })
  }

  else if (req.query.search) {

    const s = req.query.search
    let votes = []
    let posts = []

    const searchStringInJSON = (str, json) => {
      const string = str.toLowerCase()
      json.forEach(object => {

        for (var key in object) {
          if (key === 'title' && object[key].toLowerCase().includes(string)) {
            posts.push(object)
            votes.push(readVotes.filter(vote => vote.id === object.id)[0])
            break
          }
          if (key === 'tags' && object[key].toLowerCase().includes(string)) {
            posts.push(object)
            votes.push(readVotes.filter(vote => vote.id === object.id)[0])
            break
          }
          if (key === 'options') {
            const stringifiedOptions = JSON.stringify(object.options).toLowerCase().replace(/ /g, '').replace(/[^\w-]+/g, ',')
            if (stringifiedOptions.includes(string)) {
              posts.push(object)
              votes.push(readVotes.filter(vote => vote.id === object.id)[0])
              break
            }
          }
          if (key === 'description') {
            const stringifiedOptions = JSON.stringify(object.description).toLowerCase()

            if (stringifiedOptions.includes(string)) {
              posts.push(object)
              votes.push(readVotes.filter(vote => vote.id === object.id)[0])
              break
            }
          }
        }

      })
      return posts
    }

    posts = searchStringInJSON(s, readPosts)

    res.send({ posts, votes })
  }

  else {
    const posts = readPosts
    const votes = readVotes
    res.send({ posts, votes })
  }

})

// app.post('/approve', (req, res) => {

//   if (admins.includes(req.body.user)) {
//     const posts = JSON.parse(fs.readFileSync('./data/posts.json'))

//     const updatedPosts = posts.map(post => {
//       if (post.id === req.body.id) {
//         return { ...post, approved: true }
//       }
//       return post;
//     })

//     fs.writeFileSync(`./data/posts.json`, JSON.stringify(updatedPosts))

//     res.send({ "status": 200 })
//   }
// })

// POST to the posts.json file
app.post('/post', upload.single("image"), (req, res) => {


  // Joi Schema = how the incoming input data is validated
  const schema = {
    user: Joi.string().max(23).required(),
    title: Joi.string().max(124).required(),
    duration: Joi.number().integer().min(1).max(30).required(),
    description: Joi.string().max(10001).required(), // apparently you need to add 1 extra character because it does not match front-end otherwise
    options: Joi.array().max(1025).required(),
    tags: Joi.string().max(124).required(),
    type: Joi.string().max(13).required(),
    votes: Joi.array().max(1025).required()
  }

  const { error } = Joi.validate(req.body, schema)

  if (error) {
    res.status(401).send(error.details[0].message)
    return
  } else {
    const post = new Post({ ...req.body, ...req.file })
    post.save()

    res.send({ "status": 200, "id": 0 })
  }
})


app.post('/vote', (req, res) => {
  // Joi Schema = how the incoming input data is validated
  const schema = {
    id: Joi.number().integer().max(23000).precision(0).required(),
    user: Joi.string().max(13).required(),
    vote: Joi.number().integer().max(10).precision(0).required()
  }

  const { error } = Joi.validate(req.body, schema)

  if (error) {
    res.status(401).send(error.details[0].message)
    return
  } else {
    Vote(req.body)
    res.send({ "status": 200 })
  }
})


app.put('/delete', (req, res) => {
  try {
    const posts = JSON.parse(fs.readFileSync(`./data/posts.json`))
    const votes = JSON.parse(fs.readFileSync(`./data/votes.json`))
    const imageToDelete = posts.filter(post => post.id === parseInt(req.body.id))
    const filteredPosts = posts.filter(post => post.id !== parseInt(req.body.id))
    const filteredVotes = votes.filter(vote => vote.id !== parseInt(req.body.id))

    // delete the image
    imageToDelete[0].image !== '' ? fs.unlinkSync('shield/uploads/' + imageToDelete[0].image) : null

    // delete the comments file
    fs.unlinkSync('./data/comments/#' + req.body.id + '.json')


    fs.writeFileSync(`./data/posts.json`, JSON.stringify(filteredPosts))
    fs.writeFileSync(`./data/votes.json`, JSON.stringify(filteredVotes))

    res.send({ "status": 200 })
  } catch (err) {
    console.error('Delete error: ' + err)
  }
})


app.get('/userinfo', async (req, res) => {
  const returnedObject = await userInfo(req.query.user, req.query.login)
  res.send(returnedObject)
})


app.post('/comment', (req, res) => {
  let commentData = {}
  commentData.id = req.body.commentid
  commentData.user = req.body.user
  commentData.text = req.body.comment
  //Joi Schema = how the incoming input data is validated
  const schema = {
    user: Joi.string().max(23).required(),
    postid: Joi.number().integer().max(23000).precision(0).required(),
    commentid: Joi.number().max(23000).precision(0).required(),
    type: Joi.string().max(10).required(),
    comment: Joi.string().min(2).max(1001).required()
  }

  const { error } = Joi.validate(req.body, schema)

  let commentsFile = []

  if (error) {
    res.status(401).send(error.details[0].message)
    return
  } else {
    if (fs.existsSync(`./data/comments/#${req.body.postid}.json`)) {
      commentsFile = JSON.parse(fs.readFileSync(`./data/comments/#${req.body.postid}.json`))
    } else { commentsFile = [] }

    let count = 1
    // Define the recursive function
    function countKeys(obj) {
      for (const key in obj) {
        if (key === "id") {
          count++;
        }

        const value = obj[key];
        if (typeof value === "object") {
          countKeys(value);
        }
      }
    }

    countKeys(commentsFile)

    commentData.id = count

    if (req.body.type === 'comment') {
      commentData.replies = []
      commentsFile.push(commentData)
    } else {
      const comment = commentsFile.find(comment => comment.id === req.body.commentid);
      comment.replies.push(commentData)
    }

    fs.writeFileSync(`./data/comments/#${req.body.postid}.json`, JSON.stringify(commentsFile))

    res.send({ "status": 200 })
  }
})

app.listen(9632)
