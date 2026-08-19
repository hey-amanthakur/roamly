import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { REPORT_REASONS } from "../../constants";

export default function ReportModal({ targetType, targetId, token, onClose }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/reports`,
        { targetType, targetId, reason, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    }
  };

  return (
    <div className="reportModalOverlay" onClick={onClose}>
      <div className="reportModal" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="reportSuccess">
            <i className="fas fa-check-circle"></i>
            <p>Thank you for your report. We will review it shortly.</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="reportModalHeader">
              <h3>Report {targetType}</h3>
              <i className="fas fa-times" onClick={onClose}></i>
            </div>
            <div className="reportModalBody">
              <label>Reason:</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="">Select a reason...</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <label>Description (optional):</label>
              <textarea
                placeholder="Provide additional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              {error && <p className="reportError">{error}</p>}
            </div>
            <div className="reportModalFooter">
              <button className="reportCancel" onClick={onClose}>
                Cancel
              </button>
              <button className="reportSubmit" onClick={handleSubmit}>
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
