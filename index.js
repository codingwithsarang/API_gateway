const express = require('express')
const morgan = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit')
const axios = require('axios')

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 5, // Limit each IP to 5 requests per `window` (here, per 2 minutes).
})
const app = express()

const PORT = 3005

app.use(morgan('combined'))

app.use(limiter)

const checkAuth = async(req,res,next)=>{
     try {
        const result = await axios.get('http://localhost:3001/api/v1/isauthenticated',{
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
         })
        if(result.data.success){
           return next()
        }else{
           return res.status(401).json({
                message: 'User is not authenticated',
                success: false,
            })
        }
     } catch (error) {
        console.log('checkauth error',error)
        return res.status(401).json({
            message: 'User is not authenticated'
        })
     }
        
  
}

app.use(
    '/bookingservice',
    checkAuth,
    createProxyMiddleware({
      target: 'http://localhost:3002/',
      changeOrigin: true,
    }),
  );

app.get('/home',(req,res)=>{
    return res.json({
        message: 'Home Ok'
    })
})

app.listen(PORT,()=>{
    console.log(`server is started on port ${PORT}`)
})