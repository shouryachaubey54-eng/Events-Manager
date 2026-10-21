import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Box from "./Box.jsx";
import "./calender.css";
import {useNavigate } from 'react-router-dom';

function MyCalendar({fxn}) {
  const navigate = useNavigate();
  let [user, setUser] = useState();
  let [core, setCore] = useState(false);
  let [backgroundEvents, setBackground] = useState([]);
  let [formdata, setData] = useState({ email: "", club: "", admissionNumber: "", password: "" });
  const [events, setEvents] = useState([]);
  let [date, setDate] = useState("");

  function func2(event) {
    let eventName = event.target.name;
    let val = event.target.value;
    setData((olddata) => {
      return { ...olddata, [eventName]: val };
    });
  }

  function toggle(event) {
    event.preventDefault();
    setCore((oldval) => !oldval);
  }

  async function func1(event) {
    event.preventDefault();
    let link = core ? "/new/login/core" : "/new/login/executive";
    let response = await fetch(link, {
      credentials: 'include',
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formdata),
    });
    setData({ email: "", club: "", admissionNumber: "", password: "" });
    let res = await response.json();
    
    let response2 = await fetch("/new/user", { credentials: 'include' });
    let res2 = await response2.json();
    if (!res2.Notfound) {
      setUser(res2);
    }
  }

  async function Events() {
    let response = await fetch("/new/all", { credentials: 'include' });
    let result = await response.json();
    const backgroundEvents1 = [];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length; j++) {
        if (i === j) continue;
        if (result[i].date === result[j].date && result[i].startTime < result[j].endTime && result[i].endTime > result[j].startTime) {
          backgroundEvents1.push({
            start: result[i].date,
            display: 'background',
            backgroundColor: '#ff00009e',
          });
          break;
        }
      }
    }
    setBackground(backgroundEvents1);
  }

  useEffect(() => {
    Events();
    fetch("/new/user", { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.Notfound) {
          setUser(data);
        }
      })
      .catch((err) => console.error("Session restore failed:", err));
  }, []);

  async function logout() {
    let response = await fetch("/new/logout", {
      method: "POST",
      credentials: 'include',
    });
    await response.json();
    setUser(undefined);
  }
  
  async function handleDateClick(arg) {
    try {
      const response = await fetch('/new/events', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: arg.dateStr,
      });
      let result = await response.json();
      setEvents(result);
      setDate({ date: arg.dateStr });
    } catch (err) {
      console.log(err);
    }
  }
  function newPage(){
      fxn();
      navigate('/new-page');
  }
  return (
    <div className="calendar-dashboard">
      {/* Top Header Navigation */}
      
      <header className="dashboard-header">
        <div className="header-title">
          <h1> Club Event Scheduler</h1>
        </div>
        <div className="user-auth-status">
          {user ? (
            <div className="user-badge">
              <span>Welcome, <strong>{user.email || user.admissionNumber || "User"}</strong></span>
              <button className="btn-logout" onClick={logout}>Logout</button>
              {user?user?.core && <button onClick={newPage}>Check and Update</button> || !user?.core && <button onClick={newPage}>Upload Bills</button>:""}
            </div>
          ) : (
            <span className="guest-badge">Not Logged In</span>
          )}
        </div>
      </header>
      
      {/* Main Content Grid: Calendar + Date Details Box */}
      <div className="dashboard-grid">
        <div className="calendar-card">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            editable={true}
            selectable={true}
            dateClick={handleDateClick}
            slotEventOverlap={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            events={backgroundEvents}
            height="auto"
          />
        </div>

        {/* Side Panel for Date Details */}
        {date && (
          <div className="sidebar-box-card">
            <div className="sidebar-header">
              <h3>Selected Date Details</h3>
              <button className="close-btn" onClick={() => setDate("")}>&times;</button>
            </div>
            <Box prop={events} date={date} eventfunc={Events} User={user} />
          </div>
        )}
      </div>

      {/* Bottom Section: Login & Authentication Form */}
      {!user && (
        <section className="auth-section">
          <div className="auth-card">
            <h3>Portal Login</h3>
            <form onSubmit={func1} className="auth-form">
              <input 
                type="text" 
                placeholder="Admission Number" 
                name="admissionNumber" 
                onChange={func2} 
                value={formdata.admissionNumber} 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                name="email" 
                onChange={func2} 
                value={formdata.email} 
              />
              <input 
                type="text" 
                placeholder="Club Name" 
                name="club" 
                onChange={func2} 
                value={formdata.club} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                onChange={func2} 
                value={formdata.password} 
              />
              
              <div className="auth-actions">
                <button 
                  type="button" 
                  onClick={toggle} 
                  className={`toggle-role-btn ${core ? "active-core" : ""}`}
                >
                  {core ? " Core Member" : " Executive Member"}
                </button>
                <button type="submit" className="btn-submit">Sign In</button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

export default MyCalendar;