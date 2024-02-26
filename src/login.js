import React, { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  console.log(username, password);

  const handleSubmit = ()=>{
    e.preventDefault();
    
  }

  return (
    <div>
      Login form<br />
      <form onSubmit={handleSubmit}>
        <label> User name: <input type="text" value={username} onChange={(e) => { setUsername(e.target.value) }} required /> </label>
        <label> Password: <input type="password" value={password} onChange={(e) => { setPassword(e.target.value) }} required /> </label>
        <button type="submit" style={{ width: 100, height: 25 }}>Login</button>
      </form>
    </div>
  )
}

export default Login;