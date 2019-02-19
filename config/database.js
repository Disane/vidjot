// I think it's better to use environment variables and setup passwords and URL separately
// Make sure you define VIDJOT_URL environment variable as well as NODE_ENV!
// eg.:
// export VIDJOT_URL=[mlab_url_to_database]
// export NODE_ENV=production
if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURL: process.env.VIDJOT_URL}
}else{
    module.exports = {mongoURL: 'mongodb://localhost/vidjot-dev'}
}