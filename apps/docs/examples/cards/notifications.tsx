export default function Notifications() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-header">
        <h3 className="card-title">Notifications</h3>
        <p className="card-description">
          Choose how you want to be notified.
        </p>
      </div>
      <div className="card-content field-group gap-5">
        <div className="field field-horizontal">
          <div className="field-content">
            <label className="label" htmlFor="notif-email">Email notifications</label>
            <p className="field-description">Receive updates and alerts via email.</p>
          </div>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            id="notif-email"
            name="notif-email"
            defaultChecked
          />
        </div>
        <div className="field field-horizontal">
          <div className="field-content">
            <label className="label" htmlFor="notif-push">Push notifications</label>
            <p className="field-description">Get instant alerts on your mobile device.</p>
          </div>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            id="notif-push"
            name="notif-push"
          />
        </div>
        <div className="field field-horizontal">
          <div className="field-content">
            <label className="label" htmlFor="notif-marketing">Marketing emails</label>
            <p className="field-description">Stay informed about new features and offers.</p>
          </div>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            id="notif-marketing"
            name="notif-marketing"
          />
        </div>
      </div>
      <div className="card-footer">
        <button className="btn w-full">Save preferences</button>
      </div>
    </div>
  );
}
