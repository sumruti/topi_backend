const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const request = require("request");
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'asset')));
var moment = require('moment');
const admin = require('firebase-admin');

let serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://english-speaking-57bac.firebaseio.com"
});


let db = admin.firestore();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
  // Pass to next layer of middleware
  next();
});



/*ADD Topics*/

/*ADD Topics*/

app.post('/create_topic', function(req, res){


  let addDoc = db.collection('topics').add({
    name: req.body.Name,
    imageLink: req.body.ImageLink,
    group: req.body.Group,
    user_id: req.body.user_id,
  }).then(ref => {
     res.send({status:true,ref:ref})
  });

});



/*Register*/
app.post('/register', function(req, res){

    let users = db.collection('users');
    let check_user_email = users.where('email', '==', req.body.email).get()
    check_user_email.then(top => {
        
         var data = [];

         if (top.empty) {

           let addDoc = db.collection('users').add({
                email: req.body.email,
                pass: req.body.pass,
                role:''
              }).then(ref => {
                 res.send({status:true,id:ref.id})
              });
            
        } else{

          res.send({status:false,message:"Email already exists."})
            return;
           

        }
      })
   
})

/*Register*/
app.post('/login', function(req, res){

   let lessons = db.collection('users');
    let check_user_email = lessons.where('email', '==', req.body.email).get()
    check_user_email.then(top => {
        
         var data = [];

         if (top.empty) {
          res.send({status:false,data:data})
          return;
        } else{

            let check_user_pass = lessons.where('pass', '==', req.body.pass).get()
             check_user_pass.then(pass => {

              if (pass.empty) {
                  res.send({status:false,data:data})
                  return;
               }else{

                 top.forEach(doc => {
                   data.push({
                    role : doc.data().role,
                    email : doc.data().email,
                    id:doc.id
                   })
                });
                 res.send({status:true,data:data})
               }
              
             })

               

        } 

       

       
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
})




/*Login*/
/*app.post('/login', function(req, res){

   console.log(req.body)
    let addDoc = db.collection('users').add({
      email: req.body.email,
      pass: req.body.pass,
      role:''
    }).then(ref => {
       res.send({status:true,ref:ref})
    });
})*/


/*Get Users*/

app.post('/get_users', function(req, res){
  let get_doc = db.collection('users').get();

    get_doc.then(top => {
      if (top.empty) {
        console.log('No matching documents.');
        return;
      }  
       var data = [];

      top.forEach(doc => {
          if(doc.data().role == ''){

             data.push({
              id:doc.id,
              email:doc.data().email,
            })

          }
          

        
       

      });

      res.send({status:true,data:data})
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });

});

/*Get Topics*/

app.post('/get_topics', function(req, res){
  if(req.body.user_id != undefined){

       let query = db.collection('topics').get();
       //let query = get_doc.where('user_id', '==', req.body.user_id).get()


        query.then(top => {
          if (top.empty) {
            console.log('No matching documents.');
            return;
          }  
           var data = [];

          top.forEach(doc => {

             if(req.body.user_role!="admin"){ 
              if(doc.data().users){
                var all_users = doc.data().users
                if (all_users.indexOf(req.body.user_id) > -1) {

                    data.push({
                      id:doc.id,
                      group:doc.data().group,
                      imageLink:doc.data().imageLink,
                      name:doc.data().name,
                    })
                    
                }
                   
              }else{

                  if(req.body.user_id==doc.data().user_id){
                      data.push({
                        id:doc.id,
                        group:doc.data().group,
                        imageLink:doc.data().imageLink,
                        name:doc.data().name,
                      })

                  }
                   

              }
            }else{

              if(req.body.user_id==doc.data().user_id){
                      data.push({
                        id:doc.id,
                        group:doc.data().group,
                        imageLink:doc.data().imageLink,
                        name:doc.data().name,
                      })

                  }

            }
         
          });

          res.send({status:true,data:data})
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });


  }
 
});


/*Add Lession*/

app.post('/add_lession', function(req, res){
  let addDoc = db.collection('lessons').add({
    topic_id: req.body.topic_id,
    lesson_name: req.body.Lesson,

  }).then(ref => {
     res.send({status:true,ref:ref})
  });

});

/*Get Lession*/

app.post('/get_lession', function(req, res){
  console.log(req.body.topic_id);
  let lessons = db.collection('lessons');
  let query = lessons.where('topic_id', '==', req.body.topic_id).get()
  console.log(req.body.topic_id);
    query.then(top => {
      if (top.empty) {
        console.log('No matching documents.');
        return;
      }  
       var data = [];

      top.forEach(doc => {
         data.push({
          lesson_name : doc.data().lesson_name,
          topic_id : doc.data().opic_id,
          id:doc.id
         })
      });

      res.send({status:true,data:data})
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });

});



/*Delete lession*/
app.post('/delete_lession', function(req, res){

     db.collection('lessons').doc(req.body.lession_id).delete();
     res.send({status:true})

})


/*Update lession*/
app.post('/update_lession', function(req, res){

    let data = {
        lesson_name: req.body.lession_name,
        topic_id: req.body.topic_id
      };

    db.collection('lessons').doc(req.body.lession_id).set(data);
    res.send({status:true})
})


/*Add lesson sentence*/
app.post('/add_lesson_sentence', function(req, res){

     let addDoc = db.collection('Sentence').add({
        name: req.body.name,
        language: req.body.language,
        sentence: req.body.sentence,
        lesson_id: req.body.lesson_id,

      }).then(ref => {
         res.send({status:true,ref:ref})
      });
})

/*Get sentence*/
app.post('/get_Sentence', function(req, res){
  console.log(req.body.lesson_id);
  let Sentence = db.collection('Sentence');
  let query = Sentence.where('lesson_id', '==', req.body.lesson_id).get()
    query.then(top => {
      if (top.empty) {
        console.log('No matching documents.');
        return;
      }  
       var data = [];

      top.forEach(doc => {
         data.push({
          name : doc.data().name,
          language : doc.data().language,
          sentence : doc.data().sentence,
          id:doc.id
         })
      });

      res.send({status:true,data:data})
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });

});

/*Delete sentence*/
app.post('/delete_Sentence', function(req, res){

     db.collection('Sentence').doc(req.body.Sentence_id).delete();
     res.send({status:true})

});

/*Update sentence*/
app.post('/update_Sentence', function(req, res){

    let data = {
          name : req.body.name,
          language : req.body.language,
          sentence : req.body.sentence,
          lesson_id:req.body.lesson_id
         
      };

    db.collection('Sentence').doc(req.body.Sentence_id).set(data);
    res.send({status:true})
})

/*Get unique groups*/
app.post('/get_groups', function(req, res){
 

       let get_doc = db.collection('topics').get();


        get_doc.then(top => {
          if (top.empty) {
            console.log('No matching documents.');
            return;
          }  
           var data = [];

          top.forEach(doc => {
            if(doc.data().group){
               data.push({
                  id:doc.id,
                  group:doc.data().group,
                  users:doc.data().users,
                })
            }

          });

          res.send({status:true,data:data})
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });



 
});

/*Get unique groups*/
app.post('/assign_groups', function(req, res){

      console.log(req.body.group);
      var groups = req.body.group;
       groups.forEach(g => {
       
         console.log(g);
     

    

       let get_doc = db.collection('topics');
       let query = get_doc.where('group', '==', g).get()


        query.then(top => {
          if (top.empty) {
            console.log('No matching documents.');
            return;
          }  
           var data = [];

          top.forEach(doc => {

              if(doc.data().users){
                var all_users = doc.data().users.split(',');

                console.log(all_users);
                if (all_users.indexOf(req.body.user_id) > -1) {
                    console.log('yes');
                }else{
                   var users = doc.data().users +','+req.body.user_id;
                   let data = {
                       group: doc.data().group,
                      imageLink: doc.data().imageLink,
                      name: doc.data().name,
                      user_id: doc.data().user_id,
                      users :users
                    };

                     db.collection('topics').doc(doc.id).set(data);
                }
               

              }else{
                 let data = {
                    group: doc.data().group,
                    imageLink: doc.data().imageLink,
                    name: doc.data().name,
                    user_id: doc.data().user_id,
                    users :req.body.user_id
                  };
                   db.collection('topics').doc(doc.id).set(data);


              }
              console.log(data);

              return false

         
             
           
          
             console.log(doc.data().group);
            
          });

          //res.send({status:true,data:data})
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
        })  
})

app.post('/isadmin', function(req, res){
  console.log(req.body)

  return false
     let lessons = db.collection('users').doc(req.body.users_id).get();
    lessons.then(top => {
      c

    })
})



const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server started on port " + port));
