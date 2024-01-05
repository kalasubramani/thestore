import React from "react";
import './Reviews.css'

const Reviews = ({reviews,products})=>{ 
  const productReviews = reviews.reduce((reviewCollection,currentReview)=>{
    //group reviews by prd id
      if(reviewCollection.hasOwnProperty(currentReview.product_id)){
        reviewCollection[currentReview.product_id].push(currentReview);
      }else{
        reviewCollection[currentReview.product_id]=[currentReview]
      }
    return reviewCollection;
  },{})


  //iterate through each prd id
  const prdNames= Object.keys(productReviews).map( (prdId)=>{
        //get product record to find prd name
        const reviewedProduct = products.find((prd)=>{return prd.id===prdId})
        //each element in obj has all corr. array of review comments
        const reviewComments = productReviews[prdId]

                return  <li>{reviewedProduct.name}
                              <ul>
                                {
                                  //iterate thru review comments array and display comment and rating
                                    reviewComments.map((rv)=>{
                                      return( 
                                        <>
                                          <li>{rv.comments} | RATINGS : {rv.ratings}</li>
                                         
                                        </>
                                      )
                                    })
                                 }                                
                              </ul>
                        </li>
        })

  return (
  <div className="reviewContainer"> 
      <h4>Product Reviews</h4>        
      <ul>
        {prdNames}
      </ul>
  </div>
  )
}

export default Reviews;