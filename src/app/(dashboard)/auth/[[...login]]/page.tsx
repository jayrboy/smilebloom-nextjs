'use client';

import { useState } from 'react';

const SignInPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
  
    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={onSubmit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">submit</button>
      </form>
    </div>
  )
}
export default SignInPage