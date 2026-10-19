import Calender from "./Calender.jsx"

function App() {
  async function func(){
    let info=await fetch("/new/api");
    let info1=await info.json();
    console.log(info1);
  }
  return (
    <>
    {/* <button onClick={func}>Click</button> */}
    <Calender/>
    </>
  )
}

export default App
