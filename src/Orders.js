import React from 'react';
import './Orders.css'

const Orders = ({ orders, products, lineItems })=> {
  return (
    <div className='orderContainer'>
      <h2>Orders</h2>
      <ul>
        {
          orders.filter(order => !order.is_cart).map( order => {
            const orderLineItems = lineItems.filter(lineItem => lineItem.order_id === order.id);
            return (
              <li key={ order.id }>
                 Order Placed on :  { new Date(order.created_at).toLocaleString() }
                <ul>
                  {
                    orderLineItems.map( lineItem => {
                      const product = products.find(product => product.id === lineItem.product_id);
                      return (
                        <li key={ lineItem.id }>
                          { product ? product.name: '' } [{lineItem.quantity}]
                        </li>
                      );
                    })
                  }
                </ul>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

export default Orders;
