import Attendance from "@/examples/cards/attendance";
import BlogPost from "@/examples/cards/blog-post";
import Feedback from "@/examples/cards/feedback";
import InvoicePaid from "@/examples/cards/invoice-paid";
import Login from "@/examples/cards/login";
import MusicPlayer from "@/examples/cards/music-player";
import MusicQueue from "@/examples/cards/music-queue";
import Notifications from "@/examples/cards/notifications";
import PaymentMethod from "@/examples/cards/payment-method";
import PremiumPlan from "@/examples/cards/premium-plan";
import Product from "@/examples/cards/product";
import Profile from "@/examples/cards/profile";
import ShareDocument from "@/examples/cards/share-document";
import SignUp from "@/examples/cards/sign-up";
import Testimonial from "@/examples/cards/testimonial";

export function LandingGrid() {
  return (
    <div className="flex shrink-0 gap-4 p-px">
      <div className="columns-4 gap-4">
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <Product />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <ShareDocument />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <PaymentMethod />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <Notifications />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <BlogPost />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <SignUp />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <Feedback />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <PremiumPlan />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <Profile />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <Testimonial />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <MusicPlayer />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <Login />
        </div>
      </div>
      <div className="w-96 shrink-0">
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <MusicQueue />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <InvoicePaid />
        </div>
        <div className="mb-4 break-inside-avoid *:w-full *:max-w-sm">
          <Attendance />
        </div>
      </div>
    </div>
  );
}
