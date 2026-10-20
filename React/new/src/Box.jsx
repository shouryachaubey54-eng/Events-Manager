import { useState, useEffect } from "react";
import "./box.css";

export default function Box({ prop, date, eventfunc, User }) {
    let [events, setEvents] = useState([]);
    let [editing, setEditing] = useState(false);
    let [editId, setEditId] = useState("");
    let [clashingEvents, setClashingEvents] = useState([]);
    
    let [editData, setEditData] = useState({ title: "", startTime: "", endTime: "" });
    let [inputData, setInputData] = useState({ title: "", startTime: "", endTime: "" });

    // Format event start and end minutes into HH:MM string format
    function formatEventTimes(eventsList) {
        return eventsList.map((event) => {
            let s = event.startTime;
            let e = event.endTime;
            let hours1 = Math.floor(s / 60);
            let minutes1 = s % 60;
            let formattedTime = `${String(hours1).padStart(2, '0')}:${String(minutes1).padStart(2, '0')}`;
            
            let hours2 = Math.floor(e / 60);
            let minutes2 = e % 60;
            let formattedTime2 = `${String(hours2).padStart(2, '0')}:${String(minutes2).padStart(2, '0')}`;
            
            return { ...event, startTime: formattedTime, endTime: formattedTime2 };
        });
    }

    // Fetch day events and compute conflicts
    async function fetchAndUpdateConflicts() {
        try {
            const response = await fetch('/new/events', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: date.date,
            });
            let result = await response.json();
            
            const clashEvents = [];
            for (let i = 0; i < result.length; i++) {
                for (let j = 0; j < result.length; j++) {
                    if (i === j) continue;
                    if (result[i].date === result[j].date && result[i].startTime < result[j].endTime && result[i].endTime > result[j].startTime) {
                        if (clashEvents.find((u) => (u[0] === result[i].title && u[1] === result[j].title) || (u[0] === result[j].title && u[1] === result[i].title))) {
                            continue;
                        } else {
                            clashEvents.push([result[i].title, result[j].title]);
                        }
                    }
                }
            }
            setClashingEvents(clashEvents);
            return result;
        } catch (err) {
            console.error("Error fetching event conflicts:", err);
            return [];
        }
    }

    useEffect(() => {
        async function initBox() {
            const result = await fetchAndUpdateConflicts();
            setEvents(formatEventTimes(prop || []));
        }
        initBox();
    }, [prop, date]);

    // Handle new event form inputs
    function handleInputChange(event) {
        let { name, value } = event.target;
        setInputData((oldInput) => ({ ...oldInput, [name]: value }));
    } 

    // Add new event handler
    async function handleAddEvent(event) {
        event.preventDefault();
        let response = await fetch(`/new/add/${date.date}`, {
            credentials: 'include',
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputData),
        }); 
        let res = await response.json();
        setEvents(formatEventTimes(res));
        eventfunc();
        fetchAndUpdateConflicts();
        setInputData({ title: "", startTime: "", endTime: "" });
    }

    // Trigger edit mode for an event
    function handleEditClick(title, startTime, endTime, id) {
        setEditing(true);
        setEditData({ title, startTime, endTime });
        setEditId(id);
    }

    // Handle edit form inputs
    function handleEditInputChange(event) {
        let { name, value } = event.target;
        setEditData((oldVal) => ({ ...oldVal, [name]: value }));
    }

    // Submit updated event handler
    async function handleUpdateEvent(event) {
        event.preventDefault();
        let response = await fetch(`/new/edit/${editId}`, {
            credentials: 'include',
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData),
        });
        let res = await response.json();
        setEvents(formatEventTimes(res));
        eventfunc();
        fetchAndUpdateConflicts();
        setEditing(false);
        setEditData({ title: "", startTime: "", endTime: "" });
        setEditId("");
    }

    return (
        <div className="box-container">
            <h3 className="box-title">Events for {date.date}</h3>
            
            {/* Events List */}
            <div className="events-list">
                {events.length === 0 ? (
                    <p className="no-events">No events scheduled for this date.</p>
                ) : (
                    events.map((a, index) => (
                        <div className="event-item" key={index}>
                            {editing && a._id === editId ? (
                                <form onSubmit={handleUpdateEvent} className="edit-event-form">
                                    <input type="text" value={editData.title} onChange={handleEditInputChange} name="title" required />
                                    <input type="time" value={editData.startTime} onChange={handleEditInputChange} name="startTime" required />
                                    <input type="time" value={editData.endTime} onChange={handleEditInputChange} name="endTime" required />
                                    <button type="submit" className="save-btn">Save</button>
                                </form>
                            ) : (
                                <div className="event-info">
                                    <div className="event-details">
                                        <span className="event-name"><strong>{a.title}</strong></span>
                                        <span className="event-time">🕒 {a.startTime} - {a.endTime}</span>
                                    </div>
                                    {User && User.core && User.club === a.club && (
                                        <button className="edit-btn" onClick={() => handleEditClick(a.title, a.startTime, a.endTime, a._id)}>
                                            Edit
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Conflict Warnings Section */}
            {User && clashingEvents.length > 0 && (
                <div className="conflict-container">
                    <h4>⚠️ Schedule Conflicts</h4>
                    {clashingEvents.map((a, id) => (
                        <p key={id} className="conflict-alert">
                            <strong>{a[0]}</strong> conflicts with <strong>{a[1]}</strong>
                        </p>
                    ))}
                </div>
            )}

            {/* Input Form for New Events */}
            {User && (
                <form className="event-form" onSubmit={handleAddEvent}>
                    <h4>Add New Event</h4>
                    <input type="text" placeholder="Enter Event Title" onChange={handleInputChange} name="title" value={inputData.title} required />
                    <div className="time-inputs">
                        <input type="time" onChange={handleInputChange} name="startTime" value={inputData.startTime} required />
                        <input type="time" onChange={handleInputChange} name="endTime" value={inputData.endTime} required />
                    </div>
                    <button type="submit" className="submit-btn">Add Event</button>
                </form>
            )}
        </div>
    );
}