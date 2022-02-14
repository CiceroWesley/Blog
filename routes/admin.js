const express = require('express')
const mongoose = require('mongoose')

require('../models/categoria')
require('../models/postagens')
const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')
const router = express.Router()
const {eAdmin} = require('../helpers/eAdmin')



router.get('/',eAdmin, (req,res)=>{
  res.render('admin/index')
})

router.get('/posts', eAdmin, (req,res)=>{
  res.send('pagina de posts')
})

router.get('/categorias',eAdmin, (req,res) =>{
  Categoria.find().sort({data: 'desc'}).then((categorias) => {
    res.render('admin/categorias', {categorias: categorias})
  }).catch((err) =>{
    req.flash('error_msg','Ocorreu um erro ao mostrar as categorias.')
    res.redirect('/admin')
  })
  
})

router.get('/categorias/add',eAdmin, (req,res) =>{
  res.render('admin/addcategorias')
})

router.post('/categorias/nova',eAdmin, (req,res) =>{

  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
  }
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto:"Slug inválido"})
  }
  if(req.body.nome.length < 2){
    erros.push({texto:"Nome muito pequeno"})
  }
  if(erros.length > 0){
    
    res.render('admin/addcategorias',{erros: erros})
  }

  else{
    const novaCateogira = {
      nome: req.body.nome,
      slug: req.body.slug
    }
    new Categoria(novaCateogira).save().then(() =>{
      req.flash("success_msg",'Categoria cadastrada com sucesso')
      res.redirect('/admin/categorias')
    }).catch((err) =>{
      req.flash("error_msg",'Erro ao cadastrar a categoria')
      res.redirect('/admin')
    })
  }
})

router.get('/categorias/edit/:id',eAdmin, (req,res) =>{
  Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
    res.render('admin/editcategoria', {categoria: categoria})
  }).catch((err)=>{
    req.flash('error_msg','Categoria não existe')
    res.redirect('/admin/categorias')
  })
  
})

router.post('/categorias/edit',eAdmin, (req,res)=>{
  Categoria.findOne({_id:req.body.id}).then((categoria) =>{
    categoria.nome = req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(()=>{
      req.flash('success_msg','Categoria editada com sucesso')
      res.redirect('/admin/categorias')
    }).catch((err)=>{
      req.flash('error_msg','Ocorreu um erro ao editar a categoria')
      res.redirect('/admin/categorias')
    })

  }).catch((err)=>{
    req.flash('error_msg','Ocorreu um erro ao editar a categoria')
    res.redirect('/admin/categorias')
  })
})

router.post('/categorias/deletar',eAdmin, (req,res)=>{
  Categoria.deleteOne({_id: req.body.id}).then(()=>{
    req.flash('success_msg','Categoria deletada com sucesso.')
    res.redirect('/admin/categorias')
  }).catch((error)=>{
    req.flash('error_msg','Erro ao deletar categoria.')
    res.redirect('/admin/categorias')
  })
})

router.get('/postagens',eAdmin, (req,res)=>{
  Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
    res.render('admin/postagens',{postagens: postagens})
  }).catch((err)=>{
    req.flash('error_msg', err +'Ocorreu um erro ao mostrar as postagens.')
    res.redirect('/admin')
  })
  
})

router.get('/postagens/add',eAdmin, (req,res)=>{
  Categoria.find().lean().then((categorias)=>{
    res.render('admin/addpostagem', {categorias : categorias})
  }).catch((err)=>{
    req.flash('error_msg','Erro ao mostrar o formulário')
    res.redirect('/admin')
  })
})

router.post('/postagens/nova',eAdmin, (req,res)=>{
  //poderia fazer a validação novamente

  var erros = []

  if(req.body.categoria == "0"){
    erros.push({texto: 'Categoria invalida, cadastre uma categoria valida'})
  }
  if(erros.length > 0){
    res.render('/addpostagem',{erros: erros})
  }else{
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }
    new Postagem(novaPostagem).save().then(()=>{
      req.flash('success_msg','Postagem criada com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err)=>{
      req.flash('error_msg', req.body.conteudo +err +'Erro ao criar postagem')
      res.redirect('/admin/postagens')
    })
  }


})

router.get('/postagens/edit/:id',eAdmin,(req,res)=>{
  Postagem.findOne({_id: req.params.id}).then((postagens)=>{
    Categoria.find().then((categorias)=>{
      res.render('admin/editpostagens',{categorias: categorias, postagens: postagens })
    }).catch((err)=>{
      req.flash('error_msg','Erro ao carregar o formulario categoria')
      res.redirect('/admin/postagens')
    })
  }).catch((err)=>{
    req.flash('error_msg','Ocorreu um erro ao carregar o formulario postagem')
    res.redirect('/admin/postagens')
  })
})

router.post('/postagens/edit',eAdmin,(req,res)=>{
  Postagem.findOne({_id:req.body.id}).then((postagem)=>{
    postagem.titulo = req.body.titulo
    postagem.slug = req.body.slug
    postagem.descricao = req.body.descricao
    postagem.conteudo = req.body.conteudo
    postagem.categoria = req.body.categoria

    postagem.save().then(()=>{
      req.flash('success_msg','Postagem editada com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err)=>{
      req.flash('error_msg','Erro interno')
      res.redirect('/admin/postagens')
    })

  }).catch((err)=>{
    req.flash('error_msg','Erro ao editar a postagem')
    res.redirect('/admin/postagens')
  })
})

router.get('/postagens/deletar/:id',eAdmin,(req,res)=>{
  Postagem.deleteOne({_id:req.params.id}).then(()=>{
    req.flash('success_msg','Postagem deletada')
    res.redirect('/admin/postagens')
  }).catch((err)=>{
    req.flash('error_msg','Erro ao deletar postagem')
    res.redirect('/admin/postagens')
  })
})

module.exports = router 