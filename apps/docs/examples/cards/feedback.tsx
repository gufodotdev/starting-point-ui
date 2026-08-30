export default function Feedback() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-header">
        <h3 className="card-title">Submit Feedback</h3>
        <p className="card-description">
          Share your thoughts to help us improve.
        </p>
      </div>
      <form className="card-content field-group">
        <div className="field">
          <label className="label" htmlFor="fb-title">
            Title
          </label>
          <input
            className="input"
            id="fb-title"
            type="text"
            placeholder="Feedback title"
            name="title"
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="fb-type">
            Type
          </label>
          <select className="select" id="fb-type" name="type">
            <option value="">Select type</option>
            <option value="suggestion">Suggestion</option>
            <option value="complaint">Complaint</option>
            <option value="praise">Praise</option>
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="fb-description">
            Description
          </label>
          <textarea
            className="textarea"
            id="fb-description"
            name="description"
            placeholder="Tell us more..."
          ></textarea>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-outline" type="button">
            Cancel
          </button>
          <button className="btn" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
