import React, { useState } from "react";
import './AddProduct.css'

const AddProduct = ({addProduct}) => {
  const [productName,setProductName] = useState('')
  const [productDesc,setProductDesc] = useState('')
  const [price,setPrice] = useState('')

  const handleSubmit =(e)=>{
    e.preventDefault();
        
    //create new product obj
    const newProduct ={
        name :productName,
        description:productDesc,
        price:price
    }
  
    addProduct(newProduct);
    
    //clear out input fields
    setProductName('');
    setProductDesc('');
    setPrice('');
  }

  return (
  <div className="addProductContainer">
     <h4>Add New Product</h4>
     <form className="addProductForm" onSubmit={handleSubmit}>
      <label>Product Name :<input type="text" value={productName} onChange={(e)=>{setProductName(e.target.value)}} required/></label>
      <label>Product Description :<input type="text" value={productDesc} onChange={(e)=>{setProductDesc(e.target.value)}} required/></label>
      <label>Price :<input type="number" value={price} onChange={(e)=>{setPrice(e.target.value)}} required/></label>
      <button type="submit" className="btnAddproduct">
          Add Product
        </button>
     </form>
  </div>
 );
};

export default AddProduct;


