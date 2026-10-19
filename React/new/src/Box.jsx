import { useState,useEffect} from "react";
import "./box.css";

export default function Box({ prop,date,eventfunc,User}) {
    let [events,setEvents]=useState([]);
    let [editing,setediting]=useState(false);
    let [Id,setId]=useState("");
    let [clashingEvents,setclashingevents]=useState([]);
    function func(prop){//Normal function which returns updated dates with tt:tt
            return prop.map((event)=>{
                let s=event.startTime;
                let e=event.endTime;
                let totalMinutes = 540;
                let hours1 = Math.floor(s / 60);
                let minutes1= s % 60;
                let formattedTime = `${String(hours1).padStart(2, '0')}:${String(minutes1).padStart(2, '0')}`;
                let hours2 = Math.floor(e / 60);
                let minutes2 = e % 60;
                let formattedTime2 = `${String(hours2).padStart(2, '0')}:${String(minutes2).padStart(2, '0')}`;
                return {...event,startTime:formattedTime,endTime:formattedTime2};
                })
    }
    async function EventConflictfunc(){
        console.log(date);
             const response = await fetch('/new/events', {
              credentials: 'include',
              method: 'POST',
              headers: {
                  'Content-Type': 'text/plain',
              },
              body: date.date,
          });//data for a date
          let result=await response.json();
          const clashEvents = [];
            for(let i=0;i<result.length;i++){
                for(let j=0;j<result.length;j++){
                    if(i==j)continue;
                    if(result[i].date==result[j].date && result[i].startTime<result[j].endTime && result[i].endTime>result[j].startTime){
                        if(clashEvents.find((u)=>(u[0]==result[i].title && u[1]==result[j].title) || (u[0]==result[j].title && u[1]==result[i].title))){
                            continue;
                        }else{
                            clashEvents.push([result[i].title,result[j].title]);
                        }
                    }
                }
            }
            setclashingevents(clashEvents);
        }
    
    useEffect(()=>{
        async function funcn(){
             const response = await fetch('/new/events', {
              credentials: 'include',
              method: 'POST',
              headers: {
                  'Content-Type': 'text/plain',
              },
              body: date.date,
          });//data for a date
          let result=await response.json();
          const clashEvents = [];
            for(let i=0;i<result.length;i++){
                for(let j=0;j<result.length;j++){
                    if(i==j)continue;
                    if(result[i].date==result[j].date && result[i].startTime<result[j].endTime && result[i].endTime>result[j].startTime){
                        if(clashEvents.find((u)=>(u[0]==result[i].title && u[1]==result[j].title) || (u[0]==result[j].title && u[1]==result[i].title))){
                            continue;
                        }else{
                            clashEvents.push([result[i].title,result[j].title]);
                        }
                    }
                }
            }
            setEvents(func(prop));
            setclashingevents(clashEvents);
        }
        funcn();
    },[prop,date]);

    let [editData,setEdit]=useState({title:"",startTime:"",endTime:""});
    let [inputData,setInput]=useState({title:"",startTime:"",endTime:""});
    //useEvent to detect weather any event is overlapping or not
    function func1(event){
        let inputName=event.target.name;
        let value=event.target.value;
        setInput((oldInput)=>{
            return {...oldInput,[inputName]:value};
        })
    } 
    async function func2(event){
        event.preventDefault();
        //give data to server and wait to be added;
        let response=await fetch(`/new/add/${date.date}`,{
            credentials: 'include',
            method:"POST",
            headers: {
                    'Content-Type': 'application/json',
            },
            body:JSON.stringify(inputData),
        }) 
        let res=await response.json();
        setEvents(func(res));
        eventfunc();
        EventConflictfunc();
        setInput({title:"",startTime:"",endTime:""});
    };
    function func3(a,b,c,id){
        setediting(true);
        setEdit({title:a,startTime:b,endTime:c});
        setId(id);
    }
    function func4(event){
        let inputName=event.target.name;
        let value=event.target.value;
        setEdit((oldVal)=>{
            return {...oldVal,[inputName]:value};
        })
    }
    async function func5(event){
        //Use the server and update the data there
        //id date title startDate endDate, use these and update the data
        event.preventDefault();
        let response=await fetch(`/new/edit/${Id}`,{
            credentials: 'include',
            method:"POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(editData),
        })
        let res=await response.json();
        setEvents(func(res));
        eventfunc();
        EventConflictfunc();
        setEdit("");
        setId("");
    }
    return (
        <div className="box-container">
            <h3 className="box-title">Events List</h3>
            <div className="events-list">
                {events.map((a, index) => (
                    <div className="event-item" key={index}>
                        {editing && a._id==Id?
                        <form onSubmit={func5}>
                            <input type="text" value={editData.title} onChange={func4} name="title"/>
                            <input type="time" value={editData.startTime} onChange={func4} name="startTime"/>
                            <input type="time" value={editData.endTime} onChange={func4} name="endTime"/>
                            <button>Submit</button>
                        </form>:
                        <div className="event-info">
                            <span className="event-name">{a.title}</span>
                            <span className="event-time">{a.startTime}</span>
                            <span className="event-time">{a.endTime}</span>
                            {User && User.core && User.club==a.club?
                            <button className="edit-btn" onClick={()=>func3(a.title,a.startTime ,a.endTime,a._id)}>Edit</button>:""}
                        </div>
                        }
                    </div>//called a function onClick which made all the variables for edit
                ))}
            </div>
            <div>
                {User?
            
                    clashingEvents.map((a,id)=>{
                        return (
                            <p key={id}>{a[0]} is Conflicting with {a[1]}</p>
                        )
                    })
                :""}
            </div>
            {/* Input form */}
            {User?
            <form className="event-form" onSubmit={func2}>
                <input type="text" placeholder="Enter the Title" onChange={func1} name="title" value={inputData.title}/>
                <input type="time" onChange={func1} name="startTime" value={inputData.startTime}/>
                <input type="time" onChange={func1} name="endTime" value={inputData.endTime}/>
                <button type="submit" className="submit-btn">Click</button>
            </form>:""
            }
        </div>
    );
}