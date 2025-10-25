import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (level: string, message: string, data?: any) => {
  console.log(JSON.stringify({ level, message, data, timestamp: new Date().toISOString() }));
};

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

    // Get health reminders due in 7, 3, and 1 day(s)
    const daysToCheck = [7, 3, 1];
    const healthRemindersToNotify = [];

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
          // Fetch pet and profile data separately
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
          // Fetch pet and profile data separately
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

    // Send emails for health reminders
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
        
        const emailResponse = await resend.emails.send({
          from: "PetLink ID <reminders@petlinkid.io>",
          to: [userEmail],
          subject: `Reminder: ${reminder.title} for ${petName} is due ${daysText}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Pet Health Reminder</h2>
              <p>Hi ${userName},</p>
              <p>This is a friendly reminder that <strong>${reminder.title}</strong> for your ${petSpecies}, <strong>${petName}</strong>, is due <strong>${daysText}</strong>.</p>
              ${reminder.description ? `<p><strong>Details:</strong> ${reminder.description}</p>` : ''}
              <p><strong>Due Date:</strong> ${new Date(reminder.reminder_date).toLocaleDateString()}</p>
              <p>Log in to your PetLink ID account to manage your reminders.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                PetLink ID - Keep your pet's health on track<br>
                <a href="https://petlinkid.io">petlinkid.io</a>
              </p>
            </div>
          `,
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

    // Send emails for vaccinations
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
        
        const emailResponse = await resend.emails.send({
          from: "PetLink ID <reminders@petlinkid.io>",
          to: [userEmail],
          subject: `Reminder: ${vaccination.vaccine_name} vaccination for ${petName} is due ${daysText}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Vaccination Reminder</h2>
              <p>Hi ${userName},</p>
              <p>This is a friendly reminder that the <strong>${vaccination.vaccine_name}</strong> vaccination for your ${petSpecies}, <strong>${petName}</strong>, is due <strong>${daysText}</strong>.</p>
              ${vaccination.notes ? `<p><strong>Notes:</strong> ${vaccination.notes}</p>` : ''}
              <p><strong>Due Date:</strong> ${new Date(vaccination.next_due_date).toLocaleDateString()}</p>
              <p>Log in to your PetLink ID account to manage your vaccination records.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                PetLink ID - Keep your pet's health on track<br>
                <a href="https://petlinkid.io">petlinkid.io</a>
              </p>
            </div>
          `,
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
