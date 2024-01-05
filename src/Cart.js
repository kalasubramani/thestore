import React, { useState } from 'react';
import './Cart.css'

const Cart = ({ updateOrder, removeFromCart, lineItems, cart, products, displayPrice,updateLineItem })=> {
  
  const itemsInCart=lineItems.filter((lineItem) => {return lineItem.order_id === cart.id})

  //find total cost
 const totalCost= itemsInCart.reduce((total,item)=>{
      const product = products.find((p)=>{return p.id === item.product_id})
       return total + (item.quantity* product.price);
  },0)

  const updateCount = (lineitem,addOne)=>{
      //if lineitem =1 and addOne is false(minus 1) - remove the item from cart
    if(addOne){ 
      updateLineItem({...lineitem,quantity: lineitem.quantity+1})
    }else{
      //if this is the last item in cart, remove it from cart
      if(lineitem.quantity<=1){
        removeFromCart(lineitem)
      }else{ 
      updateLineItem({...lineitem,quantity: lineitem.quantity-1})
      }
    }
     
    };

  return (
    <div className='cartContainer'>
      <h2>Cart</h2>  
      
      {itemsInCart.length>0?  
      <> 
        <ul>
          {
            //find line items that are in cart - eliminates placed orders
            itemsInCart.map( lineItem => {
              //get name and qty for prds in cart
              const product = products.find(product => product.id === lineItem.product_id) || {};
             
              return (              
                  <li key={ lineItem.id }>
                    { product.name }
                    ({ lineItem.quantity })                                           
                    <button onClick={()=>{updateCount(lineItem,true)}}>+</button>
                    <button onClick={()=>{updateCount(lineItem,false)}}>-</button>
                    <button onClick={ ()=> removeFromCart(lineItem)}>Remove From Cart</button>
                  
                  </li>                
              );
                        
            })    
            
          }
        </ul> 
        <button onClick={()=> {updateOrder({...cart, is_cart: false }); }}>Create Order</button>
      </>
        : <h4>Add some items to your cart</h4>} 
            <hr/>
      <label >Total Cost: ${displayPrice(totalCost)}</label>      
      
    </div>
  );
};

export default Cart;
