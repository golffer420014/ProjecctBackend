const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked //ตรวจสอบว่า JWT ถูกยกเลิกหรือไม่ โดยใช้ข้อมูลจาก payload
    }).unless({
        path: [
            // (.*)สามารถเข้าถึงข้อมูลได้ทั้งหมดที่อยู่หลัง path เช่น http://localhost:5000/api/v1/products/get/featured/1
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/category(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            { url: /\/api\/v1\/community(.*)/, methods: ['GET', 'OPTIONS', 'POST'] },
            `${api}/users/login`,
            `${api}/users/register`,
            // `${api}/users`,
        ]
    })
}

async function isRevoked(req, payload, done) {
    try{
        if (!payload.isAdmin) {
            done(null, true)
        }

        done();
    }catch(err){
        console.log('isRevoked not Admin')
    }
}



module.exports = authJwt