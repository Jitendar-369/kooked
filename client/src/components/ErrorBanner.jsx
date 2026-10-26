// Errors show up as a sticky note slapped onto the ticket.
export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" key={message} className="pop relative mx-auto mt-5 max-w-sm rotate-[-1.5deg] bg-[#ffe066] px-5 pb-4 pt-6 text-ink shadow-[0_12px_20px_-8px_rgba(0,0,0,0.6)]">
      <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[3deg]" />
      <p className="font-marker text-lg leading-none text-tomato">uh oh 🧯</p>
      <p className="mt-1 font-hand text-[17px] leading-snug">{message}</p>
    </div>
  );
}
