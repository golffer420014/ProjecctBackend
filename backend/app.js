const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*',cors())

// Middleware
app.use(bodyParser.json()); 
app.use(morgan('tiny'));
// app.use(authJwt());
// __dirname คือตัวแปรพิเศษใน Node.js ที่ระบุโฟลเดอร์ปัจจุบันของไฟล์ JavaScript ที่รันอยู่.
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
console.log('current folder = ', __dirname + '/public/uploads')
app.use(errorHandler); 




//router
const productRouter = require('./routers/product');
const categoryRouter = require('./routers/category');
const usersRouter = require('./routers/users');
const orderRouter = require('./routers/order');
const communityRouter = require('./routers/community')
const eventRouter = require('./routers/event')
const reviewRouter = require('./routers/review')

const api = process.env.API_URL; 
 
// http://localhost:3000/api/v1/product
app.use(`${api}/products`, productRouter)
// http://localhost:3000/api/v1/category
app.use(`${api}/category`, categoryRouter)
// http://localhost:3000/api/v1/users
app.use(`${api}/users`, usersRouter)
// http://localhost:3000/api/v1/order
app.use(`${api}/order`, orderRouter)
// http://localhost:3000/api/v1/community 
app.use(`${api}/community`, communityRouter) 
// http://localhost:3000/api/v1/event 
app.use(`${api}/event`, eventRouter) 
// http://localhost:3000/api/v1/review 
app.use(`${api}/review`, reviewRouter) 


// http://localhost:3000/api/v1/imageProducts 
// app.use(`${api}/imageProducts`, imageProductsRouter)

mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    dbName : 'travel'
})
.then(()=>{
    console.log('database connection is ready...')
}).catch((err)=>{
    console.log('connect DB error',err)
})

app.listen(3000, ()=>{
    // console.log(api);
    console.log('server is runnimg is http://localhost:3000');
})

