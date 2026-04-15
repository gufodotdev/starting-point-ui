import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default", description: "Feedback form" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Submit Feedback
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Share your thoughts to help us improve.
          </p>
        </div>
        <form className="field-group">
          <div className="field">
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              className="input"
              id="title"
              type="text"
              placeholder="Feedback title"
              name="title"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="type">
              Type
            </label>
            <select className="select" id="type" name="type">
              <option value="">Select type</option>
              <option value="suggestion">Suggestion</option>
              <option value="complaint">Complaint</option>
              <option value="praise">Praise</option>
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              className="textarea"
              id="description"
              name="description"
              placeholder="Tell us more..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn" type="button">
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
