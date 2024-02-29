import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { Link, HashRouter, Routes, Route } from 'react-router-dom';
import Products from './Products';
import Orders from './Orders';
import Cart from './Cart';
import AddProduct from './AddProduct'
import Reviews from './Reviews';
import "./index.css"
import SelectedProduct from './SelectedProduct';
import Login from './Login';

const App = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [auth, setauth] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/lineItems');
      setLineItems(response.data);
    };
    fetchData();
  }, []);

  //fetch reviews from db
  useEffect(() => {
    const fetchReviews = async () => {
      const response = await axios.get('/api/reviews')
      setReviews(response.data);
    };
    fetchReviews();
  }, []);

  const cart = orders.find((order) => { return order.is_cart });
  if (!cart) {
    return null;
  }

  const createLineItem = async (product) => {
    const response = await axios.post('/api/lineItems', {
      order_id: cart.id,
      product_id: product.id
    });
    setLineItems([...lineItems, response.data]);
  };

  const updateLineItem = async (lineItem) => {
    const response = await axios.put(`/api/lineItems/${lineItem.id}`, {
      quantity: lineItem.quantity,
      order_id: cart.id
    });
    setLineItems(lineItems.map((lineItem) => {
      return lineItem.id == response.data.id ? response.data : lineItem
    }));
  };

  const updateOrder = async (order) => {
    await axios.put(`/api/orders/${order.id}`, order);
    const response = await axios.get('/api/orders');
    setOrders(response.data);
  };

  const removeFromCart = async (lineItem) => {
    await axios.delete(`/api/lineItems/${lineItem.id}`);
    setLineItems(lineItems.filter(_lineItem => _lineItem.id !== lineItem.id));
  };

  //add new product
  const addProduct = async (newProduct) => {
    const response = await axios.post('/api/products', newProduct);
    //update state
    setProducts([...products, response.data]);
  }

  const cartItems = lineItems.filter((lineItem) => {
    return lineItem.order_id === cart.id
  });

  const cartCount = cartItems.reduce((acc, item) => {
    return acc += item.quantity;
  }, 0);

  function displayPrice(num) {

    //handle numbers less than 2 digits
    var leftDecimal = num.toString().replace('.', ''),
      rightDecimal = '00';

    //handle numbers > 2 digits
    if (leftDecimal.length > 2) {
      rightDecimal = leftDecimal.slice(-2);
      leftDecimal = leftDecimal.slice(0, -2);
    }
    //form the decimal number to be displayed
    var n = Number(leftDecimal + '.' + rightDecimal).toFixed(2);
    return (n === "NaN") ? num : n
  }

  const login = async (credentials)=>{
    console.log("index.js login",credentials)
    const response = await axios.post('/api/login',credentials);
    console.log("src/index response",response);
    const {token}=response.data;
    console.log("token received",token)

    const userResponse = await axios.get('/api/me',{
      headers:{
        Authorization:token
      }
    })

setauth(userResponse.data)
  }

  return (
    <div>
      {
        auth.id ?
          <div>
            <span>Welcome back {auth.name} !</span>
            <nav className='navbar'>
              <Link to='/'>Products ({products.length})</Link>
              <Link to='/orders'>Orders ({orders.filter((order) => { return !order.is_cart }).length})</Link>
              <Link to='/add-product'>Add New Product</Link>
              <Link to='/reviews'>View Product Reviews</Link>
              <Link to='/cart'>Cart ({cartCount})</Link>
            </nav>
            <Routes>
              <Route path='/add-product' element={<AddProduct addProduct={addProduct} />} />
              <Route path='/' element={<Products
                products={products}
                cartItems={cartItems}
                createLineItem={createLineItem}
                updateLineItem={updateLineItem}
                displayPrice={displayPrice}
              />} />

              <Route path='/orders' element={<Orders
                orders={orders}
                products={products}
                lineItems={lineItems}
              />} />
              <Route path='/cart' element={<Cart
                cart={cart}
                lineItems={lineItems}
                products={products}
                updateOrder={updateOrder}
                removeFromCart={removeFromCart}
                displayPrice={displayPrice}
                updateLineItem={updateLineItem}
              />} />
              <Route path='/reviews' element={<Reviews
                reviews={reviews}
                products={products}
              />} />
              <Route path='/products/:id' element={<SelectedProduct products={products} reviews={reviews} displayPrice={displayPrice} />} />
            </Routes>
            <div>
            </div>
          </div>
          :
          <div>
            <Login login={login}/>
          </div>
      }
    </div>
  );
};

const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(<HashRouter><App /></HashRouter>);
