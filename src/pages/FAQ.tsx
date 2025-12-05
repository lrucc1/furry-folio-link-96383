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
    category: "Pet Profiles",
    questions: [
      {
        q: "What can I store in a pet profile?",
        a: "Pet profiles let you store complete information about your pet including their name, species, breed, birth date, weight, microchip number, photos, and detailed medical records. Everything is stored securely in one place and accessible from any device."
      },
      {
        q: "How many pet profiles can I create?",
        a: "The Free plan includes 1 pet profile. Pro plan users get unlimited pet profiles, perfect for multi-pet households or professional pet caregivers."
      },
      {
        q: "Can I add multiple photos to my pet's profile?",
        a: "Yes! You can upload multiple photos to help identify your pet. Clear photos from different angles are especially helpful if your pet ever goes missing."
      }
    ]
  },
  {
    category: "Smart Tags & QR Codes",
    questions: [
      {
        q: "How do Smart Tags work?",
        a: "Each pet gets a unique QR code that anyone can scan with their smartphone. When scanned, it shows your pet's public profile with your chosen contact information, making it easy for someone to help return your lost pet. Physical Smart QR tags are coming soon!"
      },
      {
        q: "Do I need special equipment to scan the QR code?",
        a: "No! Any smartphone camera can scan the QR code. Just point the camera at the code and tap the notification that appears."
      },
      {
        q: "Can I print my pet's QR code?",
        a: "Yes! You can print your pet's QR code and attach it to their existing collar. Physical Smart Tags with durable QR codes are coming soon for purchase."
      }
    ]
  },
  {
    category: "VetShare",
    questions: [
      {
        q: "What is VetShare?",
        a: "VetShare is a Pro feature that lets you share your pet's complete medical records with veterinarians via QR code. Your vet can instantly access vaccination history, medications, allergies, and important health information for seamless healthcare coordination."
      },
      {
        q: "How do I share records with my vet?",
        a: "Simply show your vet the VetShare QR code from your pet's profile. They can scan it with any smartphone to instantly access all shared medical information - no app download required."
      },
      {
        q: "Can I control what information vets see?",
        a: "Yes! You have full control over what medical information is shared via VetShare. You can choose to share specific vaccinations, medications, or health conditions."
      }
    ]
  },
  {
    category: "Health Reminders",
    questions: [
      {
        q: "How do health reminders work?",
        a: "Pro users can set up automated reminders for vaccinations, medications, vet appointments, flea/tick treatments, and other important pet care tasks. You'll receive notifications via email or push notifications to ensure you never miss an important date."
      },
      {
        q: "Can I set recurring reminders?",
        a: "Yes! You can set one-time reminders for specific dates or recurring reminders for regular medications, monthly treatments, or annual vaccinations."
      },
      {
        q: "Will other family members get reminder notifications?",
        a: "When you share your pet's profile with family members using Family Sharing, they can also receive health reminder notifications, ensuring everyone stays informed about your pet's care schedule."
      }
    ]
  },
  {
    category: "Family Sharing",
    questions: [
      {
        q: "What is Family Sharing?",
        a: "Family Sharing is a Pro feature that lets you give all-in-one access to pet profiles, documents, health reminders, and vet records to family members, caregivers, babysitters, and emergency contacts. Everyone stays informed about your pet's care."
      },
      {
        q: "How many people can I share with?",
        a: "You can invite multiple family members and caregivers to access your pet's information. There's no limit on the number of people you can share with on the Pro plan."
      },
      {
        q: "Can I control what shared users can do?",
        a: "Yes! When inviting someone, you can set their permission level. You can grant full access to edit and manage everything, or view-only access for caregivers who just need to see information."
      },
      {
        q: "Can shared users add their own pets?",
        a: "Each user needs their own PetLinkID account and subscription for their pets. Family Sharing is for giving access to YOUR pet profiles to others, not for creating shared accounts."
      }
    ]
  },
  {
    category: "Registry Links",
    questions: [
      {
        q: "What are Registry Links?",
        a: "Registry Links provide quick access to official microchip registries like AAHA Pet Microchip Lookup, PetLink, HomeAgain, and Found Animals Registry. This helps you easily update your contact information and verify your pet's microchip registration."
      },
      {
        q: "Does PetLinkID replace microchip registration?",
        a: "No, PetLinkID complements microchip registration by providing an easy way to access and manage your registry information. We recommend keeping both your microchip registry AND PetLinkID profile up to date."
      },
      {
        q: "Do I need a microchip to use PetLinkID?",
        a: "No! PetLinkID works independently of microchips. While microchips require special scanners that vets and shelters have, PetLinkID's QR codes can be scanned by anyone with a smartphone."
      }
    ]
  },
  {
    category: "Lost Pet Recovery",
    questions: [
      {
        q: "What happens if my pet goes missing?",
        a: "You can instantly create shareable lost pet alerts and posters using your pet's digital ID and QR code with location and contact information. Anyone who finds your pet can scan their QR tag to see your contact information and your pet's profile."
      },
      {
        q: "How do lost pet posters work?",
        a: "PetLinkID automatically generates professional lost pet posters with your pet's photo, description, QR code, last known location, and your contact information. You can download and print them or share them digitally on social media."
      },
      {
        q: "Can anyone access my personal information?",
        a: "No. Only the contact information you choose to make public is shown on your pet's QR profile. You control what information is visible to help someone return your pet safely."
      },
      {
        q: "Is this feature available on the Free plan?",
        a: "Yes! Lost Pet alerts and posters are available on both Free and Pro plans. Keeping pets safe is our top priority."
      }
    ]
  },
  {
    category: "Cross Platform Access",
    questions: [
      {
        q: "What devices can I use PetLinkID on?",
        a: "PetLinkID works on iOS and any web browser. Your pet's information is automatically synced across all your devices, so you can access it anywhere."
      },
      {
        q: "Do I need to install an app?",
        a: "You can use PetLinkID directly in your web browser, or download our iOS app for a native experience with push notifications. Note that Pro upgrades are only available through the iOS app."
      },
      {
        q: "Is my data synced between devices?",
        a: "Yes! All your pet's information is stored securely in the cloud and automatically synced across all your devices. Changes you make on one device are instantly available on all others."
      }
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      {
        q: "How do I upgrade to Pro?",
        a: "To upgrade to PetLinkID Pro: 1) Download the PetLinkID app on your iPhone. 2) Sign in or create your account. 3) Go to Settings → Plan & billing, then choose a Pro plan. 4) Confirm your subscription using your Apple ID. All payments are processed securely by Apple."
      },
      {
        q: "Can I upgrade from the website?",
        a: "Currently, Pro subscriptions are only available via the iOS app using Apple In-App Purchases. The web experience is designed for QR tag scanning, accessing pet profiles, and quick account management. Once you upgrade via the iOS app, your Pro features will be available when you sign in on the web."
      },
      {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel your Pro subscription at any time from your iPhone's Settings → Apple ID → Subscriptions. You'll continue to have Pro access until the end of your billing period, then automatically switch to the Free plan."
      },
      {
        q: "What happens if I downgrade to Free with multiple pets?",
        a: "The Free plan allows only 1 pet profile. Before downgrading, you'll need to download your pet data as a backup, then delete pets until you're within the 1-pet limit."
      },
      {
        q: "How do I update my billing information?",
        a: "Your subscription is managed by Apple. Go to Settings → Apple ID → Subscriptions on your iPhone to update payment methods or manage your subscription."
      },
      {
        q: "What is your refund policy?",
        a: "We offer a 7-day free trial for the Pro plan. If you're not satisfied, you can cancel during the trial with no charges. For refund requests after the trial, please contact Apple Support through the App Store as they handle all billing for in-app purchases."
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
            <Card key={idx} id={section.category.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')} className="bg-gradient-card border-0 shadow-soft scroll-mt-20">
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
    </div>
  );
}
