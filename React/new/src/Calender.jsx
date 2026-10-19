import React, { useEffect, useState } from 'react';
import "./calender.css"
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Box from "./Box.jsx"
import "./Calendar.css"
function MyCalendar() {
  let [user,setUser]=useState();
  let [core,setCore]=useState(false);
  let [backgroundEvents,setBackground]=useState([]);
  let [formdata,setData]=useState({email:"",club:"",admissionNumber:"",password:""});
  
  function func2(event){
    let eventName=event.target.name;
    let val=event.target.value;
    setData((olddata)=>{
      return {...olddata,[eventName]:val};
    })
  }
  function toggle(event){
    event.preventDefault();
    setCore((oldval)=>{
      return oldval?false:true;
    })
  }
  async function func1(event){
    event.preventDefault();
    console.log(formdata);
    let link;
    if(core){
      link="/new/login/core";
    }else{
      link="/new/login/executive";
    }
    let response=await fetch(link,{
      credentials: 'include',
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(formdata),
    })
    setData({email:"",club:"",admissionNumber:"",password:""})
    let res=await response.json(); 
    console.log(res);
    let response2=await fetch("/new/user"
      , {
      credentials: 'include'
    }
    );
    let res2=await response2.json();
    if(res2.Notfound){

    }else{
        setUser(res2);
    }
  }
  async function Events(){
      let response=await fetch("/new/all"
        , {
      credentials: 'include'
    }
      );
      let result =await response.json();
      const backgroundEvents1 = [];
      for(let i=0;i<result.length;i++){
        for(let j=0;j<result.length;j++){
          if(i==j)continue;
          if(result[i].date==result[j].date && result[i].startTime<result[j].endTime && result[i].endTime>result[j].startTime){
            backgroundEvents1.push({
              start: result[i].date,
              display: 'background',
              backgroundColor: '#ff00009e',
            })
            break;
          }
        }
      }
      setBackground(backgroundEvents1);
      console.log(backgroundEvents);
    }
  useEffect(() => {
    Events();
    fetch("/new/user", {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.Notfound) {
          setUser(data); // Restores user session state after refresh
        }
      })
      .catch((err) => console.error("Session restore failed:", err));
  }, []);
  
  const [events, setEvents] = useState([]);
  let [date,setDate]=useState("");
  // 1. Triggered when clicking an EMPTY date/time slot
  async function handleDateClick(arg){
    // let date=arg.dateStr;
    // date=date?date:arg;
    try {
          const response = await fetch('/new/events', {
              credentials: 'include',
              method: 'POST',
              headers: {
                  'Content-Type': 'text/plain',
              },
              body: arg.dateStr,
          });//data for a date
          
          let result=await response.json();
          setEvents(result);//new Date(arg.dateStr);
          setDate({date:arg.dateStr});
    }
    catch(err){
      console.log(err);
    }
  }
  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }} className='box'>
      {date?
      <div className="box1">
        <Box prop={events} date={date} eventfunc={Events} User={user}/>
      </div>:""
}
      <div className="box2">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth',
        }}
        editable={true}
        selectable={true}
        dateClick={handleDateClick}    // Fires on empty background slots
        slotEventOverlap={false}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        events={backgroundEvents}
      />
    </div>
    <form onSubmit={func1}>
      <input type="text" placeholder='AdmissionNumber' name="admissionNumber" onChange={func2} value={formdata.admissionNumber}/>
      <input type="text" placeholder='Email' name="email" onChange={func2} value={formdata.email}/>
      <input type="text" placeholder='Club'name="club" onChange={func2} value={formdata.club}/>
      <input type="text" placeholder='Password' name="password" onChange={func2} value={formdata.password}/>
      {/* Updated Toggle Button */}
<button 
  type="button" 
  onClick={toggle} 
  className={core ? "active-core" : ""}>{core ? "Core Member" : "Executive Member"}
</button>
      <button>Submit</button>
    </form>
    </div>
  );
}

export default MyCalendar;