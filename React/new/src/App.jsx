import Calender from "./Calender.jsx"
import { useState,useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewPage from "./Club.jsx"
function App() {
  
  let [user,setUser]=useState();
  useEffect(()=>{
    async function func(){
    let info=await fetch("/new/user",{
      credentials:'include'
    });
    let info1=await info.json();
    setUser(info1);
  }func()
  },[])
  async function func1(){
    let info=await fetch("/new/user",{
      credentials:'include'
    });
    let info1=await info.json();
    setUser(info1);
  }
  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<Calender fxn={func1}/>}></Route>
            <Route path="/new-page" element={<NewPage prop={user} />} />
          </Routes>
    </BrowserRouter>
  )
}

export default App
