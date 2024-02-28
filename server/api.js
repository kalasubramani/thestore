const {
  fetchProducts,
  fetchOrders,
  fetchLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  updateOrder,
  fetchReviews,
  addProduct,
  authenticate,
  findUserByToken
} = require('./db');

const express = require('express');
const app = express.Router();

//middleware
const isLoggedIn = async (req,res,next)=>{
try{
  const user = await findUserByToken(req.headers.authorization);
  req.user=user; 
  //go to next part of execution in a route
  next();
}catch(error){
  next(error)
}
}

app.get('/products', async(req, res, next)=> {
  try {
    res.send(await fetchProducts());
  }
  catch(ex){
    next(ex);
  }
});

app.put('/orders/:id', async(req, res, next)=> {
  try {
    res.send(await updateOrder({ ...req.body, id: req.params.id}));
  }
  catch(ex){
    next(ex);
  }
});

app.get('/orders', async(req, res, next)=> {
  try {
    res.send(await fetchOrders());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/lineItems', async(req, res, next)=> {
  try {
    res.send(await fetchLineItems());
  }
  catch(ex){
    next(ex);
  }
});

app.post('/lineItems', async(req, res, next)=> {
  try {
    res.send(await createLineItem(req.body));
  }
  catch(ex){
    next(ex);
  }
});

app.put('/lineItems/:id', async(req, res, next)=> {
  try {
    res.send(await updateLineItem({...req.body, id: req.params.id}));
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/lineItems/:id', async(req, res, next)=> {
  try {
    await deleteLineItem({ id: req.params.id });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

//fetch all reviews
app.get('/reviews', async(req, res, next)=> {
  try {
    res.send(await fetchReviews());
  }
  catch(ex){
    next(ex);
  }
});

//add new product
app.post('/products',async(req,res,next)=>{
  try{
      res.send(await addProduct(req.body));
  }catch(ex){
   next(ex)
  }
 
 })

 //login page
 app.post('/login',async (req,res,next)=>{
  try{
   const response=await authenticate(req.body);
   console.log("/login response", response);
   //no rows returned
  // if(!response.rows.length){
  //   const error = Error("Bad credentials")
  //   error.status = 401;
  //   throw error;
  // }
   res.send({token:response});

  }catch(Error){
    next(Error)
  }
 })

 app.get('/me',isLoggedIn,async(req,res,next)=>{
  try{     
    console.log("api.js /me",user)
    res.send(req.user);
  }catch(Error){
    next(Error)
  }
 })

module.exports = app;
