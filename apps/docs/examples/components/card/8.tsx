import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = { preset: "default" };

export default function Example() {
  return (
    <div className="card w-full max-w-sm">
      <div className="card-content grid gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Payment Method
          </h3>
          <p className="text-sm/6 text-muted-foreground mt-2">
            Choose how you&#x27;d like to pay for your order.
          </p>
        </div>
        <div className="grid gap-3">
          <span className="label sr-only">Payment method</span>
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
              <input
                type="radio"
                className="sr-only"
                name="payment"
                defaultChecked
                defaultValue="card"
              />
              <i className="ri-bank-card-fill text-2xl"></i>
              <span className="label">Card</span>
            </label>
            <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
              <input
                type="radio"
                className="sr-only"
                name="payment"
                defaultValue="paypal"
              />
              <i className="ri-paypal-fill text-2xl"></i>
              <span className="label">PayPal</span>
            </label>
            <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
              <input
                type="radio"
                className="sr-only"
                name="payment"
                defaultValue="apple"
              />
              <i className="ri-apple-fill text-2xl"></i>
              <span className="label">Apple</span>
            </label>
          </div>
        </div>
        <form className="field-group">
          <div className="field">
            <label className="label" htmlFor="cardholder-name">
              Cardholder Name
            </label>
            <input
              className="input"
              id="cardholder-name"
              type="text"
              placeholder="John Doe"
              name="cardholder-name"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="card-number">
              Card Number
            </label>
            <input
              className="input"
              id="card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              name="card-number"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="field">
              <label className="label" htmlFor="month">
                Month
              </label>
              <input
                className="input"
                id="month"
                type="text"
                placeholder="MM"
                name="month"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="year">
                Year
              </label>
              <input
                className="input"
                id="year"
                type="text"
                placeholder="YY"
                name="year"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="cvv">
                CVV
              </label>
              <input
                className="input"
                id="cvv"
                type="text"
                placeholder="123"
                name="cvv"
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
