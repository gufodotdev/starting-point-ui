import type { ExampleConfig } from "@/lib/examples";

export const config: ExampleConfig = {
  preset: "default",
  description: "Payment method",
};

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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z"/></svg>
              <span className="label">Card</span>
            </label>
            <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
              <input
                type="radio"
                className="sr-only"
                name="payment"
                defaultValue="paypal"
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z"/></svg>
              <span className="label">PayPal</span>
            </label>
            <label className="relative flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer has-checked:border-primary has-checked:bg-primary/[2.5%]">
              <input
                type="radio"
                className="sr-only"
                name="payment"
                defaultValue="apple"
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
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
