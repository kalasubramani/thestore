const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_store_db');
const { v4 } = require('uuid');
const uuidv4 = v4;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const fetchLineItems = async()=> {
  const SQL = `
    SELECT *
    FROM
    line_items
    ORDER BY product_id
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async()=> {
  const SQL = `
    SELECT *
    FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createProduct = async(product)=> {
  const SQL = `
    INSERT INTO products (id, name,price,description)
    VALUES($1, $2,$3,$4)
    RETURNING *
  `;
  const response = await client.query(SQL, [ uuidv4(), product.name,product.price,product.description]);
  return response.rows[0];
};

//if item is in cart, do not update line item
const ensureCart = async(lineItem)=> {
  let orderId = lineItem.order_id;
  if(!orderId){
    const SQL = `
      SELECT order_id 
      FROM line_items 
      WHERE id = $1 
    `;
    const response = await client.query(SQL, [lineItem.id]);
    orderId = response.rows[0].order_id;
  }
  const SQL = `
    SELECT * 
    FROM orders
    WHERE id = $1 and is_cart=true
  `;
  const response = await client.query(SQL, [orderId]);
  if(!response.rows.length){
    throw Error("An order which has been placed can not be changed");
  }
};
const updateLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  SQL = `
    UPDATE line_items
    SET quantity = $1
    WHERE id = $2
    RETURNING *
  `;
  if(lineItem.quantity <= 0){
    throw Error('a line item quantity must be greater than 0');
  }
  const response = await client.query(SQL, [lineItem.quantity, lineItem.id]);
  return response.rows[0];
};

const createLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  const SQL = `
  INSERT INTO line_items (product_id, order_id, id) 
  VALUES($1, $2, $3) 
  RETURNING *
`;
 response = await client.query(SQL, [ lineItem.product_id, lineItem.order_id, uuidv4()]);
  return response.rows[0];
};

const deleteLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  const SQL = `
    DELETE from line_items
    WHERE id = $1
  `;
  await client.query(SQL, [lineItem.id]);
};

const updateOrder = async(order)=> {
  const SQL = `
    UPDATE orders 
    SET is_cart = $1 
    WHERE id = $2 RETURNING *
  `;
  const response = await client.query(SQL, [order.is_cart, order.id]);
  return response.rows[0];
};

const fetchOrders = async()=> {
  const SQL = `
    SELECT * 
    FROM orders;
  `;
  const response = await client.query(SQL);
  const cart = response.rows.find(row => row.is_cart);
  if(!cart){
    await client.query('INSERT INTO orders(is_cart, id) VALUES(true, $1)', [uuidv4()]); 
    return fetchOrders();
  }
  return response.rows;
};

//insert reviews into table 
const createReview = async(review)=> {
  const SQL = `
  INSERT INTO reviews (comments,ratings,product_id,id) 
  VALUES($1, $2, $3,$4) 
  RETURNING *
`;
 response = await client.query(SQL, [review.comments,review.ratings, review.product_id,uuidv4()]);
  return response.rows[0];
};

//fetch all reviews
const fetchReviews = async()=> {
  const SQL = `
    SELECT *
    FROM reviews
  `;
  const response = await client.query(SQL);
  return response.rows;
};

//add new product
const addProduct = async(product)=>{
  const SQL =`INSERT INTO products (id,name,description,price)
              VALUES($1,$2,$3,$4)
              RETURNING *;`
  const response = await client.query(SQL,[uuidv4(),product.name,product.description,product.price]);
  return response.rows[0];
}

//add new user
const createUser = async (user)=>{
  //user name and pwd can not be empty
  if(!user.name.trim() || !user.password.trim()){
    throw Error("User name and password are required.")
  }
  //encrypt password using Bcrypt
  user.password=await bcrypt.hash(user.password,4);

  const SQL = `INSERT INTO users (id,name,password)
                VALUES ($1,$2,$3)
                RETURNING *;`
  const response=await client.query(SQL,[uuidv4(),user.name,user.password]);
  return response.rows[0];
}

