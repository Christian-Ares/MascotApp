const express     = require('express');
const router      = express.Router();
const bcrypt      = require('bcrypt')
const passport    = require('passport')
const ensureLogin = require('connect-ensure-login')


const User   = require('../models/User')
const Pet    = require('../models/Pet')
const Adopt  = require('../models/Adopt')


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
  res.render('newPet')
});

router.post('/newPet', checkForAuthentification, (req, res, next)=>{

  console.log(req.body)

  const newPet = req.body

  Pet.create(newPet)
  .then(()=>{
      res.redirect("/newPet")
  })
  .catch((err)=>{
      res.send(err)
  })
})

router.get('/singlePet/:id', (req, res, next)=>{

  const petID = req.params.id;

  Pet.findById(petID)
  .then((result)=>{
      res.render('singlePet', result);
  })
  .catch((err)=>{
      console.log(err);
      res.send(err);
  }); 
});

//ALL PETS
router.get('/allPets', checkForAuthentification, (req, res)=>{
  Pet.find({})
  .then((pets)=>{
    res.render('allPets', {pets})
  })
  .catch((err)=>{
    res.sendr(err)
  })
})

//EDIT PETS

router.get('/editPet/:id', checkForAuthentification, (req, res, next)=>{

  const id = req.params.id;

  Pet.findById(id)
  .then((result)=>{
      res.render('editPet', result);
  })
  .catch((err)=>{
      console.log(err);
      res.send(err);
  });
});

router.post('/editPet/:id', checkForAuthentification, (req, res)=>{
 
  const id = req.params.id

  const editedPet = req.body

 Pet.findByIdAndUpdate(id, editedPet)
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

router.get('/events', (req, res)=>{
  res.render('events')
})

//ADOPTIONS


router.get('/adoptions', (req, res)=>{
  Adopt.find({})
  .then((adopts)=>{
    console.log(adopts)
    res.render('adoptions', {adopts})
  })
  .catch((err)=>{
    res.send(err)
  })
})

router.post('/adoptions', (req, res)=>{

  const newAdopt = req.body

  Adopt.create(newAdopt)
  .then(()=>{
      res.redirect("/adoptions")
  })
  .catch((err)=>{
      res.send(err)
  })
})


module.exports = router;