import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with our citizenship advisory team. Book a free consultation.",
};

export default function ContactPage() {
  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
          Get in Touch
        </h1>
        <p className="text-text-muted text-lg mb-10">
          Have questions about a programme? Book a free consultation with our
          advisory team.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
