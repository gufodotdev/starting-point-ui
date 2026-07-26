export default function Attendance() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Attendance</div>
        <div className="card-description">
          Choose who can attend your event.
        </div>
      </div>
      <div className="card-content">
        <div className="group/att field-group gap-4" role="radiogroup" aria-label="Attendance">
          <div className="field field-horizontal">
            <input
              type="radio"
              className="radio"
              id="lg-att-public"
              name="lg-attendance"
              defaultChecked
            />
            <div className="field-content">
              <label className="label" htmlFor="lg-att-public">
                Public
              </label>
              <p className="field-description">
                Tickets will be available to the general public.
              </p>
              <div className="field-group mt-4 gap-4 transition-opacity group-has-[#lg-att-private:checked]/att:pointer-events-none group-has-[#lg-att-private:checked]/att:opacity-50">
                <div className="field field-horizontal">
                  <input
                    type="checkbox"
                    className="checkbox"
                    id="lg-att-inperson"
                    defaultChecked
                  />
                  <div className="field-content">
                    <label className="label" htmlFor="lg-att-inperson">
                      In-person
                    </label>
                    <p className="field-description">
                      Attendees will be at the event in person.
                    </p>
                  </div>
                </div>
                <div className="field field-horizontal">
                  <input
                    type="checkbox"
                    className="checkbox"
                    id="lg-att-online"
                  />
                  <div className="field-content">
                    <label className="label" htmlFor="lg-att-online">
                      Online
                    </label>
                    <p className="field-description">
                      Attendees will only be able to view the event online.
                    </p>
                  </div>
                </div>
                <div className="field field-horizontal">
                  <input
                    type="checkbox"
                    className="checkbox"
                    id="lg-att-recorded"
                  />
                  <div className="field-content">
                    <label className="label" htmlFor="lg-att-recorded">
                      Recorded
                    </label>
                    <p className="field-description">
                      A recording will be available after the event.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="field field-horizontal">
            <input
              type="radio"
              className="radio"
              id="lg-att-private"
              name="lg-attendance"
            />
            <div className="field-content">
              <label className="label" htmlFor="lg-att-private">
                Private
              </label>
              <p className="field-description">
                Tickets are not available to the general public.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
