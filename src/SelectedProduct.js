import { useParams } from 'react-router-dom';
import './SelectedProduct.css'
import React from 'react';

const SelectedProduct = ({products,reviews,displayPrice})=>{
   //get the product id from url 
 const {id} = useParams();

  //find selected product from products list
 const productDetails = products?.find((product)=>{return product.id===id});
 
 //find reviews for the selected item
 const reviewDetails = reviews?.filter((review)=>{
                              return review.product_id === id
 })

const productReviews = reviewDetails?.map((review)=>{
  return (
    <li>{review.comments} | RATINGS : {review.ratings}</li>
  )
})
   
  return(
    <div className='selectedProductContainer'>      
      <h3>Selected Product</h3>
       <div>
            <h3>{productDetails.name}</h3>
            <p>{productDetails.description}</p>
            <p>${displayPrice(productDetails.price)}</p>
        </div>
        <hr/>
       {productReviews.length>0? 
        <div>
          <h3>Reviews about the product</h3>
          <ul>
            {productReviews}
          </ul> 
        </div>
        :
        <div>
          <p>There are no reviews for this product.</p>
        </div>
        }
    </div>
  )
}

export default SelectedProduct;
