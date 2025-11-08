import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (level: string, message: string, data?: any) => {
  console.log(JSON.stringify({ level, message, data, timestamp: new Date().toISOString() }));
};

const APP_URL = Deno.env.get("APP_URL") || "https://petlinkid.io";

// Helper function to generate health reminder HTML
const generateHealthReminderHTML = (params: {
  userName: string;
  petName: string;
  petSpecies: string;
  reminderTitle: string;
  reminderDescription?: string;
  dueDate: string;
  daysText: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; margin-bottom: 64px;">
    <div style="padding: 32px 48px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">🐾 Pet Health Reminder</h1>
    </div>
    
    <div style="padding: 24px 48px;">
      <p style="font-size: 18px; font-weight: 600; color: #333333; margin: 0 0 16px;">Hi ${params.userName},</p>
      
      <p style="font-size: 16px; line-height: 24px; color: #525f7f; margin: 16px 0;">
        This is a friendly reminder that <strong>${params.reminderTitle}</strong> for your ${params.petSpecies}, <strong>${params.petName}</strong>, is due <strong>${params.daysText}</strong>.
      </p>
      
      ${params.reminderDescription ? `
      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
        <p style="font-size: 14px; font-weight: 600; color: #667eea; margin: 0 0 8px;">Details:</p>
        <p style="font-size: 15px; line-height: 22px; color: #525f7f; margin: 0;">${params.reminderDescription}</p>
      </div>
      ` : ''}
      
      <div style="background-color: #fff9e6; border: 1px solid #ffe066; padding: 16px 20px; margin: 16px 0; border-radius: 6px;">
        <p style="font-size: 15px; color: #333333; margin: 0;"><strong>Due Date:</strong> ${params.dueDate}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${APP_URL}/reminders" style="background-color: #667eea; border-radius: 8px; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          View All Reminders
        </a>
      </div>
      
      <p style="font-size: 16px; line-height: 24px; color: #525f7f; margin: 16px 0;">
        Log in to your PetLink ID account to manage your reminders and keep your pet's health on track.
      </p>
    </div>
    
    <div style="border-top: 1px solid #e6ebf1; padding: 20px 48px; text-align: center;">
      <p style="font-size: 14px; color: #525f7f; margin: 8px 0;"><strong>PetLink ID</strong> - Keep your pet's health on track</p>
      <p style="font-size: 14px; margin: 4px 0;"><a href="${APP_URL}" style="color: #667eea; text-decoration: none;">petlinkid.io</a></p>
      <p style="font-size: 12px; color: #8898aa; margin: 16px 0 0;">You're receiving this because you have health reminders enabled for your pets.</p>
    </div>
  </div>
</body>
</html>
`;

// Helper function to generate vaccination reminder HTML
const generateVaccinationReminderHTML = (params: {
  userName: string;
  petName: string;
  petSpecies: string;
  vaccineName: string;
  notes?: string;
  dueDate: string;
  daysText: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; margin-bottom: 64px;">
    <div style="padding: 32px 48px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">💉 Vaccination Reminder</h1>
    </div>
    
    <div style="padding: 24px 48px;">
      <p style="font-size: 18px; font-weight: 600; color: #333333; margin: 0 0 16px;">Hi ${params.userName},</p>
      
      <p style="font-size: 16px; line-height: 24px; color: #525f7f; margin: 16px 0;">
        This is a friendly reminder that the <strong>${params.vaccineName}</strong> vaccination for your ${params.petSpecies}, <strong>${params.petName}</strong>, is due <strong>${params.daysText}</strong>.
      </p>
      
      ${params.notes ? `
      <div style="background-color: #f8f9fa; border-left: 4px solid #f5576c; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
        <p style="font-size: 14px; font-weight: 600; color: #f5576c; margin: 0 0 8px;">Notes:</p>
        <p style="font-size: 15px; line-height: 22px; color: #525f7f; margin: 0;">${params.notes}</p>
      </div>
      ` : ''}
      
      <div style="background-color: #fff9e6; border: 1px solid #ffe066; padding: 16px 20px; margin: 16px 0; border-radius: 6px;">
        <p style="font-size: 15px; color: #333333; margin: 0;"><strong>Due Date:</strong> ${params.dueDate}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${APP_URL}/reminders" style="background-color: #f5576c; border-radius: 8px; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px; box-shadow: 0 4px 6px rgba(245, 87, 108, 0.3);">
          View Vaccination Records
        </a>
      </div>
      
      <p style="font-size: 16px; line-height: 24px; color: #525f7f; margin: 16px 0;">
        Keeping vaccinations up to date is crucial for your pet's health and wellbeing. Log in to your PetLink ID account to manage your vaccination records.
      </p>
    </div>
    
    <div style="border-top: 1px solid #e6ebf1; padding: 20px 48px; text-align: center;">
      <p style="font-size: 14px; color: #525f7f; margin: 8px 0;"><strong>PetLink ID</strong> - Keep your pet's health on track</p>
      <p style="font-size: 14px; margin: 4px 0;"><a href="${APP_URL}" style="color: #f5576c; text-decoration: none;">petlinkid.io</a></p>
      <p style="font-size: 12px; color: #8898aa; margin: 16px 0 0;">You're receiving this because you have vaccination reminders enabled for your pets.</p>
    </div>
  </div>
</body>
</html>
`;

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    log("info", "Starting reminder email send process");

    const daysToCheck = [7, 3, 1];
    const healthRemindersToNotify = [];

    // Get health reminders due in 7, 3, and 1 day(s)
    for (const days of daysToCheck) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const { data: reminders, error: reminderError } = await supabase
        .from('health_reminders')
        .select('*')
        .eq('reminder_date', targetDateStr)
        .eq('completed', false);

      if (reminderError) {
        log("error", "Error fetching health reminders", { error: reminderError, days });
        continue;
      }

      if (reminders && reminders.length > 0) {
        for (const reminder of reminders) {
          // Check if notification already sent for this days_before value
          const { data: existingNotification } = await supabase
            .from('reminder_notifications')
            .select('id')
            .eq('reminder_id', reminder.id)
            .eq('days_before', days)
            .eq('reminder_type', 'health_reminder')
            .single();

          // Skip if already notified for this time period
          if (existingNotification) {
            log("info", "Notification already sent", { reminder_id: reminder.id, days_before: days });
            continue;
          }

          // Fetch pet and profile data
          const { data: pet } = await supabase
            .from('pets')
            .select('name, species')
            .eq('id', reminder.pet_id)
            .single();
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('id', reminder.user_id)
            .single();

          healthRemindersToNotify.push({ 
            ...reminder, 
            days_before: days,
            pet_name: pet?.name,
            pet_species: pet?.species,
            user_email: profile?.email,
            user_name: profile?.display_name
          });
        }
      }
    }

    // Get vaccinations due in 7, 3, and 1 day(s)
    const vaccinationsToNotify = [];

    for (const days of daysToCheck) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const { data: vaccinations, error: vaccinationError } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('next_due_date', targetDateStr);

      if (vaccinationError) {
        log("error", "Error fetching vaccinations", { error: vaccinationError, days });
        continue;
      }

      if (vaccinations && vaccinations.length > 0) {
        for (const vaccination of vaccinations) {
          // Check if notification already sent for this days_before value
          const { data: existingNotification } = await supabase
            .from('reminder_notifications')
            .select('id')
            .eq('reminder_id', vaccination.id)
            .eq('days_before', days)
            .eq('reminder_type', 'vaccination')
            .single();

          // Skip if already notified for this time period
          if (existingNotification) {
            log("info", "Notification already sent", { vaccination_id: vaccination.id, days_before: days });
            continue;
          }

          // Fetch pet and profile data
          const { data: pet } = await supabase
            .from('pets')
            .select('name, species')
            .eq('id', vaccination.pet_id)
            .single();
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('id', vaccination.user_id)
            .single();

          vaccinationsToNotify.push({ 
            ...vaccination, 
            days_before: days,
            pet_name: pet?.name,
            pet_species: pet?.species,
            user_email: profile?.email,
            user_name: profile?.display_name
          });
        }
      }
    }

    log("info", "Found reminders to process", {
      healthReminders: healthRemindersToNotify.length,
      vaccinations: vaccinationsToNotify.length
    });

    let emailsSent = 0;
    let notificationsCreated = 0;

    // Send emails for health reminders with branded templates
    for (const reminder of healthRemindersToNotify) {
      try {
        const userEmail = reminder.user_email;
        const userName = reminder.user_name || 'Pet Owner';
        const petName = reminder.pet_name || 'Your pet';
        const petSpecies = reminder.pet_species || 'pet';

        if (!userEmail) {
          log("warn", "No email found for user", { reminder_id: reminder.id });
          continue;
        }

        const daysText = reminder.days_before === 1 ? 'tomorrow' : `in ${reminder.days_before} days`;
        const dueDate = new Date(reminder.reminder_date).toLocaleDateString();

        // Generate HTML email
        const html = generateHealthReminderHTML({
          userName,
          petName,
          petSpecies,
          reminderTitle: reminder.title,
          reminderDescription: reminder.description || undefined,
          dueDate,
          daysText,
        });
        
        const emailResponse = await resend.emails.send({
          from: "PetLink ID <reminders@petlinkid.io>",
          to: [userEmail],
          subject: `Reminder: ${reminder.title} for ${petName} is due ${daysText}`,
          html,
        });

        log("info", "Health reminder email sent", { reminder_id: reminder.id, email: userEmail });
        emailsSent++;

        // Create notification record
        const { error: notificationError } = await supabase
          .from('reminder_notifications')
          .insert({
            reminder_id: reminder.id,
            pet_id: reminder.pet_id,
            user_id: reminder.user_id,
            days_before: reminder.days_before,
            notification_type: 'email',
            reminder_type: 'health_reminder',
            status: 'sent'
          });

        if (notificationError) {
          log("error", "Error creating notification record", { error: notificationError });
        } else {
          notificationsCreated++;
        }

        // Update last notification sent timestamp
        await supabase
          .from('health_reminders')
          .update({ 
            last_notification_sent_at: new Date().toISOString(),
            next_notification_at: new Date(reminder.reminder_date).toISOString()
          })
          .eq('id', reminder.id);

      } catch (error) {
        log("error", "Error processing health reminder", { error, reminder_id: reminder.id });
      }
    }

    // Send emails for vaccinations with branded templates
    for (const vaccination of vaccinationsToNotify) {
      try {
        const userEmail = vaccination.user_email;
        const userName = vaccination.user_name || 'Pet Owner';
        const petName = vaccination.pet_name || 'Your pet';
        const petSpecies = vaccination.pet_species || 'pet';

        if (!userEmail) {
          log("warn", "No email found for user", { vaccination_id: vaccination.id });
          continue;
        }

        const daysText = vaccination.days_before === 1 ? 'tomorrow' : `in ${vaccination.days_before} days`;
        const dueDate = new Date(vaccination.next_due_date).toLocaleDateString();

        // Generate HTML email
        const html = generateVaccinationReminderHTML({
          userName,
          petName,
          petSpecies,
          vaccineName: vaccination.vaccine_name,
          notes: vaccination.notes || undefined,
          dueDate,
          daysText,
        });
        
        const emailResponse = await resend.emails.send({
          from: "PetLink ID <reminders@petlinkid.io>",
          to: [userEmail],
          subject: `Reminder: ${vaccination.vaccine_name} vaccination for ${petName} is due ${daysText}`,
          html,
        });

        log("info", "Vaccination email sent", { vaccination_id: vaccination.id, email: userEmail });
        emailsSent++;

        // Create notification record
        const { error: notificationError } = await supabase
          .from('reminder_notifications')
          .insert({
            reminder_id: vaccination.id,
            pet_id: vaccination.pet_id,
            user_id: vaccination.user_id,
            days_before: vaccination.days_before,
            notification_type: 'email',
            reminder_type: 'vaccination',
            status: 'sent'
          });

        if (notificationError) {
          log("error", "Error creating notification record", { error: notificationError });
        } else {
          notificationsCreated++;
        }

        // Update last notification sent timestamp
        await supabase
          .from('vaccinations')
          .update({ 
            last_notification_sent_at: new Date().toISOString(),
            next_notification_at: new Date(vaccination.next_due_date).toISOString()
          })
          .eq('id', vaccination.id);

      } catch (error) {
        log("error", "Error processing vaccination", { error, vaccination_id: vaccination.id });
      }
    }

    log("info", "Reminder email send process completed", { emailsSent, notificationsCreated });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        notificationsCreated,
        healthReminders: healthRemindersToNotify.length,
        vaccinations: vaccinationsToNotify.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    log("error", "Unexpected error in send-reminder-emails", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
