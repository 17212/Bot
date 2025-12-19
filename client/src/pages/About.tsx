import { AppStrings } from "@/constants/strings";

function About() {
  return (
    <div className="space-y-4">
      <div className="text-heading font-heading text-2xl">About</div>
      <p className="text-body">
        Facebook AI Bot by {AppStrings.company}. Crafted by {AppStrings.founder}, {AppStrings.founderTitle}.
        Motto: {AppStrings.motto}. Offline-first, privacy-centric, high-performance.
      </p>
      <div className="glass-panel rounded-2xl p-4 border border-white/8 text-sm text-body space-y-1">
        <div>Website: {AppStrings.contact.website}</div>
        <div>GitHub: {AppStrings.contact.github}</div>
        <div>Email: {AppStrings.contact.email}</div>
        <div>TikTok / Instagram: {AppStrings.contact.tiktok}</div>
        <div>Telegram: {AppStrings.contact.telegram}</div>
      </div>
    </div>
  );
}

export default About;
