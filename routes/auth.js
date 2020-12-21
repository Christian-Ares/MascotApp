const express     = require('express');
const router      = express.Router();
const bcrypt      = require('bcrypt')
const passport    = require('passport')
const ensureLogin = require('connect-ensure-login')
const uploadCloud = require('../config/cloudinary')

const User   = require('../models/User')
const Pet    = require('../models/Pet')
const Adopt  = require('../models/Adopt')

//LOG IN, SIGN UP, LOG OUT, AUTH
router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res)=>{

  const{username, password} = req.body

  if(username === '' || password === ''){
    res.render('signup', {errorMessage: 'You have to fill all the fields'})
    return
  }

  User.findOne({username})

  .then((result)=>{
    if(!result){
        bcrypt.hash(password, 10)
        .then((hashedPassword)=>{
           User.create({username, password: hashedPassword})
          .then(()=>res.redirect('/'))
        })
      } else {
        res.render('signup', {errorMessage: 'This user already exists. Please, try again.'})
      }
    })
    .catch((err)=>res.send(err))
})      

router.get('/login', (req, res)=>{
  res.render('auth/login', {errorMessage: req.flash('error')})
})

router.post('/login', passport.authenticate("local", {
  successRedirect: '/allPets',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

router.get('/', ensureLogin.ensureLoggedIn(), (req, res)=>{

  res.render('allPets', {user: req.user.username})
  })
  
  router.get('/logout', (req, res)=>{
    req.logout()
    res.redirect('/')
  })

  const checkForAuthentification = (req, res, next)=>{
    if(req.isAuthenticated()){
      return next()
    } else{
      res.redirect('login')
    }
    }

//ADD PET
router.get('/newPet', checkForAuthentification, (req, res, next)=>{
  const user = req.user
  res.render('newPet', {user})
});

router.post('/newPet',  uploadCloud.single('Image_path'), (req, res, next)=>{
  const userID = req.user._id
  const {name, chipId, age, gender, hairColor} = req.body
  const Image_name = req.file ? req.file.originalname : 'avatar.jpg'
  const Image_path = req.file ? req.file.path : '/images/avatar.jpg'

  Pet.create({name, chipId, age, gender, hairColor, Image_name, Image_path, userID})
  .then(()=>{
      res.redirect('/newPet')
  })
  .catch((err)=>{
      res.send(err)
  })
})

router.get('/singlePet/:id', (req, res, next)=>{
  const user = req.user
  const petID = req.params.id;

  Pet.findById(petID)
  .then((result)=>{
   
      res.render('singlePet', {result, user, petID});
  })
  .catch((err)=>{
      console.log(err);
      res.send(err);
  }); 
});

//ALL PETS
router.get('/allPets', checkForAuthentification, (req, res)=>{
  const userID = req.user._id
  const user = req.user
  Pet.find({userID})
  .then((pets)=>{

    res.render('allPets', {pets, user})
  })
  .catch((err)=>{
    res.sendr(err)
  })
})

//EDIT PETS

router.get('/editPet/:id', checkForAuthentification, (req, res, next)=>{
  const user = req.user
  const id = req.params.id;

  Pet.findById(id)
  .then((result)=>{
      res.render('editPet', {result, user});
  })
  .catch((err)=>{
      console.log(err);
      res.send(err);
  });
});

router.post('/editPet/:id', uploadCloud.single('Image_path'), (req, res)=>{
 
  const id = req.params.id

  let {name, chipId, age, gender, hairColor, att_name, att_path} = req.body
  const Image_name = req.file ? req.file.originalname : att_name
  const Image_path = req.file ? req.file.path : att_path

  
 Pet.findByIdAndUpdate(id, {name, chipId, age, gender, hairColor, Image_name: Image_name, Image_path: Image_path})
 .then(()=>{
   res.redirect(`/singlePet/${id}`)
 })
 .catch((err)=>{
   res.send(err)
 })
})

//DELETE

router.post('/deletePet/:id', (req, res, next)=>{

  const id = req.params.id;

  Pet.findByIdAndDelete(id)
  .then(()=>{
      res.redirect('/allPets');
  })
  .catch((err)=>{
      console.log(err);
      res.send(err);
  });
});
 
//ADOPTIONS

router.get('/adoptions', (req, res)=>{
  const user = req.user
  Adopt.find({})
  .then((adopts)=>{
    res.render('adoptions', {adopts, user})
  })
  .catch((err)=>{
    res.send(err)
  })
})

router.post('/adoptions', uploadCloud.single('image_path, image_name'), (req, res)=>{

  const {Name, breed, birthDate, Gender} = req.body
  const image_name = req.file ? req.file.originalname : 'avatar.jpg'
  const image_path = req.file ? req.file.path : '/images/avatar.jpg'

  Adopt.create({Name, breed, birthDate, Gender, image_name, image_path})
  .then(()=>{
      res.redirect("/adoptions")
  })
  .catch((err)=>{
      res.send(err)
  })
})

router.get('/adoptions/:id', (req, res, next)=>{

  const user = req.user
  const adoptID = req.params.id;

  Adopt.findById(adoptID)
  .then((result)=>{
      res.render('singleAdopt', {user, result});
  })
  .catch((err)=>{
      console.log(err);
      res.send(err);
  }); 
});

router.get('/editAdopt/:id', (req, res)=>{
  const user = req.user
  const id = req.params.id
  Adopt.findById(id)
  .then((result)=>{
     res.render('editAdopt', {user, result})
  })
  .catch((err)=>{
    console.log(err)
    res.send(err)
  })
})

router.post('/editAdopt/:id', uploadCloud.single('image_path'), (req, res)=>{
 
  const id = req.params.id
  

  let {Name, breed, birthDate, Gender, att_name, att_path} = req.body
  const image_name = req.file ? req.file.originalname : att_name
  const image_path = req.file ? req.file.path : att_path

  
 Adopt.findByIdAndUpdate( id, {Name, breed, birthDate, Gender, image_name: image_name, image_path: image_path})
 .then(()=>{
   res.redirect(`/adoptions/${id}`)
 })
 .catch((err)=>{
   res.send(err)
 })
})

router.post('/deleteAdopt/:id', (req, res, next)=>{

  const id = req.params.id;

  Adopt.findByIdAndDelete(id)
  .then(()=>{
      res.redirect('/adoptions');
  })
  .catch((err)=>{
      console.log(err);
      res.send(err);
  });
});

module.exports = router;