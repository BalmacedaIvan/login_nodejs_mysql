// 1) Invocamos express
const express = require('express');
const app = express();

// 2) Seteamos urlEncoded para capturar los datos del formulario: Como vamos a necesitar capturar datos de formularios (login tiene dos inputs), necesitamos que los inputs no retornen como variables no definidas y tambien poder trabajar con JSON
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// 3) Invocamos dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// 4) Seteamos el directorio public(css)
app.use('/resources', express.static('public'));

// Via de acceso absoluta al directorio. Esto se utiliza para que los archivos sean bien enrutados si necesitamos mudar el proyecto. dirname es una variable de entorno de node
app.use('/resources', express.static(__dirname + '/public'));
console.log('---- UBICACION DEL PROYECTO: ' + __dirname);


// 5) Seteamos el motor de plantillas
app.set('view engine', 'ejs');

// 6) Invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

// 7) Control de variables de sesion
const session = require('express-session');
app.use(session({
    secret: 'secret', // contraseña
    resave: true, // Forma de almacenamiento de sesion
    saveUninitialized: true 
}));

// 8) Ahora vamos a crear la Base de Datos en workbench .env - Una vez creada, ahora la requerimos desde app
const connection = require('./database/db');

// 9) Establecemos las rutas
    app.get('/login', (req, res)=>{
        res.render('login');
    });

    app.get('/register', (req, res)=>{
        res.render('register');
    })

// 10) Registro
    app.post('/register', async (req, res)=>{
        const user = req.body.user;
        const name = req.body.name;
        const rol = req.body.rol;
        const pass = req.body.pass;

        let passwordHaash = await bcryptjs.hash(pass, 8) //ciclo de 8 iteraciones

        connection.query('INSERT INTO users SET ?', {user:user, name:name, rol:rol, pass:passwordHaash}, async(error, results)=>{
            if(error){
                console.log(error)
            }else{
                console.log('REGISTRO EXITOSO')
                res.render('register', {
                    alert: true,
                    alertTitle: 'Registration',
                    alertMessage: 'Successful Registration',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                })
            }
        })
    })



// 11) Autenticacion
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);

    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login', {
                    alert: true,
                    alertTitle: 'Error',
                    alertMessage: 'Usuario y/o password incorrecto',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }else{

                req.session.loggedin = true; // Variable de session, para autenticar en las demas paginas la sesion

                req.session.name = results[0].name //Registro de sesion en una variable que tambien guarde el nombre encontrado en la tabla.

                res.render('login', {
                    alert: true,
                    alertTitle: 'Conexion exitosa',
                    alertMessage: '¡Login correcto!',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                })
            };
        })
    }else{
        // En caso de querer loguear solo nombre de usuario o solo password
        res.render('login', {
            alert: true,
            alertTitle: '¡Advertencia!',
            alertMessage: 'Por favor, ingresa un usuario y/o contraseña',
            alertIcon: 'warning',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'login'
        })
    }
})

// results es un resultado de tipo array, por lo tanto, utilizamos results.length para corroborar cuantos resultados fueron validados. Tambien usamos results[0] para indicar que usaremos el primer o unico objeto obtenido del array results, que seria el resultado que queremos traer de la base de datos.


// 12) Autenticacion de paginas
app.get('/', (req, res)=>{
    
    if(req.session.loggedin){
        res.render('index', {
            login: true,
            name: req.session.name
        });
    }else{
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesion'
        })
    }
})

// 13) Logout
app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

    



app.listen(3000, ((req, res)=>{
    console.log('---- SERVER RUNNING IN http://localhost:3000 -----');
}));
