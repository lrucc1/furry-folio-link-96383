import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, MessageCircle } from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create a pet profile?",
        a: "Simply sign up for a free account, then click 'Add Pet' from your dashboard. Fill in your pet's information including name, species, breed, and any important medical details. You can also upload photos to help identify your pet."
      },
      {
        q: "Is PetLinkID really free?",
        a: "Yes! Our Free plan includes 1 pet profile, basic health tracking, and lost pet recovery tools. Pro plan unlocks unlimited pets, health reminders, family sharing, and advanced features."
      },
      {
        q: "How does the QR code work?",
        a: "Each pet gets a unique QR code that anyone can scan with their smartphone. When scanned, it shows your pet's public profile with your chosen contact information, making it easy for someone to help return your lost pet."
      }
    ]
  },
  {
    category: "Features & Plans",
    questions: [
      {
        q: "What's included in the Pro plan?",
        a: "Pro plan includes unlimited pet profiles, health reminders, family sharing with caregivers, VetShare for medical records, document storage, and priority support. You also get a 7-day free trial to test all features."
      },
      {
        q: "Can I share my pet's information with family members?",
        a: "Yes! With the Pro plan, you can share all-in-one access to pet profiles, documents, health reminders, and vet records with family members, caregivers, babysitters, and emergency contacts."
      },
      {
        q: "How do health reminders work?",
        a: "Pro users can set up automated reminders for vaccinations, medications, vet appointments, and other important pet care tasks. You'll receive notifications to ensure you never miss an important date."
      },
      {
        q: "What is VetShare?",
        a: "VetShare lets you share your pet's medical records with veterinarians via QR code for seamless healthcare coordination. Your vet can access vaccination history, medications, and important health information instantly."
      }
    ]
  },
  {
    category: "Lost Pet Recovery",
    questions: [
      {
        q: "What happens if my pet goes missing?",
        a: "Anyone who finds your pet can scan their QR tag to instantly see your contact information and your pet's profile. You can also create shareable lost pet alerts and posters with your pet's digital ID, QR code, location, and contact information."
      },
      {
        q: "Do I need to buy special tags?",
        a: "Smart QR tags are coming soon! In the meantime, you can print your pet's QR code and attach it to their existing collar, or display it on your phone when needed."
      },
      {
        q: "Can anyone access my personal information?",
        a: "No. Only the contact information you choose to make public is shown on your pet's QR profile. You control what information is visible to help someone return your pet safely."
      }
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel your Pro subscription at any time from your billing settings. You'll continue to have Pro access until the end of your billing period, then automatically switch to the Free plan."
      },
      {
        q: "What happens if I downgrade to Free with multiple pets?",
        a: "The Free plan allows only 1 pet profile. Before downgrading, you'll need to download your pet data as a backup, then delete pets until you're within the 1-pet limit."
      },
      {
        q: "How do I update my billing information?",
        a: "Go to Settings > Billing to access the Stripe Customer Portal where you can update payment methods, view invoices, and manage your subscription."
      },
      {
        q: "What is your refund policy?",
        a: "We offer a 7-day free trial for Pro plan. If you're not satisfied, you can cancel during the trial with no charges. For refund requests after the trial, please contact our support team."
      }
    ]
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "How is my pet's data protected?",
        a: "We use bank-level encryption to protect all your pet's information. Your data is stored securely in the cloud with regular backups. We never share or sell your information to third parties."
      },
      {
        q: "Can I export my pet's data?",
        a: "Yes! You can download all your pet's information including profiles, health records, documents, and photos from Settings > Export Data. We provide your data in a standard format you can use anywhere."
      },
      {
        q: "Is my data backed up?",
        a: "Yes, all your pet's information is automatically backed up in our secure cloud storage. You can access it from any device, and it's safe even if you lose your phone."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="text-center mb-12">
          <Badge className="mb-4">Support</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about PetLinkID features, plans, and how to keep your pets safe.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section, idx) => (
            <Card key={idx} className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left font-semibold text-foreground">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-primary text-white border-0">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
            <p className="mb-6 text-white/90">
              Our support team is here to help you and your pets.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
