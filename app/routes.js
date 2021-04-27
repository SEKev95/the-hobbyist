module.exports = function(app, passport, db, multer, ObjectId) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // HOME/FEED SECTION =========================
    app.get('/feed', isLoggedIn, function(req, res) {
        db.collection('posts').find().toArray((err, result) => {
          db.collection('comments').find().toArray((error, rslt) => { 
          db.collection('users').find({}).toArray((error2, result2)=>{
            console.log(result2)
            if (err) return console.log(err)
            res.render('feed.ejs', {
              user : req.user,
              posts: result,
              comment: rslt,
              people: result2
          })      
          })
          })
        })
    });
    app.get('/market', isLoggedIn, function(req, res) {
        db.collection('market').find().toArray((err, result) => {
          db.collection('comments').find().toArray((error, rslt) => {
            if (err) return console.log(err)
            res.render('market.ejs', {
              user : req.user,
              market: result,
              comment: rslt
            })
          })
        })
    });
    app.get('/setting', isLoggedIn, function(req, res) {
      db.collection('posts').find().toArray((err, result) => {
        db.collection('comments').find().toArray((error, rslt) => {
          if (err) return console.log(err)
          res.render('setting.ejs', {
            user : req.user,
            posts: result,
            comment: rslt
          })
        })
      })
  });
  app.get('/chat', isLoggedIn, function(req, res) {
    db.collection('posts').find().toArray((err, result) => {
      db.collection('messages').find().toArray((error, rslt) => {
        if (err) return console.log(err)
        res.render('chat.ejs', {
          user : req.user,
          posts: result,
          messages: rslt
        })
      })
    })
});
// message board routes ===============================================================

app.post('/messages', (req, res) => {
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/chat')
  })
})

app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})
app.put('/messages/down', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp - 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

// app.get('/newpost', isLoggedIn, function(req, res) {
//   db.collection('posts').find().toArray((err, result) => {
//     db.collection('comments').find().toArray((error, rslt) => {
//       if (err) return console.log(err)
//       res.render('newpost.ejs', {
//         user : req.user,
//         posts: result,
//         comment: rslt
//       })
//     })
//   })
// });

    // app.put('/feed', isLoggedIn, function(req, res){
    //     console.log(req.body)
    //     console.log(req.user)
    //     db.collection('messages').findOneAndUpdate({
    //         name: req.body.name,
    //         size: req.body.size,
    //         order: req.body.order,
    //         completedBy: null
    //     },{
    //         $set: {completedBy: req.user.local.username}
    //     }, {
    //         sort:{_id: -1}},
    //     (err, result) => {
    //         if (err) return res.send(err)
    //         console.log(`Order Completed`);
    //         res.send();
    //     }
    //     )
    // })

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// QP Posts routes ===============================================================
    app.get('/post', isLoggedIn, function(req, res) {
        db.collection('posts').findOne({_id: ObjectId(req.query.id)}, (err, result) => {
            db.collection('comments').find().toArray((error, rslt) => {
                if (err) return console.log(err)
                console.log(result, req.query.id);
                res.render('post.ejs', {
                    user : req.user,
                    post: result,
                    comments: rslt
                })
            })
        })
    });
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, 'public/img/')
        },
        filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + ".png")
        }
    })
    var upload = multer({storage: storage})
    app.post('/createPost', upload.single('file-to-upload'), (req, res) => {
      db.collection('posts').save({
        image: "img/" + req.file.filename,
        authorname: req.user.local.username,
        authoravi: req.user.local.profileImg,
        caption: req.body.caption,
        user: req.user._id,
        likes: 0,
        timestamp: req.body.timestamp
        }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/feed')
      })
    })
    //this is for market
    app.post('/createMarketPost', upload.single('marketUpload'), (req, res) => {
     console.log(req.file)
      
      db.collection('market').save({
        image: "img/" + req.file.filename,
        authorname: req.user.local.username,
        price: req.body.price,
        name: req.body.marketname,
        desc: req.body.desc,
        cate: req.body.cate,
        condi: req.body.condi,
        currency: req.body.currency,
        user: req.user._id,
        }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/market')
      })
    })
    // profile pic upload
    app.post('/uploadAvi', (req, res) => {
      if (req.files) {
        console.log(req.files);
        let file = req.files.file
        let fileName = file.name
        console.log(fileName);
        file.mv('public/assets/images/avatars/' + fileName, function(err) {
          if (err) {
            res.send(err)
          } else {
            res.redirect('/feed')
            // res.send("File Uploaded")
          }
        })
        let profileImg ="assets/images/avatars/" + fileName
        db.collection('users').findOneAndUpdate({
          _id: ObjectId(req.user._id)
        

        }, {
         $set:{
        local: {
          username : req.user.local.username,
          email : req.user.local.email,
          password : req.user.local.password,
          profileImg,
        },
        __v: 0

        } 

        }, {
          // if profile cant be found it would create a new profile which is why we set it to false
          upsert: false
        }, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
        })
      }
    })
    app.put('/updatePost', (req, res) => {
      db.collection('posts').findOneAndUpdate({
        image: req.body.image,
        caption: req.body.caption,
        user: req.user._id,
        likes: 0
        },{ $set:{ caption: req.body.newCaption } },{ sort:{_id: -1} }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database');
        res.redirect('/feed');
      })
    })

    app.delete('/delPost', (req, res) => {
      db.collection('posts').findOneAndDelete({
        _id: ObjectId(req.body.id)
        }, (err, result) => { console.log(req.body.id)
          console.log(typeof req.body.id)
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

    //USER'S POSTS
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('posts').find().toArray((err, result) => {
            for(post in result) {
                if(post.id != ObjectId(req.user.id))
                    delete result.post
            }
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            posts: result
          })
        })
    });
    // COMMENTS SECTION

    app.get('/comment', isLoggedIn, function(req, res) {
        db.collection('comments').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('post.ejs', {
            user : req.user,
            comments: result
        })
        })
    });
    app.get('/comment', isLoggedIn, function(req, res) {
      db.collection('comments').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('feed.ejs', {
          user : req.user,
          comments: result
      })
      })
  });
 
    app.post('/createComment', (req, res) => {
      console.log(req.body)
        const comingFromPage = req.headers['referer'].slice(req.headers['origin'].length);
        let oId = ObjectId(req.body.postId)
        db.collection('comments').insertOne({
            commentAuthorName: req.user.local.username,
            comment: req.body.comment, 
            poster: req.user._id, 
            post: oId,
            timestamp: req.body.timestamp

            
        }, (err, result) => {
            if (err) return res.send(err);
            console.log('Comment Created');
            res.redirect(comingFromPage);
        })
    })
    app.delete('/delComment', (req, res) => {
        db.collection('comments').findOneAndDelete({
          comment: req.body.comment,
          poster: req.user._id,
          post: req.body.postId
          }, (err, result) => {
          if (err) return res.send(500, err)
          res.send('Message deleted!')
        })
      })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/feed', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/feed', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/feed');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

