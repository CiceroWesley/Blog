//carregando modulos
const express = require('express')
const { engine } = require('express-handlebars')
const mongoose = require('mongoose')
const app = express()
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const path = require('path')
const { application } = require('express')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/postagens')
require('./models/categoria')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')

const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')

//configurações
//sessão
app.use(session({
  secret: 'node',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//middleware
app.use((req,res,next)=>{
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})


app.use(express.urlencoded({extended: true}))
app.use(express.json())

  //handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}))
app.set('view engine','handlebars')
  //mongoose
  mongoose.Promise = global.Promise
  mongoose.connect(db.mongoURI).then(()=>{
    console.log('Conectado com sucesso')
  }).catch((err)=>{
    console.log('Erro na conexão: ' + err)
  })
//public

app.use(express.static(path.join(__dirname,'public')))

/*
app.use((req,res,next) =>{
  console.log('MIDDLEWARE')
  next()
})
*/
//rotas
//rota principal
app.get('/', (req,res) =>{
  Postagem.find().populate('categoria').sort({data:'desc'}).then((postagens)=>{
    res.render('index',{postagens:postagens})
  }).catch((err)=>{
    req.flash('error_msg','Houve um erro interno')
    res.redirect('/404')
  })
  
})

app.get('/404',(req,res)=>{
  res.send('Erro 404')
})

app.get('/postagem/:slug',(req,res)=>{
  Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
    if(postagem){
      res.render('postagem/index',{postagem:postagem})
    }else{
      req.flash('error_msg','Esta postagem não existe')
      res.redirect('/')
    }
  }).catch((err)=>{
    req.flash('error_msg','Houve um erro interno')
    res.redirect('/')
  })
})

app.get('/categorias', (req,res)=>{
  Categoria.find().then((categorias)=>{
    res.render('categorias/index', {categorias: categorias})
  }).catch((err)=>{
    req.flash('error_msg','Erro interno ao listar as categorias')
    res.redirect('/')
  })
})

app.get('/categorias/:slug',(req,res)=>{
  Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
    if(categoria){
      Postagem.find({categoria: categoria._id}).then((postagens)=>{
        res.render('categorias/postagens',{postagens:postagens, categoria:categoria})

      }).catch((err)=>{
        req.flash('error','Houve um erro ao listar as postagens')
        res.redirect('/')
      })
    }else{
      req.flash('error_msg','Esta categoria não existe')
      res.redirect('/')
    }
  }).catch((err)=>{
    req.flash('error_msg','Erro ao carregar as categorias')
    res.redirect('/')
  })
})

//grupo de rotas
app.use('/admin',admin)
app.use('/usuarios',usuarios)
//outros
const PORT = process.env.PORT || 8081
app.listen(PORT, () =>{
  console.log('Servidor rodando')
})