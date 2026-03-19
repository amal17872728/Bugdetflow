import QR from "../components/Image/QR_CODE.jpeg";

export default function Support() {
  return (
    <div className="support-page">
      <div className="page-header">
        <h1>Support</h1>
      </div>
      <div className="support-card">
        <h1>Support My Work 💚</h1>
        <p className="support-sub">
          If BudgetFlow helps you manage your finances, consider supporting
          future development — every contribution counts!
        </p>

        <div className="support-qr-box">
          <h2>Easypaisa</h2>
          <img src={QR} alt="Easypaisa QR Code" />
          <p>
            <strong>Number:</strong> 03212180900<br />
            <strong>Name:</strong> Amal Usmaan
          </p>
        </div>
      </div>
    </div>
  );
}
