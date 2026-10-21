import React, { useState, useEffect } from "react";
import "./Club.css"; // Import the CSS file

export default function Club({ prop = {} }) {
  let [history, setHistory] = useState([]);
  let [alloted, setAlloted] = useState(0);
  let [left, setLeft] = useState(0);

  useEffect(() => {
    async function clubData() {
      if (!prop?.club) return;
      try {
        let response = await fetch(`/new/club/${prop.club}`, {
          credentials: 'include'
        });
        let res = await response.json();
        if (res && res.length > 0) {
          setAlloted(res[0].allotedAmount);
          setLeft(res[0].leftAmount);
        }
      } catch (err) {
        console.error("Error fetching club data:", err);
      }
    }
    clubData();
  }, [prop?.club]);

  // Executive->Form (Amount,File)
  let [amount, setAmount] = useState("");
  let [selectedFileName, setSelectedFileName] = useState("");

  async function func(event) {
    event.preventDefault();
    let formdata = new FormData(event.target);
    try {
      let response = await fetch("/new/bill", {
        method: 'POST',
        body: formdata,
      });
      let res = await response.json();

      let data = {
        slip: res.path,
        amount: amount,
        clubName: prop.club,
        verified: false,
        uploadedBy: prop.AdmissionNumber
      };

      let response1 = await fetch("/new/bill/submit", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      let res2 = await response1.json();
      console.log(res2);
      
      // Reset form
      setAmount("");
      setSelectedFileName("");
      event.target.reset();
      checkBills(); // Refresh history if needed
    } catch (err) {
      console.error("Error submitting bill:", err);
    }
  }

  function func1(event) {
    setAmount(event.target.value);
  }

  async function checkBills() {
    if (!prop?.club) return;
    try {
      let response = await fetch(`/new/history/${prop.club}`, {
        credentials: 'include',
      });
      let res = await response.json();
      setHistory(res);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }

  async function func2(amount, id) {
    try {
      let response = await fetch(`/new/reduce/${amount}/${prop.club}`, {
        credentials: 'include'
      });
      let res1 = await response.json();
      console.log(res1);

      let response2 = await fetch(`/new/verify/${id}`, {
        credentials: 'include'
      });
      let res2 = await response2.json();
      console.log(res2);

      let response3 = await fetch(`/new/club/${prop.club}`, {
        credentials: 'include'
      });
      let res = await response3.json();
      if (res && res.length > 0) {
        setAlloted(res[0].allotedAmount);
        setLeft(res[0].leftAmount);
      }

      checkBills();
    } catch (err) {
      console.error("Error during verification:", err);
    }
  }

  return (
    <div className="club-container">
      {/* Header / Summary Box */}
      <div className="club-summary-card">
        <h2>{`${prop.club.toUpperCase()} Dashboard`}</h2>
        <div className="summary-stats">
          <div className="stat-box">
            <span>Allotted Budget</span>
            <h3>₹{alloted}</h3>
          </div>
          <div className="stat-box">
            <span>Remaining Amount</span>
            <h3 className="left-amount">₹{left}</h3>
          </div>
        </div>
      </div>

      {/* Non-Core Member Form */}
      {!prop?.core && (
        <div className="form-card">
          <h3>Submit Expense Bill</h3>
          <form className="bill-form" onSubmit={func} encType="multipart/form-data">
            <div className="file-input-wrapper">
              <label htmlFor="file-upload" className="custom-file-btn">
                {selectedFileName ? selectedFileName : "Choose Bill Slip"}
              </label>
              <input 
                id="file-upload" 
                type="file" 
                name="slip" 
                onChange={(e) => setSelectedFileName(e.target.files[0]?.name)} 
                required 
              />
            </div>

            <div className="input-group">
              <input 
                type="number" 
                name="amount" 
                placeholder="Enter Amount (₹)" 
                value={amount} 
                onChange={func1} 
                required 
              />
            </div>

            <button type="submit" className="submit-btn">Submit Bill</button>
          </form>
        </div>
      )}

      {/* Core Member Action */}
      {prop?.core && (
        <div className="core-action-container">
          <button className="verify-bills-btn" onClick={checkBills}>
            Fetch & Verify Bills
          </button>
        </div>
      )}

      {/* History Grid */}
      {history.length > 0 && (
        <div className="history-section">
          <h3>Bill History</h3>
          <div className="history-grid">
            {history.map((a) => (
              <div className="history-card" key={a._id}>
                <div className="image-container">
                  <img src={a.slip} alt="Receipt Slip" />
                </div>
                <div className="history-details">
                  <p className="uploaded-by">Uploaded By: <strong>{a.uploadedBy}</strong></p>
                  <p className="bill-amount">₹{a.amount}</p>
                  
                  <div className="card-footer">
                    {a.verified ? (
                      <span className="badge verified">Verified</span>
                    ) : (
                      <span className="badge pending">Pending</span>
                    )}

                    {!a.verified && prop?.core && (
                      <button className="verify-btn" onClick={() => func2(a.amount, a._id)}>
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}