const authenticate = async (credentials)=>{
  console.log("db.js/authenticate",credentials)
  const SQL = `SELECT id,password FROM users
                WHERE name =$1;`
  const response = await client.query(SQL,[credentials.username]);
 console.log("authenticate response  ",response.rows[0]);
 console.log("credentials.password  ",credentials.password);
 console.log("response.password ",response.rows[0].password)
  //no rows returned
  if(!response.rows.length){
    const error = Error("Bad credentials")
    error.status = 401;
    throw error;
  }

  //compare pwd against hashed pwd
  const valid = await bcrypt.compare(credentials.password,response.rows[0].password);
  console.log( "valid user",valid);
  return jwt.sign({id:response.rows[0].id},process.env.JWT)
}

const findUserByToken=async(token)=>{
 try{
  console.log("findUserByToken");
  const payload = await jwt.verify(token,process.env.JWT);
  console.log("payload",payload)
  const SQL=`
            SELECT id,name
            FROM users
            WHERE ID=$1`
  const response = await client.query(SQL,[payload.id])
  if(!response.rows.length){
    const errorMsg=Error("Bad Credentials");
    errorMsg.status=401;
    throw errorMsg;
  }
  console.log("response",response)
  return response.rows[0];
 }catch(error){
  console.log(error)
 }

} 

const seed = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS line_items;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS users;

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      name VARCHAR(100) UNIQUE NOT NULL,
      price INTEGER NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE orders(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      is_cart BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE line_items(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      product_id UUID REFERENCES products(id) NOT NULL,
      order_id UUID REFERENCES orders(id) NOT NULL,
      quantity INTEGER DEFAULT 1,
      CONSTRAINT product_and_order_key UNIQUE(product_id, order_id)
    );

    CREATE TABLE reviews(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      comments VARCHAR(255) NOT NULL,
      ratings INTEGER NOT NULL,
      product_id UUID REFERENCES products(id) NOT NULL,
      CHECK (ratings>0 AND ratings<6)
    );

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      name  VARCHAR(255) UNIQUE NOT NULL,
      password  VARCHAR(255) UNIQUE NOT NULL
    );

  `;
  await client.query(SQL);
  const [foo, bar, bazz, quq] = await Promise.all([
    createProduct({ name: 'Pencil', price : 100,description:'pencil with eraser on top'}),
    createProduct({ name: 'Ruler',price : 150,description:'small sized school ruler' }),
    createProduct({ name: 'Notebook',price : 175,description:'ruled notebook 100 pages' }),
    createProduct({ name: 'Marker',price : 250 ,description:'Standard black marker'}),
  ]);
  let orders = await fetchOrders();
  let cart = orders.find(order => order.is_cart);
  let lineItem = await createLineItem({ order_id: cart.id, product_id: foo.id});
  lineItem.quantity++;
  await updateLineItem(lineItem);
  cart.is_cart = false;
  await updateOrder(cart);

  //create review records
   await Promise.all([
    createReview({ comments: 'comments pencil tips breaks frequetly', ratings : 1,product_id: foo.id}),
    createReview({ comments: 'comments writes smoothly. Tips dont break',ratings : 5,product_id: foo.id }),
    createReview({ comments: 'comments Sturdy and strong for kids daily work',ratings : 5,product_id: bar.id }),
    createReview({ comments: 'comments marker dries off quickly',ratings : 2 ,product_id: quq.id}),
  ]);

  //create user records
  const [user1,user2,user3,user4] = await Promise.all([
    createUser({name:'admin',password:'admin'}),
    createUser({name:'user1',password:'user1'}),
    createUser({name:'user2',password:'user2'}),
    createUser({name:'user3',password:'user3'})
  ])
};

module.exports = {
  fetchProducts,
  fetchOrders,
  fetchLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  updateOrder,
  seed,
  fetchReviews,
  addProduct,
  authenticate,
  findUserByToken,
  client
};
