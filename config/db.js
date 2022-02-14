if(process.env.NODE_ENV == 'production'){
  module.exports = {mongoURI: 'mongodb+srv://User:password@cluster0.peoda.mongodb.net/Cluster0?retryWrites=true&w=majority'}
}else{
  module.exports = {mongoURI:'mongodb://localhost/blogapp'}
}
