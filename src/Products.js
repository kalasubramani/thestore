import React from 'react';
import "./Products.css"

const Products = ({ products, cartItems, createLineItem, updateLineItem,displayPrice })=> {
  // sort products
   products.sort(
    (productA, productB) => {
      const nameA = productA.name.toUpperCase(); // ignore upper and lowercase
      const nameB = productB.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
    
      // names must be equal
      return 0;
    }
  );

  const updateCount = (lineitem)=>{
    updateLineItem({...lineitem,quantity: lineitem.quantity+1})
  }
 
  return (
    <div className='productContainer'>
      <h2>Products</h2>
      <ul>
        {
          products.map( product => {
            const cartItem = cartItems.find(lineItem => lineItem.product_id === product.id);
            return (
              <li key={ product.id }>
                { product.name }
                 <span className='price'> ${displayPrice(product.price)} </span>
                 <span className='price'>{product.description}</span>
                {
                  cartItem ? <button onClick={ ()=> updateCount(cartItem)}>Add Another</button>: <button onClick={ ()=> createLineItem(product)}>Add</button>
                }
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

export default Products;
